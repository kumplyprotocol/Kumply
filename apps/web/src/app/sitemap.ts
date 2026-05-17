import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://kumply.xyz";
  const locales = ["en", "es"];
  const now = new Date();

  const staticPages = [
    "",
    "/tiers",
    "/verify",
    "/demo",
    "/dashboard",
    "/network",
    "/solutions/kyc",
    "/solutions/kyb",
    "/solutions/kya",
    "/solutions/cross-l1",
    "/developers",
    "/developers/contracts",
    "/developers/api",
    "/legal/privacy",
    "/legal/terms",
    "/legal/regulatory",
    "/legal/audit",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: now,
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1.0 : page.startsWith("/solutions") ? 0.8 : 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}${page}`])
          ),
        },
      });
    }
  }

  return entries;
}
