---
name: full-context-loading
description: >
  How every answer in this project should already reflect the full
  stack of available context — this project's CLAUDE.md/AGENTS.md,
  persistent memory, this project's own hand-built skills, Claude's
  global skills, and any installed community/network skill packages —
  without re-reading everything on every turn or bloating token usage.
  Covers what already loads automatically for free, what the actual
  discipline fix is (checking what exists before answering from
  scratch), what NOT to do (force full preload of every skill body),
  and a live inventory of what exists in this project so a fresh
  session doesn't have to rediscover it. Use at the start of a new
  session, when asked "do you have full context," or whenever an
  answer risks being generic instead of grounded in what this project
  already knows.
---

# Full context loading — every answer grounded, without re-reading everything

## What already loads automatically, every session, at zero extra cost

No action needed for these — verify they're actually true for this
project, then treat them as given:

- **`CLAUDE.md` (and any file it imports, e.g. `AGENTS.md`)** — injected
  as project instructions automatically at session start. This is where
  this project's hard rules and file map should already live.
- **The persistent memory system**, if this project has one — its
  index file (commonly `MEMORY.md`) loads automatically every session;
  the full content of any individual memory entry loads only when
  read. Check the index before answering something it might already
  cover — don't re-derive a fact memory already has.
- **Every installed Skill's name + description** — Claude Code shows
  this list automatically at session start, at a cost of tens of tokens
  per skill. The **full body** of a skill loads only when a task
  matches its description (via the `Skill` tool) or is loaded here
  explicitly. **This is already the token-saving mechanism this project
  needs — it does not need to be rebuilt.**

## The real fix: actively check before answering, don't wait to be told

The gap this skill exists to close isn't a missing preload — it's a
session answering a non-trivial request as if none of the above
existed, when a quick check would have surfaced something directly
relevant. Before answering anything beyond a trivial or purely
conversational request, run this check:

1. **Does an available Skill's description match this task?** If yes,
   invoke it (`Skill` tool) instead of reasoning from scratch what it
   already documents.
2. **Does this project's memory index name something relevant?** Read
   that entry before asserting a fact "from nothing" — a past
   correction, a verified figure, a standing decision may already be
   there.
3. **Does a playbook or reusable-process doc this project actually
   has** (only if one exists — don't assume a `playbooks/` folder
   exists just because another project has one) **already cover this
   kind of task?**
4. **Is there a community/network skill package installed** that's more
   current than what's in memory or in a hand-built skill? Skill
   packages get updated independently of this project's own memory.

This is a discipline to apply every time, not a one-time setup step —
don't answer from a blank slate what an already-available resource
already covers.

## What NOT to do — don't force full preload

Loading every skill's entire body and every memory entry into context
on every session start would cost real tokens for content irrelevant
to most requests — this directly fights the goal of not wasting
tokens, not serves it. The name+description-only preload already IS
the correct mechanism for exactly this tradeoff: cheap awareness that
something exists, full cost only when it's actually used. Don't try to
route around it by dumping full content somewhere it'll be re-read
every turn.

## Inventory — what exists in THIS project right now

Verified directly against the filesystem on 2026-09-17 (`ls`/`find`,
real file reads) — not copied from another project. Skills below marked
"localized" had portfolio-wide/sibling-project references stripped and
replaced with Kumply-specific ones before being kept in this repo; see
each skill's own git-blame for the localization commit.

- **This project's own hand-built skills** (`.claude/skills/` in this
  repo, no `.openskills.json` — authored specifically for Kumply, not
  pulled from an external package):
  - `mexico-legal-check` — checks whether a Kumply feature/claim needs
    Mexican financial-regulatory registration (IFPE, LFPIORPI actividad
    vulnerable, intermediación con valores). Installed 12-Sep-2026,
    localized 17-Sep-2026 (frontmatter/intro previously named five
    sibling portfolio projects and a hub-only skill; now scoped to
    KUMPLY only, cites `LEGAL_REVIEW_BRIEF.md`/`KumplyMainnet.md`
    instead of a non-existent `legal/ARQUITECTURA-LEGAL.md`).
  - `claude-antigravity-setup` — how to configure a Claude Code +
    Antigravity session for this workspace (CLAUDE.md/AGENTS.md
    structure, memory, hooks, token cost). Installed 20-Aug-2026.
  - `teammate-commit-identity` — safe git/gh mechanics for committing
    or acting under Monserrat's (M0nsxx) real identity: isolated config
    (never `--global`), why a signing key can never be copied between
    machines, the correct unsigned-then-she-signs hand-off pattern.
    Installed 17-Sep-2026, localized from a generic portfolio version
    (real names substituted for placeholders, a self-referential
    editorial-history paragraph removed, and its example incident
    pointed at this project's own real, still-unresolved
    `[[kumply-monse-signing-key-exposure]]` finding instead of a
    generic placeholder).
  - `grants-track-record`, `hackathon-fit-check`, `public-claim-verify`,
    `repo-security-sweep`, `doc-accuracy-audit`, `portfolio-funding-rollup`
    — generic, ecosystem-agnostic process skills (real-source
    verification discipline for grant history, hackathon-participation
    decisions, public claims, repo hygiene, doc-vs-reality checks, and a
    funding ledger). Installed 17-Sep-2026, no localization needed — none
    named any project by name.
  - `full-context-loading` (this file).

- **A non-Skill instruction file that predates the Skill-tool
  convention** — `.agents/skills/core-context/SKILL.md`. Despite the
  path, it has no `name`/`description` frontmatter and is not
  discoverable via the `Skill` tool; it's a plain-markdown instruction
  ("read CLAUDE.md and claude_estrategico.md before doing anything")
  meant for any AI tool that reads `.agents/`, not specifically Claude
  Code's Skill mechanism. Don't confuse it with a real installed skill.

- **Community/network skill packages installed** (have
  `.openskills.json` or came via `npx skills add`):
  - `avalanche-skills` (source: `Ayomisco/avaxskills`, full `-g`
    install) — 66-skill index of granular Avalanche guides (Subnets,
    Warp/ICM, x402, security, SDKs, Hardhat, etc.). Installed
    17-Aug-2026; this is the package used for the 7-round ecosystem
    audit referenced in `CLAUDE.md`. Verified live at
    `.claude/skills/avalanche-skills/`.
  - `avalanche` (source: `bytesagain/ai-skills`, single-skill install)
    — a generic one-paragraph Avalanche reference tool, no real depth
    beyond a pointer. Installed 13-Sep-2026, originally at
    `.agents/skills/avalanche/` and symlinked into
    `.claude/skills/avalanche`; that symlink pointed into the
    gitignored `.agents/` tree and would have broken on a fresh clone —
    fixed 17-Sep-2026 by materializing a real copy at
    `.claude/skills/avalanche/` instead. Redundant with
    `avalanche-skills` for anything Kumply-specific; only useful as a
    fallback if the Ayomisco package is ever removed. Questionable
    value beyond that — not part of the sanctioned toolset `SETUP.md`
    documents, consider removing if it never gets used.

- **Claude's own global skills** (`~/.claude/skills/`) — this account
  is shared across other projects (a Stellar-focused toolset
  dominates that directory: `stellar-dev`, `smart-contracts`,
  `standards`, `dapp`, `zk-proofs`, `scf-*`, and similar — none of
  which apply to Kumply's Avalanche/Solidity/Next.js stack, so treat
  them as belonging to a sibling project, not this one). The one
  global skill actually relevant here:
  - `code-review` — adversarial multi-pass code review; usable on any
    Kumply PR/diff regardless of stack.
  A handful of other generically useful skills (`security-review`,
  `session-close`, `simplify`, `run`, `init`, `dataviz`,
  `update-config`) are bundled with Claude Code itself rather than
  living as directories under `~/.claude/skills/` — they show up in
  the available-skills list every session but aren't project files to
  track here.

- **Playbooks** (`playbooks/` at repo root, referenced from
  `AGENTS.md`) — real, verified:
  - `playbooks/continue.md` — session-resumption and
    zero-hallucination discipline.
  - `playbooks/images.md` — screenshot/image token-cost handling.
  - `playbooks/git.md` — PR/issue/comment writing discipline.

- **Persistent memory — two files that could both be called "memory,"
  named distinctly on purpose:**
  - The **real persistent-memory index** Claude Code auto-loads every
    session: `/home/vaiosvaios/.claude/projects/-home-vaiosvaios-Kumply/memory/MEMORY.md`,
    with individual dated fact files alongside it in the same
    directory (`kumply-*.md`, `team1-grant-process.md`, etc.). This is
    the one this skill's "check before answering" rule means.
  - A **project-root prose status doc**, `Memory.md` (repo root,
    16.5KB, last touched 18-Aug-2026, gitignored) — a narrative
    project-state snapshot for any human/AI arriving cold. Useful
    background, but it is NOT the auto-loaded memory index above and
    can go stale between updates — don't treat it as current without
    checking its own last-updated date first.

## Verifying anything date-sensitive — always fresh, never from training memory

A memory entry or a skill's own text can be stale by the time it's
read. When a task needs external, current information (a price, a
version, a legal deadline, a repo's live state), verify it live via
WebSearch/WebFetch/`gh api`/`npm view` on the day it's asked, every
time — regardless of how confidently a prior memory or skill states it.

## Related

- [[mexico-legal-check]] — hand-built skill listed above.
- [[claude-antigravity-setup]] — hand-built skill listed above; covers
  the same CLAUDE.md/AGENTS.md/memory stack from the setup side rather
  than the per-answer discipline side.
