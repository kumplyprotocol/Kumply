import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/content/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const locale = await getLocale();
  const lang = locale === "es" ? "es" : "en";

  return {
    title: post.title[lang],
    description: post.excerpt[lang],
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title[lang],
      description: post.excerpt[lang],
      type: "article",
      publishedTime: post.date,
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title[lang],
      description: post.excerpt[lang],
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

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const t = await getTranslations("Blog");
  const locale = await getLocale();
  const lang = locale === "es" ? "es" : "en";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title[lang],
    description: post.excerpt[lang],
    datePublished: post.date,
    author: { "@type": "Person", name: post.author.name },
    publisher: { "@type": "Organization", name: "KUMPLY" },
    mainEntityOfPage: `https://kumply.xyz/blog/${post.slug}`,
  };

  return (
    <article className="container blog-post-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/blog" className="blog-post__back">
        ← {t("backToBlog")}
      </Link>

      <header className="blog-post__head">
        <span className="blog-eyebrow">{t("eyebrow")}</span>
        <h1 className="blog-post__title">{post.title[lang]}</h1>
        <div className="blog-post__meta">
          <span className="blog-post__author">{post.author.name}</span>
          <span className="blog-post__meta-dot" aria-hidden="true">•</span>
          <span>{post.author.role[lang]}</span>
          <span className="blog-post__meta-dot" aria-hidden="true">•</span>
          <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
          <span className="blog-post__meta-dot" aria-hidden="true">•</span>
          <span>{t("minRead", { minutes: post.readMinutes })}</span>
        </div>
      </header>

      <div
        className="blog-post__body"
        dangerouslySetInnerHTML={{ __html: post.bodyHtml[lang] }}
      />

      <footer className="blog-post__footer">
        <Link href="/blog" className="btn btn-secondary">
          ← {t("backToBlog")}
        </Link>
        <Link href="/verify" className="btn btn-primary">
          {t("ctaVerify")}
        </Link>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-post-container { padding-top: 120px; padding-bottom: 6rem; min-height: 80vh; max-width: 760px; }
        .blog-post__back {
          display: inline-block; font-size: 0.85rem; font-weight: 600;
          color: var(--text-secondary); text-decoration: none; margin-bottom: 2rem;
        }
        .blog-post__back:hover { color: var(--accent); }

        .blog-post__head { margin-bottom: 2.5rem; }
        .blog-post__title {
          font-size: 2.5rem; font-weight: 800; line-height: 1.15;
          letter-spacing: -0.02em; margin: 0.75rem 0 1.25rem; color: var(--text-primary);
        }
        .blog-post__meta {
          display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem;
          font-size: 0.85rem; color: var(--text-tertiary);
        }
        .blog-post__author { color: var(--text-primary); font-weight: 700; }
        .blog-post__meta-dot { opacity: 0.5; }

        .blog-post__body {
          font-size: 1.08rem; line-height: 1.75; color: var(--text-secondary);
        }
        .blog-post__body p { margin: 0 0 1.4rem; }
        .blog-post__body h2 {
          font-size: 1.55rem; font-weight: 800; color: var(--text-primary);
          margin: 2.5rem 0 1.1rem; letter-spacing: -0.01em; line-height: 1.25;
        }
        .blog-post__body code {
          font-family: 'Fira Code', 'Consolas', monospace; font-size: 0.9em;
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 0.1em 0.4em; border-radius: 6px; color: var(--text-primary);
        }
        .blog-post__body .blog-scenario {
          margin: 1.75rem 0; padding: 1.5rem 1.5rem 1.25rem;
          border-left: 3px solid var(--accent);
          background: var(--bg-card); border-radius: 0 var(--radius-md) var(--radius-md) 0;
        }
        .blog-post__body .blog-scenario p { margin-bottom: 0.9rem; font-size: 1rem; }
        .blog-post__body .blog-scenario p:last-child { margin-bottom: 0; }

        .blog-post__footer {
          display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 3rem;
          padding-top: 2rem; border-top: 1px solid var(--border);
        }

        @media (max-width: 768px) {
          .blog-post-container { padding-top: 100px; padding-bottom: 4rem; }
          .blog-post__title { font-size: 1.9rem; }
          .blog-post__body { font-size: 1rem; }
          .blog-post__body h2 { font-size: 1.3rem; }
        }
        @media (max-width: 480px) {
          .blog-post-container { padding-top: 80px; }
          .blog-post__title { font-size: 1.6rem; }
          .blog-post__meta { font-size: 0.78rem; }
        }
      ` }} />
    </article>
  );
}
