#!/usr/bin/env node
// Driver for KUMPLY's Next.js web app (apps/web) in a real headless
// browser, in sandboxes with no sudo/root access.
//
// Playwright's own bundled Chromium fails to launch here with missing
// shared library errors (libnspr4.so and friends), because there's no
// root to `apt-get install` them. This driver works around that by
// downloading the .deb packages (apt-get download needs no root - it
// only fetches the file), extracting them with `dpkg -x` (a pure
// extraction, no root, no touching the system package DB), and
// pointing Chromium at the extracted libs via LD_LIBRARY_PATH.
//
// Usage:
//   node driver.mjs <url> [options]
//
// Options:
//   --click "<exact button text>"   Click a button/role=button by exact
//                                    accessible name. Repeatable, runs
//                                    in order. Use for click sequences,
//                                    e.g. repeated --click "EN" --click "ES".
//   --wait <ms>                      Wait this long after each --click
//                                    (and once after initial load).
//                                    Default 300.
//   --screenshot <path>              Save a full-page screenshot after
//                                    all clicks finish.
//   --cookie "NAME=VALUE"            Set a cookie before navigating
//                                    (e.g. NEXT_LOCALE=es).
//
// Output: a single JSON object on stdout with consoleErrors, pageErrors,
// failedRequests, and the final visible body text (first 500 chars).
// Exit code is 1 if any pageErrors occurred, 0 otherwise (console/CSP
// noise and request aborts do not fail the run - see Gotchas in SKILL.md).
//
// Example (see SKILL.md for the full walkthrough):
//   node driver.mjs http://localhost:3000/blog \
//     --click "ES" --wait 1200 --click "EN" \
//     --screenshot /tmp/blog-en.png

import { chromium } from "playwright";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_DIR = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(SKILL_DIR, ".chromium-cache");
const LIBS_DIR = path.join(CACHE_DIR, "libs");
const LIB_PATH = path.join(LIBS_DIR, "extracted", "usr", "lib", "x86_64-linux-gnu");

// Packages needed to run Chromium headless on Ubuntu 24.04 "noble" without
// root. Package names carry the "t64" suffix on noble (64-bit time_t
// transition) - re-derive with `apt-cache search --names-only "^libfoo"`
// if this list ever fails with "Unable to locate package" on a different
// base image. See SKILL.md Gotchas.
const PACKAGES = [
  "libnss3", "libnspr4", "libatk1.0-0t64", "libatk-bridge2.0-0t64",
  "libcups2t64", "libdrm2", "libxkbcommon0", "libxcomposite1", "libxdamage1",
  "libxfixes3", "libxrandr2", "libgbm1", "libasound2t64", "libpango-1.0-0",
  "libcairo2", "libatspi2.0-0t64",
];

function ensureLibs() {
  if (existsSync(LIB_PATH) && readdirSync(LIB_PATH).some((f) => f.endsWith(".so") || f.includes(".so."))) {
    return; // already extracted this run/session
  }
  mkdirSync(LIBS_DIR, { recursive: true });
  const debDir = path.join(LIBS_DIR, "deb");
  mkdirSync(debDir, { recursive: true });
  execSync(`apt-get download ${PACKAGES.join(" ")}`, { cwd: debDir, stdio: "inherit" });
  const extractDir = path.join(LIBS_DIR, "extracted");
  mkdirSync(extractDir, { recursive: true });
  const debs = readdirSync(debDir).filter((f) => f.endsWith(".deb"));
  if (debs.length === 0) {
    throw new Error("apt-get download produced no .deb files - check package names for this base image (see SKILL.md Gotchas)");
  }
  for (const deb of debs) {
    execSync(`dpkg -x "${deb}" "${extractDir}"`, { cwd: debDir, stdio: "inherit" });
  }
}

function findChromiumBinary() {
  const cacheRoot = path.join(process.env.HOME || "/root", ".cache", "ms-playwright");
  if (!existsSync(cacheRoot)) {
    throw new Error(`No Playwright Chromium cache at ${cacheRoot} - run: npx --yes playwright install chromium`);
  }
  const dirs = readdirSync(cacheRoot).filter((d) => d.startsWith("chromium-") && !d.includes("headless_shell"));
  if (dirs.length === 0) {
    throw new Error(`No full Chromium build (only chromium_headless_shell?) under ${cacheRoot} - run: npx --yes playwright install chromium`);
  }
  // Prefer the newest-numbered build.
  dirs.sort();
  const chosen = dirs[dirs.length - 1];
  const bin = path.join(cacheRoot, chosen, "chrome-linux64", "chrome");
  if (!existsSync(bin)) {
    throw new Error(`Expected Chromium binary at ${bin} but it's missing - reinstall with: npx --yes playwright install chromium`);
  }
  return bin;
}

function parseArgs(argv) {
  const url = argv[0];
  if (!url) {
    console.error("Usage: node driver.mjs <url> [--click TEXT]... [--wait ms] [--screenshot path] [--cookie NAME=VALUE]");
    process.exit(2);
  }
  const opts = { url, clicks: [], waitMs: 300, screenshot: null, cookie: null };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--click") opts.clicks.push(argv[++i]);
    else if (a === "--wait") opts.waitMs = Number(argv[++i]);
    else if (a === "--screenshot") opts.screenshot = argv[++i];
    else if (a === "--cookie") opts.cookie = argv[++i];
    else throw new Error(`Unknown flag: ${a}`);
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  ensureLibs();
  process.env.LD_LIBRARY_PATH = `${LIB_PATH}:${process.env.LD_LIBRARY_PATH || ""}`;
  const executablePath = findChromiumBinary();

  const browser = await chromium.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

  if (opts.cookie) {
    const [name, ...rest] = opts.cookie.split("=");
    const value = rest.join("=");
    const u = new URL(opts.url);
    await context.addCookies([{ name, value, domain: u.hostname, path: "/" }]);
  }

  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("requestfailed", (req) => failedRequests.push(`${req.method()} ${req.url()} -> ${req.failure()?.errorText}`));

  await page.goto(opts.url, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(opts.waitMs);

  for (const label of opts.clicks) {
    await page.getByRole("button", { name: label, exact: true }).first().click({ timeout: 5000 });
    await page.waitForTimeout(opts.waitMs);
  }

  if (opts.screenshot) {
    await page.screenshot({ path: opts.screenshot, fullPage: true });
  }

  const bodyText = await page.evaluate(() => document.body.innerText).catch(() => "<eval failed>");

  await browser.close();

  const result = {
    url: opts.url,
    clicksPerformed: opts.clicks,
    bodyTextSample: bodyText.slice(0, 500),
    consoleErrors,
    pageErrors,
    failedRequests,
    screenshot: opts.screenshot,
  };
  console.log(JSON.stringify(result, null, 2));
  process.exit(pageErrors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("driver.mjs failed:", err.message);
  process.exit(2);
});
