# Security Policy

## Reporting a vulnerability

**Please don't report security issues in public GitHub issues, discussions or pull requests.**

Report them privately through GitHub: go to the repository's **Security** tab and click **Report a vulnerability**. If that isn't available to you, email **hello@kumply.xyz** with "SECURITY" in the subject.

Please include:

- the affected component (contract and network, SDK version, API endpoint or page);
- steps to reproduce, or a proof of concept;
- the impact you expect.

We aim to acknowledge reports within 3 business days and to keep you updated until a fix ships. We will credit you in the release notes unless you prefer otherwise.

## Scope

- Smart contracts in `contracts/contracts/`, including the deployments listed in the README (Fuji and Mainnet C-Chain).
- `@kumply/sdk` on npm.
- The API (`kumply-api.fly.dev`) and the site (`kumply.xyz`).

Contracts on Mainnet C-Chain run as a read-only beta with `verificationFee = 0`. The deployed contracts are not upgradeable, so a fix may mean a redeploy.

## Please don't

- Test against Mainnet C-Chain in a way that writes state, or spend other people's funds.
- Run denial-of-service tests against the API or the site.
- Access, modify or delete data that isn't yours.
