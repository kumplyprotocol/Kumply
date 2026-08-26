# git.md - how PRs, issues, and comments get written on GitHub

## Scope

Anything published to GitHub from this workspace - a PR description, an
issue report (own repo or upstream), or a comment on either. Commit
message conventions (the `Co-Authored-By` trailer itself) already live in
`AGENTS.md`'s Commits section; this file covers the surface a human
actually reads: PR/issue bodies and comments, where the writing quality
is what gets a maintainer to act instead of skim past.

## Humanized, not verbose

Write like a person reporting something they actually found, not like a
template being filled in. Concretely:

- No em dashes, no curly quotes, no unicode ellipsis. Plain hyphens,
  straight quotes, `...` if truly needed.
- No filler openers ("I wanted to reach out about...", "Upon further
  investigation..."). Start with the finding.
- One clear claim per paragraph. If a reproduction needs five commands,
  show five commands in a code block, don't narrate them in prose.
- Say what you checked and what you didn't, in one line, not a
  disclaimer paragraph. "Checked X against Y; didn't check Z" beats
  hedging every sentence.

This is the same discipline already applied to the AVAXSKILLS issues
filed from this workspace (#2, #3, #4 at Ayomisco/avaxskills): a title
that states the bug, a reproduction anyone can run, and a suggested fix
- no preamble, no "hope this helps" close.

## Co-authorship stays visible, never stripped for polish

Every AI-assisted commit already carries `Co-Authored-By: Claude Sonnet 5
<noreply@anthropic.com>` (or the equivalent model), per `AGENTS.md`. When
that commit becomes part of a PR, the trailer rides along in the commit
history whether or not the PR description repeats it - never rewrite
history (`git commit --amend`, a squash that drops the trailer) just to
make the PR read as fully human-authored. If an issue or comment was
drafted with AI assistance and isn't just relaying a commit, say so
plainly rather than let it pass as unassisted. Matches the disclosure
already public in `docs/AI-USAGE.md`: the point isn't to hide the
tooling, it's to make the finding itself hold up on its own regardless
of who or what found it.

## Re-read before quoting another thread

When a PR, issue, or comment cites or paraphrases something from another
thread, the order of operations matters:

1. Re-read the actual source today, before writing the citation - never
   quote from what this session already read earlier.
2. Only then, and only if the source really was re-read, does the
   disclosure get a second sentence:

```
Disclosure: drafted with AI assistance under my direction and reviewed
by hand. Both quotations above were re-verified against the linked
comments today.
```

Adjust "Both" / "the" to the actual number of quotes.

That second sentence is the consequence of re-reading, not a template
pasted first and justified after the fact. If there wasn't time to
re-read the source before publishing, leave the sentence out - a short,
true disclosure beats a longer one nothing backs up. A specific claim
that turns out false is worse than a vague one nobody ever checks,
because now there's something concrete to contradict if someone
verifies it.

Applies to new comments going forward, not a retroactive fix for
anything already published.

## Propose the fix, not just the report - when the root cause is confirmed

If the investigation already nailed the root cause, the issue includes
the fix, not just the symptom. Two real precedents from this workspace:

- The AVAXSKILLS issues each closed with a "Suggested fix" line stating
  the exact correction (e.g. `txAllowListConfig` instead of
  `transactionAllowListConfig`), not just "this key looks wrong."
- The `icm-contracts` CONTRIBUTING.md typo was prepared as an actual diff
  on a fork branch before anything was reported - the report and the fix
  were the same action, not two separate steps.

When the cause isn't confirmed yet - a hunch, a symptom without a
traced-through explanation - say that explicitly instead of guessing at
a fix. A wrong proposed fix is worse than no proposed fix; an honest "I
found X, haven't traced the cause yet" is a valid report on its own.

## Before publishing, check

1. Title states the bug/change, not a vague category ("bug in X" is
   worse than "X returns wrong value when Y").
2. Reproduction steps are copy-pasteable, not paraphrased.
3. If the root cause is confirmed: a fix is proposed, ideally as a diff
   or the exact corrected value/line.
4. No em dash, curly quote, or unicode ellipsis anywhere in the text.
5. If AI assisted the finding or the writeup, that's not hidden.
6. If citing or paraphrasing another thread: the source was re-read
   today, and the disclosure's re-verification sentence appears only if
   that's actually true.
7. Read it once as the maintainer who'll see it cold - does it explain
   itself without needing the conversation that produced it?

## Installing this in a new project - two steps, not one

This file alone does nothing - nothing loads it automatically. Copy it
to `playbooks/git.md`, then add this to the end of `AGENTS.md`:

```
**Every PR, issue, and comment published to GitHub is written humanized
and tight - no padding, no AI-writing tells (em dashes, curly quotes,
unicode ellipsis), and the Co-Authored-By disclosure stays visible,
never stripped out to look more human.** Detail in `playbooks/git.md`.

**When the root cause is already confirmed, propose the actual fix, not
just the report.** A diff, corrected line, or exact reproduction beats
"this seems broken." Detail in `playbooks/git.md`.

**When citing or paraphrasing another thread, re-read the actual source
today before writing the citation - the disclosure's re-verification
sentence is only added if that re-read really happened.** A short, true
disclosure beats a longer one nothing backs up. Detail in
`playbooks/git.md`.
```
