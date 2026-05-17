import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function DevelopersDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const t = await getTranslations('DevelopersDocs');
  
  const keys = ['contracts', 'api'];
  if (!keys.includes(slug)) {
    notFound();
  }

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '6rem', minHeight: '80vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="section-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>{t(`${slug}.title`)}</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--accent)', fontWeight: 500 }}>{t(`${slug}.subtitle`)}</p>
      </div>
      
      <div className="glass-card" style={{ padding: '3rem', background: 'var(--bg-card)', marginBottom: '4rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          {t(`${slug}.p1`)}
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8 }}>
          {t(`${slug}.p2`)}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem', background: 'var(--bg-secondary)', borderTop: '4px solid var(--accent)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>{t(`${slug}.f1Title`)}</h3>
          <p style={{ color: 'var(--text-tertiary)', lineHeight: 1.6 }}>{t(`${slug}.f1Desc`)}</p>
        </div>
        <div className="glass-card" style={{ padding: '2rem', background: 'var(--bg-secondary)', borderTop: '4px solid var(--accent)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>{t(`${slug}.f2Title`)}</h3>
          <p style={{ color: 'var(--text-tertiary)', lineHeight: 1.6 }}>{t(`${slug}.f2Desc`)}</p>
        </div>
        <div className="glass-card" style={{ padding: '2rem', background: 'var(--bg-secondary)', borderTop: '4px solid var(--accent)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>{t(`${slug}.f3Title`)}</h3>
          <p style={{ color: 'var(--text-tertiary)', lineHeight: 1.6 }}>{t(`${slug}.f3Desc`)}</p>
        </div>
      </div>
    </div>
  );
}
