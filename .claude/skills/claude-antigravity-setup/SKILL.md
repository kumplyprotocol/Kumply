---
name: claude-antigravity-setup
description: >
  How to configure and optimize a Claude Code + Antigravity session for any
  project — CLAUDE.md/AGENTS.md structure, memory, Skills, hooks, subagents,
  context window and compaction limits, token cost reduction, and Anthropic's
  persistent memory tool. Use when starting a brand-new project or folder in
  this workspace, when CLAUDE.md is getting long, when a session hits
  context/compaction limits, when deciding whether something should be a
  Skill vs. a hook vs. inline CLAUDE.md content, when asked about
  performance, token usage, or session duration, when pasting an image or
  screenshot into a session, when resuming a session with `--continue`, or
  when writing a PR, issue, or comment to publish on GitHub.
allowed-tools: [Read, Edit, Write, Grep, Glob, Bash]
---

# Setting up a new project for Claude Code + Antigravity

## Do this for every new project, from the start — not after it grows

1. Create `CLAUDE.md` at the project root, and keep it under ~200 lines.
   Hard rules that apply always go here. Everything else (history,
   one-off decisions, deep reference material) goes in its own file,
   referenced by link, not pasted inline.
2. Create `AGENTS.md` at the root too, same hard rules, and add
   `@AGENTS.md` as the first line of `CLAUDE.md` so it imports
   automatically — this keeps Antigravity and Claude Code reading the
   same rules from one real source, since whether Claude Code natively
   reads AGENTS.md is still unconfirmed upstream as of 18-ago-2026.
3. Set up an external memory pointer if this project spans multiple
   sessions over time — memory files should live outside the project
   folder so they survive it being moved or deleted.
4. Before writing a new Skill, check if a hook fits better. Anything
   that should never be skippable or forgettable belongs in a hook
   (`.claude/hooks/` or `settings.json`), not a Skill — Skills only load
   when the model judges them relevant, hooks run deterministically
   every time the trigger event fires.
5. Only include the files a task actually needs, not whole directories —
   measured savings of 60-80% fewer tokens for equal output quality.
6. Run `/compact` proactively at the end of a discrete sub-task, don't
   wait for auto-compaction at ~83.5% context usage. Use `/recap` when
   resuming a session after a break.
7. Copy `.claude/commands/session-close.md` (given below) into this
   project too, and use `/session-close` at the end of a session instead
   of a vague "make sure everything's updated."
8. Copy `playbooks/continue.md` into this project, and add its two rules
   to the end of `AGENTS.md` — the file alone does nothing, only
   `AGENTS.md` loads automatically every session.
9. Copy `playbooks/images.md` into this project, and add its two rules
   to the end of `AGENTS.md` — same pattern as step 8.
10. Copy `playbooks/git.md` into this project, and add its two rules to
    the end of `AGENTS.md` — same pattern as step 8. Covers how PRs,
    issues, and comments get written before anything is published to
    GitHub: humanized, no AI-writing tells, Co-Authored-By never
    stripped, and a proposed fix included whenever the root cause is
    already confirmed.

## Quick facts

- Only `CLAUDE.md` (full) and an external memory system (if one exists
  for this project) load automatically every session. A Skill's full
  content only loads when relevant to the task at hand.
- `SKILL.md` is the same format in both Claude Code and Antigravity as
  of 2026 — one file works in either.
- Context limit: 200K tokens standard plan, up to 1M on Max/Team/
  Enterprise via Opus 4.6.

## Verify before trusting any line count or file-size claim

Numbers in the full research doc (`PLAYBOOK-claude-antigravity-setup.md`)
were measured in the workspace where this was first written, not
necessarily this one. Re-check with `wc -l CLAUDE.md` before citing a
specific figure for *this* project — a stale or borrowed number is exactly
the kind of unverified claim this whole workspace's audit discipline
exists to catch.
