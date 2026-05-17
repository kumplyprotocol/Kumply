import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { z } from 'zod';
import crypto from 'crypto';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalancheFuji } from 'viem/chains';
import { KumplyClient, ATTESTATION_STORE_ABI } from '@kumply/sdk';

dotenv.config({ path: '../../.env' });

// ──────────────────────────────────────────────────────────────────
// Structured logger — timestamped JSON for audit trail
// ──────────────────────────────────────────────────────────────────
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'AUDIT';

function log(level: LogLevel, event: string, data?: Record<string, unknown>) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...data,
  };
  if (level === 'ERROR') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

// ──────────────────────────────────────────────────────────────────
// Tier mapping — Sumsub level names → on-chain tier numbers
// ──────────────────────────────────────────────────────────────────
const LEVEL_TO_TIER: Record<string, number> = {
  'basic-kyc': 1,
  'standard-kyc': 2,
  'enhanced-kyc': 3,
  'business-kyb': 4,
  'agent-kya': 5,
};

// ──────────────────────────────────────────────────────────────────
// App setup
// ──────────────────────────────────────────────────────────────────
const app = express();

// Trust proxy (needed for Railway/Render rate limiting by real IP)
app.set('trust proxy', 1);

// ──────────────────────────────────────────────────────────────────
// CORS — supports multiple origins via comma-separated env var
// e.g. CORS_ORIGIN=https://kumply.xyz,https://www.kumply.xyz
// ──────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-API-Key'],
}));

// Raw body needed for Sumsub HMAC verification
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Security headers — Avalanche ecosystem best practice
app.use(helmet({
  contentSecurityPolicy: false, // handled by Vercel for frontend
  crossOriginEmbedderPolicy: false,
}));

// ──────────────────────────────────────────────────────────────────
// Rate Limiting
// ──────────────────────────────────────────────────────────────────
const tokenLimiter = rateLimit({
  windowMs: 60 * 1000,    // 1 minute
  max: 20,                 // 20 token requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,               // Sumsub can send bursts; generous limit
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many webhook calls.' },
});

const healthLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// ──────────────────────────────────────────────────────────────────
// API Key middleware — protects public SDK token endpoint
// ──────────────────────────────────────────────────────────────────
function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = process.env.API_KEY;
  if (!apiKey) { next(); return; }
  const provided = req.headers['x-api-key'];
  if (provided !== apiKey) {
    log('WARN', 'api_key_rejected', { ip: req.ip, path: req.path });
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

// ──────────────────────────────────────────────────────────────────
// On-chain clients
// ──────────────────────────────────────────────────────────────────
const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
const contractAddress = process.env.CONTRACT_ATTESTATION_STORE as `0x${string}`;
const complianceGateAddress = process.env.CONTRACT_COMPLIANCE_GATE as `0x${string}`;

if (!privateKey) log('WARN', 'startup', { msg: 'DEPLOYER_PRIVATE_KEY not set — webhook issuance disabled' });
if (!contractAddress) log('WARN', 'startup', { msg: 'CONTRACT_ATTESTATION_STORE not set' });

const account = privateKey ? privateKeyToAccount(privateKey) : undefined;

const walletClient = account ? createWalletClient({
  account,
  chain: avalancheFuji,
  transport: http(process.env.FUJI_RPC_URL),
}) : null;

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.FUJI_RPC_URL),
});

const kumplyClient = contractAddress ? new KumplyClient({
  network: 'fuji',
  contractAddress,
  rpcUrl: process.env.FUJI_RPC_URL,
}) : null;

// ──────────────────────────────────────────────────────────────────
// In-session idempotency cache
// Primary guard: on-chain verify() check (persistent across restarts)
// Secondary guard: this Map prevents concurrent duplicate processing
// TTL cleanup prevents memory leaks on long-running servers
// ──────────────────────────────────────────────────────────────────
const processingApplicants = new Map<string, number>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, ts] of processingApplicants) {
    if (now - ts > 5 * 60 * 1000) processingApplicants.delete(key);
  }
}, 5 * 60 * 1000);

// ──────────────────────────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────────────────────────
const TokenRequestSchema = z.object({
  userId: z.string().min(1).max(200),
  levelName: z.string().min(1).max(100),
});

// ──────────────────────────────────────────────────────────────────
// Sumsub HMAC signature helper
// ──────────────────────────────────────────────────────────────────
function createSumsubSignature(config: {
  method: string;
  url: string;
  ts: number;
  body?: unknown;
}): string {
  const hmac = crypto.createHmac('sha256', process.env.SUMSUB_SECRET_KEY || '');
  hmac.update(config.ts + config.method + config.url);
  if (config.body) hmac.update(JSON.stringify(config.body));
  return hmac.digest('hex');
}

// ──────────────────────────────────────────────────────────────────
// GET / — API root redirect
// ──────────────────────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.redirect('/health');
});

// ──────────────────────────────────────────────────────────────────
// POST /api/token — generate Sumsub SDK token for frontend
// ──────────────────────────────────────────────────────────────────
app.post('/api/token', tokenLimiter, requireApiKey, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, levelName } = TokenRequestSchema.parse(req.body);

    if (!process.env.SUMSUB_APP_TOKEN || !process.env.SUMSUB_SECRET_KEY) {
      log('ERROR', 'token_missing_credentials');
      res.status(500).json({ error: 'Sumsub credentials not configured' });
      return;
    }

    const ts = Math.floor(Date.now() / 1000);
    const url = `/resources/accessTokens?userId=${encodeURIComponent(userId)}&levelName=${encodeURIComponent(levelName)}`;
    const signature = createSumsubSignature({ method: 'POST', url, ts });

    const response = await fetch(`${process.env.SUMSUB_BASE_URL || 'https://api.sumsub.com'}${url}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-App-Token': process.env.SUMSUB_APP_TOKEN,
        'X-App-Access-Sig': signature,
        'X-App-Access-Ts': ts.toString(),
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      log('ERROR', 'sumsub_token_error', { status: response.status, body: errText });
      throw new Error(`Sumsub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    log('INFO', 'token_issued', { userId: userId.slice(0, 10) + '...', levelName });
    res.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request', details: error.errors });
    } else {
      log('ERROR', 'token_exception', { message: String(error) });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// ──────────────────────────────────────────────────────────────────
// POST /webhook/sumsub — receive KYC approval and issue attestation
// ──────────────────────────────────────────────────────────────────
app.post('/webhook/sumsub', webhookLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Always verify HMAC — no dev bypass
    const signature = req.headers['x-payload-digest'] as string | undefined;
    const secret = process.env.SUMSUB_WEBHOOK_SECRET || process.env.SUMSUB_SECRET_KEY || '';

    if (!secret) {
      log('ERROR', 'webhook_no_secret');
      res.status(500).json({ error: 'Webhook secret not configured' });
      return;
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(req.body);
    const calculated = hmac.digest('hex');

    if (!signature || signature !== calculated) {
      log('WARN', 'webhook_invalid_signature', { provided: signature?.slice(0, 10) });
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    const payload = JSON.parse(req.body.toString());
    const { reviewResult, applicantId, externalUserId, levelName } = payload;

    log('INFO', 'webhook_received', {
      applicantId,
      reviewAnswer: reviewResult?.reviewAnswer,
      levelName,
    });

    // 2. Only process GREEN (approved) results
    if (reviewResult?.reviewAnswer !== 'GREEN') {
      res.status(200).send('OK');
      return;
    }

    if (!walletClient || !account || !kumplyClient) {
      log('ERROR', 'webhook_no_signer', { applicantId });
      res.status(503).json({ error: 'Attestation issuance not configured' });
      return;
    }

    // 3. Mark as processing BEFORE async work — prevents concurrent duplicates
    if (processingApplicants.has(applicantId)) {
      log('INFO', 'webhook_duplicate_skipped', { applicantId });
      res.status(200).send('OK');
      return;
    }
    processingApplicants.set(applicantId, Date.now());

    // 4. On-chain idempotency check — handles server restarts
    const alreadyVerified = await kumplyClient.isVerified(externalUserId);
    if (alreadyVerified) {
      log('INFO', 'webhook_already_attested', { address: externalUserId, applicantId });
      res.status(200).send('OK');
      return;
    }

    // 5. Determine tier from Sumsub level name
    if (!(levelName in LEVEL_TO_TIER)) {
      log('WARN', 'webhook_unknown_level', { levelName, applicantId, defaultTier: 1 });
    }
    const tier = LEVEL_TO_TIER[levelName] ?? 1;

    // 6. 1-year expiry from now
    const expiry = BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60);

    // 7. Submit and wait for on-chain confirmation
    log('AUDIT', 'attestation_issuing', {
      address: externalUserId,
      tier,
      levelName,
      applicantId,
      expiry: expiry.toString(),
    });

    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: ATTESTATION_STORE_ABI,
      functionName: 'issueAttestation',
      args: [externalUserId as `0x${string}`, tier, expiry],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    log('AUDIT', 'attestation_confirmed', {
      address: externalUserId,
      tier,
      applicantId,
      txHash,
      blockNumber: receipt.blockNumber.toString(),
      gasUsed: receipt.gasUsed.toString(),
    });

    res.status(200).send('OK');
  } catch (error) {
    log('ERROR', 'webhook_exception', { message: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ──────────────────────────────────────────────────────────────────
// GET /health — real connectivity check against Fuji + contracts
// ──────────────────────────────────────────────────────────────────
app.get('/health', healthLimiter, async (_req: Request, res: Response): Promise<void> => {
  try {
    const [blockNumber, totalAttestations, verificationFeeWei] = await Promise.all([
      publicClient.getBlockNumber(),
      kumplyClient ? kumplyClient.getTotalAttestations().catch(() => null) : Promise.resolve(null),
      // Falls back to 0n if contract predates the fee model (verificationFee not deployed yet)
      kumplyClient ? kumplyClient.getVerificationFee().catch(() => 0n) : Promise.resolve(null),
    ]);

    const feeAvax = verificationFeeWei !== null
      ? (Number(verificationFeeWei) / 1e18).toFixed(4)
      : null;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      network: {
        name: 'Avalanche Fuji Testnet',
        chainId: 43113,
        blockNumber: blockNumber.toString(),
        rpc: process.env.FUJI_RPC_URL ? 'configured' : 'default',
      },
      contracts: {
        attestationStore: contractAddress || 'not configured',
        complianceGate: complianceGateAddress || 'not configured',
        totalAttestations,
      },
      fees: {
        verificationFeeWei: verificationFeeWei !== null ? verificationFeeWei.toString() : null,
        verificationFeeAvax: feeAvax,
      },
      verifier: account?.address || 'not configured',
      sumsub: {
        configured: !!(process.env.SUMSUB_APP_TOKEN && process.env.SUMSUB_SECRET_KEY),
        webhookSecret: !!process.env.SUMSUB_WEBHOOK_SECRET || !!process.env.SUMSUB_SECRET_KEY,
      },
    });
  } catch (error) {
    log('ERROR', 'health_check_failed', { message: String(error) });
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: 'Could not reach Avalanche Fuji RPC',
    });
  }
});

// ──────────────────────────────────────────────────────────────────
// GET /api/fee — live verification fee from AttestationStore
// ──────────────────────────────────────────────────────────────────
app.get('/api/fee', healthLimiter, async (_req: Request, res: Response): Promise<void> => {
  try {
    if (!kumplyClient) {
      res.status(503).json({ error: 'Contract not configured' });
      return;
    }

    const [verificationFeeWei, totalFeesCollectedWei] = await Promise.all([
      kumplyClient.getVerificationFee().catch(() => 0n),
      kumplyClient.getTotalFeesCollected().catch(() => 0n),
    ]);

    res.json({
      verificationFeeWei: verificationFeeWei.toString(),
      verificationFeeAvax: (Number(verificationFeeWei) / 1e18).toFixed(4),
      totalFeesCollectedWei: totalFeesCollectedWei.toString(),
      totalFeesCollectedAvax: (Number(totalFeesCollectedWei) / 1e18).toFixed(4),
      freeForUnverified: true,
    });
  } catch (error) {
    log('ERROR', 'fee_lookup_failed', { message: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ──────────────────────────────────────────────────────────────────
// GET /api/attestation/:address — public lookup for any address
// ──────────────────────────────────────────────────────────────────
app.get('/api/attestation/:address', healthLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      res.status(400).json({ error: 'Invalid Ethereum address format' });
      return;
    }

    if (!kumplyClient) {
      res.status(503).json({ error: 'Contract not configured' });
      return;
    }

    const result = await kumplyClient.verify(address);
    res.json({
      address,
      ...result,
      expiryDate: result.expiry ? new Date(result.expiry * 1000).toISOString() : null,
      issuedDate: result.timestamp ? new Date(result.timestamp * 1000).toISOString() : null,
    });
  } catch (error) {
    log('ERROR', 'attestation_lookup_failed', { address: req.params.address, message: String(error) });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ──────────────────────────────────────────────────────────────────
// Export for testing (supertest)
// ──────────────────────────────────────────────────────────────────
export { app };

// ──────────────────────────────────────────────────────────────────
// Startup — only when run directly (not imported by tests)
// ──────────────────────────────────────────────────────────────────
const port = process.env.API_PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(port, () => {
    log('INFO', 'startup', {
      port,
      verifier: account?.address || 'not configured',
      attestationStore: contractAddress || 'not configured',
      complianceGate: complianceGateAddress || 'not configured',
      corsOrigins: allowedOrigins,
    });
  });

  // ── Graceful shutdown — required for Railway/Docker deployments ──
  function shutdown(signal: string) {
    log('INFO', 'shutdown', { signal });
    server.close(() => {
      log('INFO', 'shutdown_complete');
      process.exit(0);
    });
    // Force exit after 10s if server doesn't close gracefully
    setTimeout(() => process.exit(1), 10000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
