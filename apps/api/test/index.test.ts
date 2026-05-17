import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

// Set test environment before importing app
process.env.NODE_ENV = 'test';
process.env.API_KEY = 'test-api-key';
process.env.SUMSUB_APP_TOKEN = '';
process.env.SUMSUB_SECRET_KEY = '';
process.env.SUMSUB_WEBHOOK_SECRET = 'test-webhook-secret';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// Import app after env setup
const { app } = await import('../src/index');

// ──────────────────────────────────────────────────────────────────
// KUMPLY API Tests — validates endpoints without hitting Sumsub
// ──────────────────────────────────────────────────────────────────

describe('@kumply/api', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      // May be 200 (ok) or 503 (degraded) depending on Fuji connectivity
      expect([200, 503]).toContain(res.status);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('timestamp');
      expect(['ok', 'degraded']).toContain(res.body.status);
    });

    it('should include network info when healthy', async () => {
      const res = await request(app).get('/health');
      if (res.status === 200) {
        expect(res.body.network).toHaveProperty('name', 'Avalanche Fuji Testnet');
        expect(res.body.network).toHaveProperty('chainId', 43113);
        expect(res.body.network).toHaveProperty('blockNumber');
        expect(res.body.contracts).toHaveProperty('attestationStore');
      }
    });

    it('should include sumsub configuration status', async () => {
      const res = await request(app).get('/health');
      if (res.status === 200) {
        expect(res.body).toHaveProperty('sumsub');
        expect(res.body.sumsub).toHaveProperty('configured');
        expect(typeof res.body.sumsub.configured).toBe('boolean');
      }
    });
  });

  describe('POST /api/token', () => {
    it('should reject request without API key', async () => {
      const res = await request(app)
        .post('/api/token')
        .send({ userId: '0xD65042534CE80fcb641fd6Eb99a16eBF6C0cd076', levelName: 'standard-kyc' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should reject request with wrong API key', async () => {
      const res = await request(app)
        .post('/api/token')
        .set('X-API-Key', 'wrong-key')
        .send({ userId: '0xD65042534CE80fcb641fd6Eb99a16eBF6C0cd076', levelName: 'standard-kyc' });
      expect(res.status).toBe(401);
    });

    it('should reject missing userId', async () => {
      const res = await request(app)
        .post('/api/token')
        .set('X-API-Key', 'test-api-key')
        .send({ levelName: 'standard-kyc' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject missing levelName', async () => {
      const res = await request(app)
        .post('/api/token')
        .set('X-API-Key', 'test-api-key')
        .send({ userId: '0xD65042534CE80fcb641fd6Eb99a16eBF6C0cd076' });
      expect(res.status).toBe(400);
    });

    it('should reject empty userId', async () => {
      const res = await request(app)
        .post('/api/token')
        .set('X-API-Key', 'test-api-key')
        .send({ userId: '', levelName: 'standard-kyc' });
      expect(res.status).toBe(400);
    });

    it('should return 500 when Sumsub credentials not configured', async () => {
      const res = await request(app)
        .post('/api/token')
        .set('X-API-Key', 'test-api-key')
        .send({ userId: '0xD65042534CE80fcb641fd6Eb99a16eBF6C0cd076', levelName: 'standard-kyc' });
      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Sumsub credentials not configured');
    });
  });

  describe('POST /webhook/sumsub', () => {
    it('should reject request without HMAC signature', async () => {
      const res = await request(app)
        .post('/webhook/sumsub')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ reviewResult: { reviewAnswer: 'GREEN' } }));
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid signature');
    });

    it('should reject request with invalid HMAC signature', async () => {
      const res = await request(app)
        .post('/webhook/sumsub')
        .set('Content-Type', 'application/json')
        .set('x-payload-digest', 'invalid-signature')
        .send(JSON.stringify({ reviewResult: { reviewAnswer: 'GREEN' } }));
      expect(res.status).toBe(401);
    });

    it('should accept valid HMAC and non-GREEN answer with 200', async () => {
      const crypto = await import('crypto');
      const body = JSON.stringify({
        applicantId: 'test-123',
        externalUserId: '0xD65042534CE80fcb641fd6Eb99a16eBF6C0cd076',
        levelName: 'standard-kyc',
        reviewResult: { reviewAnswer: 'RED' },
      });
      const hmac = crypto.createHmac('sha256', 'test-webhook-secret');
      hmac.update(body);
      const signature = hmac.digest('hex');

      const res = await request(app)
        .post('/webhook/sumsub')
        .set('Content-Type', 'application/json')
        .set('x-payload-digest', signature)
        .send(body);
      expect(res.status).toBe(200);
      expect(res.text).toBe('OK');
    });
  });

  describe('GET /api/fee', () => {
    it('should return fee data or an error when contract not configured', async () => {
      const res = await request(app).get('/api/fee');
      // 200 = contract configured and call succeeds
      // 500 = contract configured but call fails (e.g. old contract without verificationFee)
      // 503 = contract address not set at all
      expect([200, 500, 503]).toContain(res.status);
    });

    it('should return structured fee fields when contract is configured', async () => {
      const res = await request(app).get('/api/fee');
      if (res.status === 200) {
        expect(res.body).toHaveProperty('verificationFeeWei');
        expect(res.body).toHaveProperty('verificationFeeAvax');
        expect(res.body).toHaveProperty('totalFeesCollectedWei');
        expect(res.body).toHaveProperty('totalFeesCollectedAvax');
        expect(res.body).toHaveProperty('freeForUnverified', true);
        expect(typeof res.body.verificationFeeWei).toBe('string');
        expect(typeof res.body.verificationFeeAvax).toBe('string');
      }
    });
  });

  describe('GET /api/attestation/:address', () => {
    it('should reject invalid address format', async () => {
      const res = await request(app).get('/api/attestation/not-an-address');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid Ethereum address format');
    });

    it('should reject address without 0x prefix', async () => {
      const res = await request(app).get('/api/attestation/D65042534CE80fcb641fd6Eb99a16eBF6C0cd076');
      expect(res.status).toBe(400);
    });

    it('should accept valid address and return attestation data', async () => {
      const res = await request(app).get('/api/attestation/0xD65042534CE80fcb641fd6Eb99a16eBF6C0cd076');
      // May succeed (200) or fail (503) depending on contract config
      expect([200, 500, 503]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('address');
        expect(res.body).toHaveProperty('verified');
        expect(res.body).toHaveProperty('tier');
      }
    });
  });
});
