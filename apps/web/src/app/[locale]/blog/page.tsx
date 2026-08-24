import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { BLOG_POSTS } from "@/content/blog";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Blog");
  return {
    title: t("indexTitle"),
    description: t("indexDescription"),
    openGraph: {
      title: t("indexTitle"),
      description: t("indexDescription"),
      type: "website",
    },
  };
}

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export default async function BlogIndexPage() {
  const t = await getTranslations("Blog");
  const locale = await getLocale();
  const lang = locale === "es" ? "es" : "en";
  const posts = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="container blog-index-container">
      <div className="blog-index-head">
        <span className="blog-eyebrow">{t("eyebrow")}</span>
        <h1 className="section-title blog-index-title">{t("indexTitle")}</h1>
        <p className="section-subtitle blog-index-subtitle">{t("indexSubtitle")}</p>
      </div>

      <div className="blog-list">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="glass-card blog-card">
            {post.category && (
              <span className="badge badge-accent blog-card__category">{post.category}</span>
            )}
            <div className="blog-card__meta">
              <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
              <span className="blog-card__dot" aria-hidden="true">•</span>
              <span>{t("minRead", { minutes: post.readMinutes })}</span>
            </div>
            <h2 className="blog-card__title">{post.title[lang]}</h2>
            <p className="blog-card__excerpt">{post.excerpt[lang]}</p>
            <div className="blog-card__author">
              <span className="blog-card__author-name">{post.author.name}</span>
              <span className="blog-card__author-role">{post.author.role[lang]}</span>
            </div>
            <span className="blog-card__cta">{t("readMore")} →</span>
          </Link>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-index-container { padding-top: 120px; padding-bottom: 6rem; min-height: 80vh; }
        .blog-index-head { max-width: 720px; margin: 0 auto 3rem; text-align: center; }
        .blog-eyebrow {
          font-family: 'Fira Code', 'Consolas', monospace; font-size: 0.75rem;
          letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent);
          font-weight: 600; display: block; margin-bottom: 0.75rem;
        }
        .blog-index-title { font-size: 2.75rem; margin: 0 auto 1rem; }
        .blog-index-subtitle { margin: 0 auto; }

        .blog-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        .blog-card {
          display: flex; flex-direction: column; gap: 0.85rem;
          text-decoration: none; color: inherit; padding: 1.75rem;
        }
        .blog-card__meta {
          display: flex; align-items: center; gap: 0.5rem;
          font-family: 'Fira Code', 'Consolas', monospace; font-size: 0.75rem;
          color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em;
        }
        .blog-card__dot { opacity: 0.5; }
        .blog-card__category { align-self: flex-start; }
        .blog-card__title {
          font-size: 1.35rem; font-weight: 800; line-height: 1.3;
          color: var(--text-primary); margin: 0;
        }
        .blog-card__excerpt {
          font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);
          margin: 0; flex-grow: 1;
        }
        .blog-card__author {
          display: flex; flex-direction: column; gap: 0.1rem;
          padding-top: 0.75rem; border-top: 1px solid var(--border);
        }
        .blog-card__author-name { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }
        .blog-card__author-role { font-size: 0.78rem; color: var(--text-tertiary); }
        .blog-card__cta {
          font-size: 0.85rem; font-weight: 700; color: var(--accent);
          margin-top: 0.25rem;
        }

        @media (max-width: 768px) {
          .blog-index-container { padding-top: 100px; padding-bottom: 4rem; }
          .blog-index-title { font-size: 2rem; }
          .blog-list { grid-template-columns: 1fr; gap: 1.25rem; }
        }
        @media (max-width: 480px) {
          .blog-index-container { padding-top: 80px; }
          .blog-index-title { font-size: 1.65rem; }
        }
      ` }} />
    </div>
  );
}
