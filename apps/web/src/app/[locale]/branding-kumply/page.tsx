import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BrandAssetCard } from "@/components/BrandAssetCard";

const ASSET_BASE = "/branding-kumply";
const OG_IMAGE = `${ASSET_BASE}/png/social-banner-1200x630.png`;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Branding");
  return {
    title: t("title"),
    description: t("subtitle"),
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      type: "website",
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("subtitle"),
      images: [OG_IMAGE],
    },
  };
}

export default async function BrandingKumplyPage() {
  const t = await getTranslations("Branding");

  return (
    <div className="container branding-container">
      <h1 className="section-title branding-title">{t("title")}</h1>
      <p className="section-subtitle branding-subtitle">{t("subtitle")}</p>

      <div className="glass-card branding-zip-cta">
        <div>
          <b className="branding-zip-cta__title">{t("zipTitle")}</b>
          <span className="branding-zip-cta__desc">{t("zipDesc")}</span>
        </div>
        <a href={`${ASSET_BASE}/kumply-branding-pack.zip`} download className="btn btn-primary">
          {t("zipButton")}
        </a>
      </div>

      <h2 className="branding-section-title">{t("sectionSvg")}</h2>
      <div className="branding-grid">
        <BrandAssetCard src={`${ASSET_BASE}/svg/kumply-icon.svg`} title={t("cardIconLightTitle")} subtitle={t("cardIconLightSubtitle")} downloadHref={`${ASSET_BASE}/svg/kumply-icon.svg`} downloadLabel={t("downloadSvg")} preview="light" />
        <BrandAssetCard src={`${ASSET_BASE}/svg/kumply-icon-on-dark.svg`} title={t("cardIconDarkTitle")} subtitle={t("cardIconDarkSubtitle")} downloadHref={`${ASSET_BASE}/svg/kumply-icon-on-dark.svg`} downloadLabel={t("downloadSvg")} preview="dark" />
        <BrandAssetCard src={`${ASSET_BASE}/svg/kumply-icon-extended.svg`} title={t("cardIconExtendedTitle")} subtitle={t("cardIconExtendedSubtitle")} downloadHref={`${ASSET_BASE}/svg/kumply-icon-extended.svg`} downloadLabel={t("downloadSvg")} preview="light" />
        <BrandAssetCard src={`${ASSET_BASE}/svg/kumply-icon-mono-dark.svg`} title={t("cardMonoNavyTitle")} subtitle={t("cardMonoNavySubtitle")} downloadHref={`${ASSET_BASE}/svg/kumply-icon-mono-dark.svg`} downloadLabel={t("downloadSvg")} preview="light" thumbStyle={{ width: "60px" }} />
        <BrandAssetCard src={`${ASSET_BASE}/svg/kumply-icon-mono-light.svg`} title={t("cardMonoWhiteTitle")} subtitle={t("cardMonoWhiteSubtitle")} downloadHref={`${ASSET_BASE}/svg/kumply-icon-mono-light.svg`} downloadLabel={t("downloadSvg")} preview="dark" thumbStyle={{ width: "60px" }} />
        <BrandAssetCard src={`${ASSET_BASE}/svg/kumply-lockup-light.svg`} title={t("cardLockupLightTitle")} subtitle={t("cardLockupLightSubtitle")} downloadHref={`${ASSET_BASE}/svg/kumply-lockup-light.svg`} downloadLabel={t("downloadSvg")} preview="light" thumbStyle={{ width: "100%" }} />
        <BrandAssetCard src={`${ASSET_BASE}/svg/kumply-lockup-dark.svg`} title={t("cardLockupDarkTitle")} subtitle={t("cardLockupDarkSubtitle")} downloadHref={`${ASSET_BASE}/svg/kumply-lockup-dark.svg`} downloadLabel={t("downloadSvg")} preview="dark" thumbStyle={{ width: "100%" }} />
        <BrandAssetCard src={`${ASSET_BASE}/svg/kumply-badge-kya.svg`} title={t("cardBadgeTitle")} subtitle={t("cardBadgeSubtitle")} downloadHref={`${ASSET_BASE}/svg/kumply-badge-kya.svg`} downloadLabel={t("downloadSvg")} preview="dark" thumbStyle={{ width: "100%" }} />
        <BrandAssetCard src={`${ASSET_BASE}/svg/kumply-favicon.svg`} title={t("cardFaviconSvgTitle")} subtitle={t("cardFaviconSvgSubtitle")} downloadHref={`${ASSET_BASE}/svg/kumply-favicon.svg`} downloadLabel={t("downloadSvg")} preview="light" thumbStyle={{ width: "50px" }} />
      </div>

      <h2 className="branding-section-title">{t("sectionAvatar")}</h2>
      <div className="branding-grid">
        <BrandAssetCard src={`${ASSET_BASE}/png/avatar-navy-800.png`} title={t("cardAvatar800Title")} subtitle={t("cardAvatar800Subtitle")} downloadHref={`${ASSET_BASE}/png/avatar-navy-800.png`} downloadLabel={t("downloadPng")} preview="dark" thumbStyle={{ width: "80px", borderRadius: "50%" }} />
        <BrandAssetCard src={`${ASSET_BASE}/png/avatar-navy-1600.png`} title={t("cardAvatar1600Title")} subtitle={t("cardAvatar1600Subtitle")} downloadHref={`${ASSET_BASE}/png/avatar-navy-1600.png`} downloadLabel={t("downloadPng")} preview="dark" thumbStyle={{ width: "80px", borderRadius: "50%" }} />
      </div>

      <h2 className="branding-section-title">{t("sectionTransparent")}</h2>
      <div className="branding-grid">
        <BrandAssetCard src={`${ASSET_BASE}/png/icon-transparent-512.png`} title={t("cardTransparent512Title")} subtitle={t("cardTransparent512Subtitle")} downloadHref={`${ASSET_BASE}/png/icon-transparent-512.png`} downloadLabel={t("downloadPng")} preview="checker" thumbStyle={{ width: "70px" }} />
        <BrandAssetCard src={`${ASSET_BASE}/png/icon-transparent-1024.png`} title={t("cardTransparent1024Title")} subtitle={t("cardTransparent1024Subtitle")} downloadHref={`${ASSET_BASE}/png/icon-transparent-1024.png`} downloadLabel={t("downloadPng")} preview="checker" thumbStyle={{ width: "70px" }} />
        <BrandAssetCard src={`${ASSET_BASE}/png/icon-transparent-2048.png`} title={t("cardTransparent2048Title")} subtitle={t("cardTransparent2048Subtitle")} downloadHref={`${ASSET_BASE}/png/icon-transparent-2048.png`} downloadLabel={t("downloadPng")} preview="checker" thumbStyle={{ width: "70px" }} />
        <BrandAssetCard src={`${ASSET_BASE}/png/icon-extended-transparent-2048.png`} title={t("cardTransparentExtTitle")} subtitle={t("cardTransparentExtSubtitle")} downloadHref={`${ASSET_BASE}/png/icon-extended-transparent-2048.png`} downloadLabel={t("downloadPng")} preview="checker" thumbStyle={{ width: "70px" }} />
      </div>

      <h2 className="branding-section-title">{t("sectionFavicon")}</h2>
      <div className="branding-grid">
        <BrandAssetCard src={`${ASSET_BASE}/png/favicon-16.png`} title={t("cardFavicon16Title")} downloadHref={`${ASSET_BASE}/png/favicon-16.png`} downloadLabel={t("download")} preview="checker" thumbStyle={{ width: "16px" }} />
        <BrandAssetCard src={`${ASSET_BASE}/png/favicon-32.png`} title={t("cardFavicon32Title")} downloadHref={`${ASSET_BASE}/png/favicon-32.png`} downloadLabel={t("download")} preview="checker" thumbStyle={{ width: "32px" }} />
        <BrandAssetCard src={`${ASSET_BASE}/png/favicon-48.png`} title={t("cardFavicon48Title")} downloadHref={`${ASSET_BASE}/png/favicon-48.png`} downloadLabel={t("download")} preview="checker" thumbStyle={{ width: "48px" }} />
        <BrandAssetCard src={`${ASSET_BASE}/png/favicon-180.png`} title={t("cardFavicon180Title")} subtitle={t("cardFavicon180Subtitle")} downloadHref={`${ASSET_BASE}/png/favicon-180.png`} downloadLabel={t("download")} preview="checker" thumbStyle={{ width: "64px" }} />
        <BrandAssetCard src={`${ASSET_BASE}/png/favicon-512.png`} title={t("cardFavicon512Title")} subtitle={t("cardFavicon512Subtitle")} downloadHref={`${ASSET_BASE}/png/favicon-512.png`} downloadLabel={t("download")} preview="checker" thumbStyle={{ width: "70px" }} />
      </div>

      <h2 className="branding-section-title">{t("sectionLockup")}</h2>
      <div className="branding-grid">
        <BrandAssetCard src={`${ASSET_BASE}/png/lockup-light-2000.png`} title={t("cardLockupPngLightTitle")} subtitle={t("cardLockupPngLightSubtitle")} downloadHref={`${ASSET_BASE}/png/lockup-light-2000.png`} downloadLabel={t("downloadPng")} preview="light" thumbStyle={{ width: "100%" }} />
        <BrandAssetCard src={`${ASSET_BASE}/png/lockup-dark-2000.png`} title={t("cardLockupPngDarkTitle")} subtitle={t("cardLockupPngDarkSubtitle")} downloadHref={`${ASSET_BASE}/png/lockup-dark-2000.png`} downloadLabel={t("downloadPng")} preview="dark" thumbStyle={{ width: "100%" }} />
        <BrandAssetCard src={`${ASSET_BASE}/png/social-banner-1200x630.png`} title={t("cardBannerTitle")} subtitle={t("cardBannerSubtitle")} downloadHref={`${ASSET_BASE}/png/social-banner-1200x630.png`} downloadLabel={t("downloadPng")} preview="dark" thumbStyle={{ width: "100%" }} />
        <BrandAssetCard src={`${ASSET_BASE}/png/badge-kya-880.png`} title={t("cardBadgePngTitle")} subtitle={t("cardBadgePngSubtitle")} downloadHref={`${ASSET_BASE}/png/badge-kya-880.png`} downloadLabel={t("downloadPng")} preview="dark" thumbStyle={{ width: "100%" }} />
      </div>

      <h2 className="branding-section-title">{t("sectionNotes")}</h2>
      <p className="branding-notes">{t("notes")}</p>

      <style dangerouslySetInnerHTML={{ __html: `
        .branding-container { padding-top: 2rem; padding-bottom: 5rem; }
        .branding-title { font-size: 2.2rem; margin-bottom: 0.5rem; }
        .branding-subtitle { margin-bottom: 2.5rem; }
        .branding-zip-cta {
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          flex-wrap: wrap; margin-bottom: 3rem;
        }
        .branding-zip-cta__title { display: block; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.25rem; }
        .branding-zip-cta__desc { display: block; font-size: 0.85rem; color: var(--text-tertiary); max-width: 480px; }
        .branding-section-title {
          font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;
          color: var(--text-tertiary); margin: 3rem 0 1rem; padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }
        .branding-section-title:first-of-type { border-top: none; padding-top: 0; margin-top: 0; }
        .branding-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 1rem; }
        .branding-notes { color: var(--text-tertiary); font-size: 0.85rem; max-width: 640px; line-height: 1.6; }
      ` }} />
    </div>
  );
}
