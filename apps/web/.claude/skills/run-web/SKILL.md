---
name: run-web
description: >
  Launch KUMPLY's Next.js web app (apps/web) and drive it in a real
  headless Chromium browser - click buttons, switch locale, take
  screenshots, read console/network errors - in a sandbox with no
  sudo/root access. Use when asked to run, screenshot, or click-test
  the web app, verify a UI change actually works, or reproduce a
  client-side bug that curl can't see (hydration errors, aborted
  requests, locale-switch failures). Not for the contracts, SDK, or
  api packages.
---

# Running and driving apps/web

Paths below are relative to `apps/web/` (this skill's unit).

Playwright's bundled Chromium fails to launch in this sandbox with
missing shared library errors (`libnspr4.so: cannot open shared object
file`, etc.) because several system packages are missing and there's
no root to `apt-get install` them. `.claude/skills/run-web/driver.mjs`
works around that with no root required at all - see Gotchas for how.
**Use the driver, not a bare Playwright script** - it handles the
library workaround for you.

## Prerequisites

```bash
cd apps/web/.claude/skills/run-web
npm install playwright@1.62.1 --no-save   # local to this skill dir only,
                                            # does not touch the app's real deps
npx --yes playwright install chromium      # downloads the browser binary
                                            # itself (no root needed for this
                                            # part - it's a plain download)
```

Run once per fresh checkout. Both commands are idempotent - safe to
re-run.

## Run (agent path) - use the driver

Start the dev server, then drive it:

```bash
cd apps/web
pnpm dev &
until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done

cd .claude/skills/run-web
node driver.mjs http://localhost:3000/blog \
  --click "ES" --wait 1200 --click "EN" \
  --screenshot /tmp/verify.png
```

The first driver run on a machine also downloads and extracts the
missing shared libraries (a few seconds); it's automatic, not a
separate step, and cached at `.chromium-cache/` for subsequent runs.

**Output:** a JSON object on stdout - `bodyTextSample` (first 500
chars of the rendered page, in whatever locale the last click left it
in), `consoleErrors`, `pageErrors`, `failedRequests`, and the
screenshot path. Exit code is `1` if `pageErrors` is non-empty
(uncaught JS exceptions), `0` otherwise - `consoleErrors` and
`failedRequests` do NOT fail the run, because this app's CSP blocks
some third-party wallet-widget calls by design and RSC prefetches get
`net::ERR_ABORTED`'d on superseded navigations (see Gotchas) - read
them, don't just check the exit code.

**Options:**
- `--click "<exact text>"` - click a button by exact accessible name
  (e.g. `"EN"`, `"ES"`, `"FUJI"`, `"MAINNET"`). Repeatable, runs in
  order, one `--wait` pause after each.
- `--wait <ms>` - pause after load and after each click (default 300).
  Use ~50ms to simulate rapid double-clicks, ~1200ms for a deliberate
  user.
- `--screenshot <path>` - full-page PNG after all clicks finish.
- `--cookie "NAME=VALUE"` - set a cookie before navigating, e.g.
  `--cookie "NEXT_LOCALE=es"` to load directly in Spanish without
  clicking.

**Testing against production instead of local dev:** just pass a
`kumply.xyz` URL instead of `localhost:3000` - nothing else changes.

## Run (human path)

```bash
cd apps/web && pnpm dev
```

Opens on `http://localhost:3000`. Useless for an agent (no browser
here) - use the driver above instead.

## Gotchas

- **The `t64` package suffix.** This sandbox runs Ubuntu 24.04
  "noble," mid-transition to 64-bit `time_t`. Several packages that
  older guides call `libatk1.0-0` are actually `libatk1.0-0t64` here
  (same for `libasound2t64`, `libcups2t64`, `libatspi2.0-0t64`).
  `driver.mjs`'s `PACKAGES` list already has the right names for this
  image. If `ensureLibs()` fails with "Unable to locate package" or
  "no candidate" (e.g. on a different base image), re-derive with:
  ```bash
  apt-cache search --names-only "^libfoo"
  ```
  and update the list in `driver.mjs`.
- **`apt-get download` vs `apt-get install`.** Only `download` was
  used, and it needs no root - it just fetches the `.deb` to the
  current directory. `dpkg -x pkg.deb dir` then extracts the package's
  files into `dir` without installing anything system-wide or needing
  root either. Nothing here touches the actual system package
  database - it's pure download-and-unzip.
- **`driver.mjs` emulates a desktop browser at a narrow viewport, not a real
  phone - that distinction hides real mobile-only bugs.** A resized
  desktop Chromium context (`newContext({ viewport: {width: 375} })`,
  what `driver.mjs` does) reported a mobile navbar drawer as
  overflow-free at every width 320-1800px, both languages, open and
  closed - completely clean. A user's real Android Chrome screenshots
  showed a genuine overflow. Root cause: with real mobile emulation
  (`isMobile: true, hasTouch: true`, a real mobile UA), a `position:
  fixed` element with `overflow-y` but no `overflow-x` caused mobile
  Chrome to silently widen its own layout viewport
  (`window.innerWidth` != `document.documentElement.clientWidth`) to
  fit the overflowing content - even though it was transformed
  off-screen and `body{overflow-x:hidden}` was already in place.
  Desktop Chrome does not renegotiate the viewport that way, so a
  narrow-desktop-viewport test cannot see this class of bug at all.
  **For any mobile-specific bug report (especially anything the user
  saw on a real phone), don't trust a clean `driver.mjs` run as
  proof it's fine - retest with genuine device emulation.** `driver.mjs`
  has no flag for this yet; do it with a one-off script reusing the
  same chromium-cache/lib-path setup, swapping the plain `newContext`
  for a real device profile:
  ```js
  import { chromium, devices } from "playwright";
  // ...same ensureLibs()/LD_LIBRARY_PATH/findChromiumBinary() as driver.mjs...
  const context = await browser.newContext({ ...devices['Pixel 5'] });
  // or manually: { viewport: {width: 393, height: 851}, isMobile: true,
  //   hasTouch: true, userAgent: devices['Pixel 5'].userAgent, deviceScaleFactor: 3 }
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const bug = await page.evaluate(() => ({
    docWidth: document.documentElement.scrollWidth,
    winWidth: window.innerWidth,                      // compare this
    clientWidth: document.documentElement.clientWidth, // to this
  }));
  ```
  A mismatch between `winWidth` and `clientWidth` (not just
  `docWidth` vs `winWidth`) is the actual mobile-viewport-widening
  signal - checking only `scrollWidth` vs `innerWidth` on a desktop
  context, like the rest of this skill's own examples do, misses it
  entirely.
- **RSC prefetch aborts are normal, not bugs.** Next.js prefetches
  linked routes; a locale switch supersedes any in-flight prefetch,
  which Chrome reports as `net::ERR_ABORTED` in `failedRequests`. This
  shows up on every run and is not a failure signal by itself.
- **CSP-blocked third-party calls are pre-existing, unrelated noise.**
  `consoleErrors` will always include blocked calls to
  `fonts.reown.com`, `api.web3modal.org`, and `cca-lite.coinbase.com`
  (wallet-connect widget telemetry/fonts the site's CSP doesn't
  allowlist). Not caused by anything the driver does.
- **The dev server's own lockfile, not the port, decides "already
  running."** If you see `Another next dev server is already running`
  with a PID, that's a *different* Next.js instance than whatever
  answers on port 3000 - `lsof -ti:3000 -sTCP:LISTEN | xargs -r kill`
  doesn't always stop it.
- **A 200 on `localhost:3000` does not mean it's serving your latest
  edit - check what's actually listening before trusting the content.**
  Hit this three times in one session: a leftover `next start`
  (production) process from an earlier `pnpm build && pnpm start`
  verification step (e.g. after a dependency change) stayed bound to
  :3000 and kept answering 200 with the *pre-edit* build - no hot
  reload, because it's not `next dev`. Every symptom looked like the
  edit itself was wrong (clean `tsc`, correct-looking JSON, zero
  `pageErrors`) until the actual page content was diffed against what
  should have changed. Before trusting a running server on :3000,
  check what's actually bound to it:
  ```bash
  ss -ltnp | grep :3000          # or: lsof -i :3000
  ps -p <pid> -o pid,cmd         # "next-server (v...)" doesn't tell you
                                  # dev vs prod - check the cwd instead:
  pwdx <pid>                      # confirms which repo/checkout it's serving
  ```
  When in doubt (anytime a previous task in the same session ran
  `pnpm build`/`pnpm start`, or the server's uptime looks older than
  your last edit), just kill it and start a fresh `pnpm dev` rather
  than assuming a 200 means it's current:
  ```bash
  kill -9 <pid>; cd apps/web && nohup pnpm dev > /tmp/nextdev.log 2>&1 &
  ```
- **Locale is a cookie, not a URL prefix.** `apps/web/src/i18n/routing.ts`
  uses `localePrefix: 'never'` - there is no `/es/...` URL. To load a
  page pre-set to Spanish, use `--cookie "NEXT_LOCALE=es"`, not a URL
  segment.
- **`--click` matches the accessible name, not necessarily the visible
  text** - if a button has an `aria-label`, that overrides the visible
  text as its accessible name and `--click` has to use the label, not
  what's printed on the button. Hit this on `/pitch`'s language toggle:
  it renders "ES"/"EN" but carries `aria-label="Cambiar a español"` /
  `"Switch to English"`, so `--click "ES"` times out there even though
  `--click "ES"` works fine on the main site's navbar (no aria-label
  override there). If a click times out, check the button's actual
  `aria-label` in the source before assuming the visible text is wrong.
- **The site also renders both a desktop and a mobile nav with the
  same button labels** (`EN`, `ES`, ...) - `driver.mjs` clicks
  `.first()` match, which is the desktop one at the default 1280x900
  viewport this driver uses. If you resize the viewport, check which
  one is actually visible.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `libnspr4.so: cannot open shared object file` (raw Playwright, not via driver) | You bypassed the driver. Use `driver.mjs`, which sets `LD_LIBRARY_PATH` for you. |
| `apt-get download` prints `Unable to locate package X` | Package name changed for this base image - see the `t64` Gotcha above. |
| `No Playwright Chromium cache at ~/.cache/ms-playwright` | Run `npx --yes playwright install chromium` (Prerequisites). |
| `Cannot find package 'playwright'` when running `node driver.mjs` from elsewhere | Playwright is installed local to `.claude/skills/run-web/`, and Node resolves relative to the *script's* location - this should already work regardless of your cwd. If it doesn't, re-run the `npm install` from the Prerequisites step inside that exact directory. |
| Click times out / `getByRole('button', {name: ...})` not found | Check the button's `aria-label` in the source first - it overrides visible text as the accessible name (see Gotchas). If there's no `aria-label`, the visible text must match exactly (case-sensitive); inspect `bodyTextSample` from a run with no `--click` to confirm what's actually rendered. |
| Edit doesn't show up in a screenshot/curl, but `tsc`/`eslint` are clean | Don't assume the edit is wrong - check what's actually serving :3000 first (see the "200 does not mean current" Gotcha above). A leftover `next start` from an earlier verification step in the same session serves a frozen pre-edit build with no hot reload. |
