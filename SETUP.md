# KUMPLY - Dev Environment Setup

This file documents one-off, reproducible setup steps that are not part of `pnpm install`.

## Avalanche reference tooling (audit-only, never committed)

To audit KUMPLY's contracts and integrations against official Avalanche patterns, this repo
can pull in AVAXSKILLS (a Claude skills package) and three Ava Labs reference repos. None of
this is a runtime dependency of KUMPLY. It exists so an AI assistant or a human reviewer has
the same reference material available locally.

Everything below is project-scoped. Never use `-g` / `--global` when installing skills: that
writes to `~/.claude/skills/`, shared across every project on the machine, which would leak
Avalanche-specific skills into unrelated sessions. Project-scoped (`.claude/skills/`) is correct
here.

```bash
# 1. Avalanche skills (Apache-2.0, safe to use freely)
npx openskills install Ayomisco/avaxskills

# 2. Ava Labs reference repos (shallow clones, read-only reference)
mkdir -p .reference
cd .reference
git clone --depth 1 https://github.com/ava-labs/avalanche-cli.git
git clone --depth 1 https://github.com/ava-labs/avalanche-starter-kit.git
git clone --depth 1 https://github.com/ava-labs/icm-contracts.git
git clone --depth 1 https://github.com/ava-labs/subnet-evm.git
git clone --depth 1 https://github.com/ava-labs/precompile-evm.git
cd ..
```

Both `.claude/skills/avalanche-skills/` and `.reference/` are gitignored (see `.gitignore`,
"Avalanche reference tooling" section). The gitignore entry is scoped specifically to
`avalanche-skills/`, not all of `.claude/skills/`, so it never hides any of KUMPLY's own skills
if some get added there later.

None of this is committed to the public repo, under any circumstance:
- `avalanche-starter-kit` ships with no `LICENSE` file at all.
- The others are development/reference tooling, not something the shipped product needs
  at runtime.

**The one real exception:** if KUMPLY's Solidity ever imports something from `icm-contracts`,
that stops being "cloned to consult" and becomes a real project dependency. In that case it gets
declared properly (`foundry.toml` / `remappings.txt`, or `package.json` for an npm-published
package), installed with `forge install` / `npm install` (still gitignored under `lib/` or
`node_modules/`), and pinned to an exact version in whichever lockfile the tool produces. That
lockfile is committed, same as any other dependency.

## License limits on this tooling

Already verified, listed here for reference (do not re-verify unless a license file changes):

| Source | License | Limit |
|---|---|---|
| AVAXSKILLS | Apache-2.0 | None. Use freely. |
| `avalanche-cli`, `icm-contracts` | Ava Labs Ecosystem License 1.1 | Use/redistribution allowed only while the project stays "operationally connected" to the Avalanche Public Blockchain (Mainnet, Fuji, C/P/X-Chain, or subnets/L1s). KUMPLY qualifies natively. Do not use either as a base for anything that also needs to run on a non-Avalanche network. |
| `subnet-evm`, `precompile-evm` | LGPL-3.0 | Copyleft on modifications to the library itself, not on separate works that merely link/interact with it. KUMPLY does not vendor or modify either, only reads them as reference. Same read-only rule as the rest: never copy code verbatim into KUMPLY. |
| `avalanche-starter-kit` | none (no `LICENSE` file) | Treat as **read-only**: study the pattern (cross-chain messages, calling contracts on another chain, Teleporter asset bridging), never copy code verbatim into KUMPLY without confirming terms with Ava Labs first. |

## Removing the reference tooling

Since none of it is committed, removal is just:

```bash
rm -rf .claude/skills/avalanche-skills .reference
```
