import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Vercel: allow up to 15s for Sumsub API round-trip
export const maxDuration = 15;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId: string = body?.userId;
    const levelName: string = body?.levelName;

    if (!userId || !levelName) {
      return NextResponse.json({ error: 'Missing userId or levelName' }, { status: 400 });
    }

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
