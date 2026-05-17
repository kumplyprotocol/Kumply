"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useLocale, useTranslations } from "next-intl";
import { KumplyClient } from "@kumply/sdk";

type VerifyStep = "connect" | "kyc" | "pending" | "done" | "error";

const ATTESTATION_STORE = process.env.NEXT_PUBLIC_CONTRACT_ATTESTATION_STORE as `0x${string}`;

export default function VerifyPage() {
  const t = useTranslations('Verify');
  const locale = useLocale();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const [step, setStep] = useState<VerifyStep>("connect");
  const [attestation, setAttestation] = useState<{ tier: number; expiry: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sumsubContainerRef = useRef<HTMLDivElement>(null);
  const sdkLaunchedRef = useRef(false);

  const checkExistingAttestation = useCallback(async () => {
    if (!address || !ATTESTATION_STORE) { setStep("kyc"); return; }
    try {
      const client = new KumplyClient({ network: "fuji", contractAddress: ATTESTATION_STORE });
      const result = await client.verify(address);
      if (result.verified) {
        setAttestation({ tier: result.tier, expiry: result.expiry });
        setStep("done");
      } else {
        setStep("kyc");
      }
    } catch {
      setStep("kyc");
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && step === "connect") {
      checkExistingAttestation();
    }
  }, [isConnected, step, checkExistingAttestation]);

  async function launchSumsub() {
    if (!address || sdkLaunchedRef.current) return;
    setError(null);
    sdkLaunchedRef.current = true;

    try {
      const tokenRes = await fetch(`/api/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: address, levelName: "standard-kyc" }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.json();
        throw new Error(err.error || "Failed to get verification token");
      }

      const { token } = await tokenRes.json();

      if (typeof window === "undefined") return;

      const { default: SumsubWebSdk } = await import("@sumsub/websdk");

      const launchedSdk = SumsubWebSdk.init(token, () =>
        fetch(`/api/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: address, levelName: "standard-kyc" }),
        })
          .then((r) => r.json())
          .then((d) => d.token)
      )
        .withConf({ lang: locale })
        .withOptions({ addViewportTag: false, adaptIframeHeight: true })
        .on("idCheck.onApplicantStatusChanged", async (data: any) => {
          if (data?.reviewResult?.reviewAnswer === "GREEN") {
            setStep("pending");
            await pollAttestation(address, 24, 5000);
          }
        })
        .on("idCheck.onError", (err: any) => {
          sdkLaunchedRef.current = false;
          setError(`${t('verifyError')}: ${err?.message || "Unknown error"}`);
        })
        .build();

      if (sumsubContainerRef.current) {
        launchedSdk.launch(`#sumsub-container`);
      }
    } catch (e: any) {
      sdkLaunchedRef.current = false;
      setError(e.message || t('launchError'));
    }
  }

  async function pollAttestation(addr: string, retries: number, intervalMs: number) {
    if (!ATTESTATION_STORE) {
      setError(t('pollError'));
      setStep("error");
      return;
    }
    const client = new KumplyClient({ network: "fuji", contractAddress: ATTESTATION_STORE });
    for (let i = 0; i < retries; i++) {
      await new Promise((r) => setTimeout(r, intervalMs));
      try {
        const result = await client.verify(addr);
        if (result.verified) {
          setAttestation({ tier: result.tier, expiry: result.expiry });
          setStep("done");
          return;
        }
      } catch {
        // continue polling
      }
    }
    setError(t('pollError'));
    setStep("error");
  }

  const tierLabels: Record<number, string> = {
    1: "Basic", 2: "Standard", 3: "Enhanced", 4: "Business", 5: "Agent",
  };

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem', maxWidth: '680px' }}>

      {/* ── Connect Wallet ── */}
      {step === "connect" && (
        <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: 'var(--shadow-glow-strong)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M19 7V4C19 3 18 2 17 2H3C2 2 1 3 1 4V20C1 21 2 22 3 22H17C18 22 19 21 19 20V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 12H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 9L23 12L20 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="page-title" style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>
            {t('pageTitle')}
          </h1>
          <p className="page-description" style={{ marginBottom: '2.5rem' }}>
            {t('pageDesc')}
          </p>
          <button
            className="btn btn-primary"
            style={{ fontSize: '1rem', padding: '0.9rem 2.25rem' }}
            onClick={() => connect({ connector: injected() })}
          >
            {t('connectBtn')}
          </button>
          <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            ⚠ {t('testnetWarning')}
          </p>
        </div>
      )}

      {/* ── KYC Step ── */}
      {step === "kyc" && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('walletLabel')}</p>
              <code style={{ fontSize: '0.85rem', color: 'var(--accent-light)', fontFamily: 'monospace' }}>{address?.slice(0, 10)}…{address?.slice(-6)}</code>
            </div>
            <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
              {t('connectedBadge')}
            </span>
          </div>

          <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {t('pageTitle')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {t('kycExplainer')}
          </p>

          <div
            id="sumsub-container"
            ref={sumsubContainerRef}
            style={{
              minHeight: '420px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              overflow: 'hidden',
              marginBottom: '1.5rem'
            }}
          />

          {!sdkLaunchedRef.current && (
            <div style={{ textAlign: 'center' }}>
              <button
                className="btn btn-primary"
                style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}
                onClick={launchSumsub}
              >
                {t('launchBtn')}
              </button>
            </div>
          )}

          {error && (
            <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: 'var(--error-bg)', borderRadius: 'var(--radius-md)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* ── Pending ── */}
      {step === "pending" && (
        <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-glow)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', animation: 'glow 2s ease-in-out infinite' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('pendingTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto 2.5rem' }}>
            {t('pendingDesc')}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Done ── */}
      {step === "done" && attestation && (
        <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--success-bg)', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="9" stroke="var(--success)" strokeWidth="2"/>
            </svg>
          </div>
          <h1 className="page-title" style={{ fontSize: '2rem', color: 'var(--success)', marginBottom: '0.5rem' }}>
            {t('doneTitle')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
            {t('doneDesc')}
          </p>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', maxWidth: '420px', margin: '0 auto 2rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('tierLabel')}</span>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{tierLabels[attestation.tier] || `Tier ${attestation.tier}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('addressLabel')}</span>
              <code style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{address?.slice(0, 8)}…{address?.slice(-6)}</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('expiresLabel')}</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{new Date(attestation.expiry * 1000).toLocaleDateString()}</span>
            </div>
          </div>

          <a
            href={`https://testnet.snowtrace.io/address/${ATTESTATION_STORE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            {t('snowtraceBtn')}
          </a>
        </div>
      )}

      {/* ── Error ── */}
      {step === "error" && (
        <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--error-bg)', border: '2px solid var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('errorTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto 2.5rem' }}>{error}</p>
          <button
            className="btn btn-secondary"
            onClick={() => { setStep("kyc"); sdkLaunchedRef.current = false; setError(null); }}
          >
            {t('tryAgainBtn')}
          </button>
        </div>
      )}
    </div>
  );
}
