import { Link } from "@/i18n/routing";

export default function NotFound() {
  return (
    <div className="container" style={{ paddingTop: '6rem', paddingBottom: '6rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{
          fontSize: '6rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1,
          marginBottom: '1.5rem'
        }}>
          404
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
          The page you are looking for does not exist or has been moved. Let us take you back to safety.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary" style={{ padding: '0.8rem 1.75rem' }}>
            Back to Home
          </Link>
          <Link href="/verify" className="btn btn-secondary" style={{ padding: '0.8rem 1.75rem' }}>
            Verify Identity
          </Link>
        </div>
      </div>
    </div>
  );
}
