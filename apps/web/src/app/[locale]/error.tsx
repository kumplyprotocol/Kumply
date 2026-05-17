"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container" style={{ paddingTop: '6rem', paddingBottom: '6rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--error-bg)',
          border: '2px solid var(--error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="9" stroke="var(--error)" strokeWidth="2"/>
          </svg>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Something went wrong
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
          An unexpected error occurred. You can try again or return to the home page.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={reset} style={{ padding: '0.8rem 1.75rem' }}>
            Try Again
          </button>
          <a href="/" className="btn btn-secondary" style={{ padding: '0.8rem 1.75rem' }}>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
