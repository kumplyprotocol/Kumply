// Flat replacement for the old three.js hero sphere (Hero3D.tsx, retired
// with the v3 rebrand). kumply-icon-extended.svg is navy-stroked, drawn for
// a light backdrop — so its panel stays a fixed light color regardless of
// the site's own theme toggle, same reasoning as BrandAssetCard's preview
// prop. The glow/rings/float are here to fill the visual weight the old
// piece had (glow, particles, rings breaking the bounding box), not to
// mimic it literally.
export function HeroMark() {
  return (
    <div className="hero-mark">
      <div className="hero-mark__glow" aria-hidden="true" />
      <div className="hero-mark__ring hero-mark__ring--1" aria-hidden="true" />
      <div className="hero-mark__ring hero-mark__ring--2" aria-hidden="true" />
      <div className="hero-mark__panel">
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed brand mark, next/image's optimizer rejects local SVGs by default */}
        <img src="/branding-kumply/svg/kumply-icon-extended.svg" alt="KUMPLY — KYC / KYB / KYA" className="hero-mark__icon" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hero-mark {
          position: relative;
          width: 100%;
          max-width: 460px;
          aspect-ratio: 1 / 1;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-mark__glow {
          position: absolute;
          inset: -18%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,65,66,0.32) 0%, rgba(232,65,66,0.1) 45%, transparent 72%);
          filter: blur(18px);
          animation: heroGlowPulse 4s ease-in-out infinite;
        }
        .hero-mark__ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(232,65,66,0.22);
        }
        .hero-mark__ring--1 { inset: 4%; animation: heroRingSpin 44s linear infinite; }
        .hero-mark__ring--2 { inset: -6%; border-color: rgba(232,65,66,0.13); animation: heroRingSpin 64s linear infinite reverse; }
        .hero-mark__panel {
          position: relative;
          z-index: 1;
          width: 62%;
          aspect-ratio: 1 / 1;
          border-radius: 50%;
          background: #F7F5F3;
          border: 1px solid rgba(14,18,32,0.08);
          box-shadow: 0 30px 70px -24px rgba(232,65,66,0.4), inset 0 0 0 1px rgba(255,255,255,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: heroFloat 6s ease-in-out infinite;
        }
        .hero-mark__icon { width: 56%; height: 56%; }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @keyframes heroRingSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes heroGlowPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      ` }} />
    </div>
  );
}
