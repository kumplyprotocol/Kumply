import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/content/blog";

export const runtime = "edge";
export const alt = "KUMPLY Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const post = getPostBySlug(slug);
  const lang = locale === "es" ? "es" : "en";
  const title = post?.title[lang] ?? "KUMPLY Blog";
  const eyebrow = lang === "es" ? "BLOG DE KUMPLY" : "KUMPLY BLOG";
  const author = post?.author.name ?? "KUMPLY";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#0B0B0D",
          backgroundImage:
            "radial-gradient(circle at 78% 22%, rgba(232,65,66,0.28), transparent 55%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 4,
              background: "#E84142",
            }}
          />
          <span
            style={{
              color: "#F2F0EE",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "0.04em",
            }}
          >
            KUMPLY
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 980 }}>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 22,
              letterSpacing: "0.16em",
              color: "#E84142",
              fontWeight: 700,
            }}
          >
            {eyebrow}
          </span>
          <span
            style={{
              fontSize: 58,
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              color: "#F2F0EE",
            }}
          >
            {title}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ color: "#A8A5A1", fontSize: 24 }}>{author}</span>
          <span style={{ color: "#6E6B68", fontSize: 24 }}>·</span>
          <span style={{ color: "#A8A5A1", fontSize: 24 }}>kumply.xyz/blog</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
