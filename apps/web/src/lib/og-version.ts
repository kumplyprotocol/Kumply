import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { BlogPost } from "@/content/blog";

// Social networks cache link-preview images by URL. Version the URL with a
// hash of what the opengraph-image route renders from, so a corrected card
// gets a new URL. If the file can't be read, return no version: a missing
// preview image must never break the page.
export async function ogImageVersion(post: BlogPost, lang: "en" | "es"): Promise<string> {
  try {
    const hash = createHash("sha256");
    const file = post.ogCard ?? post.ogImage;
    if (file) hash.update(await readFile(join(process.cwd(), "public", file)));
    if (!post.ogCard) hash.update(`${post.title[lang]}|${post.author.name}`);
    return `?v=${hash.digest("hex").slice(0, 10)}`;
  } catch (error) {
    console.warn(`[blog] no preview version for ${post.slug}:`, error);
    return "";
  }
}
