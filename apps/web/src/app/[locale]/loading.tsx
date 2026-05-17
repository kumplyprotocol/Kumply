export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 160px)',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading…</p>
    </div>
  );
}
