interface BrandAssetCardProps {
  src: string;
  title: string;
  subtitle?: string;
  downloadHref: string;
  downloadLabel: string;
  /** Backdrop the preview needs to read correctly — fixed to the asset
   * itself, independent of the site's own light/dark theme. */
  preview?: "light" | "dark" | "checker";
  thumbStyle?: React.CSSProperties;
}

export function BrandAssetCard({ src, title, subtitle, downloadHref, downloadLabel, preview = "light", thumbStyle }: BrandAssetCardProps) {
  const isDark = preview === "dark";
  const isChecker = preview === "checker";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
        textAlign: "center",
        padding: "1.125rem",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${isDark ? "#3A3F52" : "var(--border)"}`,
        background: isDark ? "#0E1220" : "var(--bg-secondary)",
        backgroundImage: isChecker
          ? "linear-gradient(45deg, rgba(128,128,128,0.18) 25%, transparent 25%), linear-gradient(-45deg, rgba(128,128,128,0.18) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(128,128,128,0.18) 75%), linear-gradient(-45deg, transparent 75%, rgba(128,128,128,0.18) 75%)"
          : undefined,
        backgroundSize: isChecker ? "12px 12px" : undefined,
        backgroundPosition: isChecker ? "0 0, 0 6px, 6px -6px, -6px 0" : undefined,
      }}
    >
      <div style={{ height: "90px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed brand-pack previews, not responsive content images */}
        <img src={src} alt={title} style={{ maxHeight: "90px", maxWidth: "100%", ...thumbStyle }} />
      </div>
      <div>
        <b style={{ display: "block", fontSize: "0.85rem", color: isDark ? "#fff" : "var(--text-primary)" }}>{title}</b>
        {subtitle && (
          <span style={{ fontSize: "0.75rem", color: isDark ? "#9AA0AE" : "var(--text-tertiary)" }}>{subtitle}</span>
        )}
      </div>
      <a
        href={downloadHref}
        download
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem",
          width: "100%",
          fontSize: "0.78rem",
          fontWeight: 600,
          color: "var(--accent)",
          textDecoration: "none",
          border: `1px solid ${isDark ? "#3A3F52" : "var(--border)"}`,
          borderRadius: "var(--radius-md)",
          padding: "0.5rem 0.75rem",
        }}
      >
        {downloadLabel}
      </a>
    </div>
  );
}
