import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { TokenRequestSchema, createRateLimiter, clientIp } from '@/lib/tokenRequest';

// Vercel: allow up to 15s for Sumsub API round-trip
export const maxDuration = 15;

// Same per-IP limit as the Express API's tokenLimiter: 20 token requests per minute.
const checkRateLimit = createRateLimiter({ windowMs: 60_000, max: 20 });

export async function POST(request: Request) {
  try {
    const ip = clientIp(request.headers);
    const limit = checkRateLimit(ip);
    if (!limit.allowed) {
      console.warn(JSON.stringify({ ts: new Date().toISOString(), level: 'WARN', event: 'token_rate_limited', ip }));
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = TokenRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues.map((i) => i.message) },
        { status: 400 }
      );
    }
    const { userId, levelName } = parsed.data;

    if (!process.env.SUMSUB_APP_TOKEN || !process.env.SUMSUB_SECRET_KEY) {
      return NextResponse.json({ error: 'Sumsub credentials not configured' }, { status: 500 });
    }

    const ts = Math.floor(Date.now() / 1000);
    const url = `/resources/accessTokens?userId=${encodeURIComponent(userId)}&levelName=${encodeURIComponent(levelName)}`;

    const hmac = crypto.createHmac('sha256', process.env.SUMSUB_SECRET_KEY);
    hmac.update(ts + 'POST' + url);
    const signature = hmac.digest('hex');

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
      console.error(JSON.stringify({ ts: new Date().toISOString(), level: 'ERROR', event: 'sumsub_token_error', status: response.status, body: errText }));
      return NextResponse.json({ error: `Sumsub API error: ${response.status} ${response.statusText}` }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(JSON.stringify({ ts: new Date().toISOString(), level: 'ERROR', event: 'token_exception', message: String(error) }));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
