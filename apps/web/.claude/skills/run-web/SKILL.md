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
  doesn't always stop it. If curl to `localhost:3000` already returns
  200, you likely don't need to start a new one at all.
- **Locale is a cookie, not a URL prefix.** `apps/web/src/i18n/routing.ts`
  uses `localePrefix: 'never'` - there is no `/es/...` URL. To load a
  page pre-set to Spanish, use `--cookie "NEXT_LOCALE=es"`, not a URL
  segment.
- **Buttons only match by exact visible text**, and the site renders
  both a desktop and a mobile nav with the same button labels (`EN`,
  `ES`, ...) - `driver.mjs` clicks `.first()` match, which is the
  desktop one at the default 1280x900 viewport this driver uses. If
  you resize the viewport, check which one is actually visible.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `libnspr4.so: cannot open shared object file` (raw Playwright, not via driver) | You bypassed the driver. Use `driver.mjs`, which sets `LD_LIBRARY_PATH` for you. |
| `apt-get download` prints `Unable to locate package X` | Package name changed for this base image - see the `t64` Gotcha above. |
| `No Playwright Chromium cache at ~/.cache/ms-playwright` | Run `npx --yes playwright install chromium` (Prerequisites). |
| `Cannot find package 'playwright'` when running `node driver.mjs` from elsewhere | Playwright is installed local to `.claude/skills/run-web/`, and Node resolves relative to the *script's* location - this should already work regardless of your cwd. If it doesn't, re-run the `npm install` from the Prerequisites step inside that exact directory. |
| Click times out / `getByRole('button', {name: ...})` not found | Text must match exactly (case-sensitive) what's rendered - check the actual label first, e.g. by inspecting `bodyTextSample` from a run with no `--click`. |
