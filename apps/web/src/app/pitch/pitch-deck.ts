// Auto-generated from the KUMPLY grant pitch deck artifact (July 2026).
// Self-contained: rendered only on the standalone /pitch route.

export const DECK_CSS = `

  :root {
    --ink: #F2F0EE;
    --ink-2: #A8A5A1;
    --ink-3: #6E6B68;
    --ground: #0B0B0D;
    --panel: #141416;
    --panel-2: #1B1B1E;
    --line: #26262A;
    --crimson: #E5484D;
    --crimson-soft: rgba(229, 72, 77, 0.12);
    --live: #46A758;
    --live-soft: rgba(70, 167, 88, 0.12);
    --amber: #D9A036;
    --amber-soft: rgba(217, 160, 54, 0.12);
    --mono: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
    --sans: "Avenir Next", "Segoe UI", system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: light) {
    :root {
      --ink: #1C1917; --ink-2: #57534E; --ink-3: #8A8580;
      --ground: #FAF9F7; --panel: #FFFFFF; --panel-2: #F3F1EE;
      --line: #E5E2DE;
      --crimson: #C0323B; --crimson-soft: rgba(192, 50, 59, 0.09);
      --live: #2F7A3D; --live-soft: rgba(47, 122, 61, 0.10);
      --amber: #9A6D14; --amber-soft: rgba(154, 109, 20, 0.10);
    }
  }
  :root[data-theme="dark"] {
    --ink: #F2F0EE; --ink-2: #A8A5A1; --ink-3: #6E6B68;
    --ground: #0B0B0D; --panel: #141416; --panel-2: #1B1B1E;
    --line: #26262A;
    --crimson: #E5484D; --crimson-soft: rgba(229, 72, 77, 0.12);
    --live: #46A758; --live-soft: rgba(70, 167, 88, 0.12);
    --amber: #D9A036; --amber-soft: rgba(217, 160, 54, 0.12);
  }
  :root[data-theme="light"] {
    --ink: #1C1917; --ink-2: #57534E; --ink-3: #8A8580;
    --ground: #FAF9F7; --panel: #FFFFFF; --panel-2: #F3F1EE;
    --line: #E5E2DE;
    --crimson: #C0323B; --crimson-soft: rgba(192, 50, 59, 0.09);
    --live: #2F7A3D; --live-soft: rgba(47, 122, 61, 0.10);
    --amber: #9A6D14; --amber-soft: rgba(154, 109, 20, 0.10);
  }

  * { box-sizing: border-box; }
  body {
    background: var(--ground);
    color: var(--ink);
    font-family: var(--sans);
    line-height: 1.55;
    margin: 0;
    padding: 3rem 1.25rem 4rem;
    -webkit-font-smoothing: antialiased;
  }
  .deck { max-width: 960px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }

  .slide {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 3rem 3.25rem;
    position: relative;
  }
  .slide-head {
    display: flex; justify-content: space-between; align-items: baseline;
    margin-bottom: 1.75rem;
  }
  .eyebrow {
    font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--crimson); font-weight: 600;
  }
  .slide-num { font-family: var(--mono); font-size: 0.72rem; color: var(--ink-3); }

  h1, h2 { text-wrap: balance; margin: 0; }
  h1 { font-size: 3.1rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.06; }
  h2 { font-size: 1.85rem; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 1.1rem; }
  h3 { font-size: 0.95rem; font-weight: 700; margin: 0 0 0.35rem; }
  p { margin: 0; }
  .lede { font-size: 1.08rem; color: var(--ink-2); max-width: 62ch; }
  .lede strong, .cell p strong, .note strong { color: var(--ink); font-weight: 700; }

  .badge {
    display: inline-flex; align-items: center; gap: 0.45em;
    font-family: var(--mono); font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 0.3em 0.75em; border-radius: 999px;
  }
  .badge::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  .badge.live { color: var(--live); background: var(--live-soft); }
  .badge.warn { color: var(--amber); background: var(--amber-soft); }
  .badge.brand { color: var(--crimson); background: var(--crimson-soft); }

  .grid { display: grid; gap: 0.9rem; margin-top: 1.5rem; }
  .grid.cols-2 { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
  .grid.cols-3 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
  .founder-cell { display: flex; gap: 1rem; align-items: flex-start; }
  .avatar {
    width: 56px; height: 56px; border-radius: 50%; flex-shrink: 0;
    object-fit: cover; border: 1px solid var(--line);
    background: var(--panel-2);
  }
  .founder-info { min-width: 0; }

  .cell {
    background: var(--panel-2); border: 1px solid var(--line);
    border-radius: 10px; padding: 1.15rem 1.3rem;
  }
  .cell p { font-size: 0.88rem; color: var(--ink-2); }
  .cell .kpi { font-size: 1.9rem; font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
  .cell .kpi-label { font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); margin-top: 0.2rem; }

  code, .addr {
    font-family: var(--mono); font-size: 0.8rem;
    background: var(--panel-2); border: 1px solid var(--line);
    padding: 0.12em 0.45em; border-radius: 6px; color: var(--ink);
    word-break: break-all;
  }
  a { color: var(--crimson); text-decoration: none; border-bottom: 1px solid transparent; }
  a:hover, a:focus-visible { border-bottom-color: var(--crimson); }
  a:focus-visible { outline: 2px solid var(--crimson); outline-offset: 2px; border-radius: 2px; }

  table { width: 100%; border-collapse: collapse; margin-top: 1.4rem; font-size: 0.9rem; }
  th {
    text-align: left; font-family: var(--mono); font-size: 0.68rem;
    letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3);
    font-weight: 600; padding: 0 0.9rem 0.6rem 0; border-bottom: 1px solid var(--line);
  }
  td { padding: 0.7rem 0.9rem 0.7rem 0; border-bottom: 1px solid var(--line); vertical-align: top; color: var(--ink-2); }
  td:first-child { color: var(--ink); font-weight: 600; white-space: nowrap; }
  tr:last-child td { border-bottom: none; }
  .table-wrap { overflow-x: auto; }
  .num { font-variant-numeric: tabular-nums; font-family: var(--mono); font-size: 0.85rem; }

  .flow { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: stretch; margin-top: 1.6rem; }
  .flow-step {
    flex: 1 1 150px; background: var(--panel-2); border: 1px solid var(--line);
    border-radius: 10px; padding: 0.9rem 1rem; position: relative;
  }
  .flow-step .step-label { font-family: var(--mono); font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--crimson); font-weight: 600; }
  .flow-step h3 { margin-top: 0.25rem; font-size: 0.9rem; }
  .flow-step p { font-size: 0.78rem; color: var(--ink-2); margin-top: 0.2rem; }

  .proof { display: flex; align-items: baseline; gap: 0.6rem; flex-wrap: wrap; margin-top: 0.4rem; }
  .proof .label { font-family: var(--mono); font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }

  .note {
    margin-top: 1.6rem; padding: 1rem 1.25rem; border-radius: 10px;
    background: var(--crimson-soft); border: 1px solid var(--crimson);
    font-size: 0.9rem; color: var(--ink-2);
  }
  .footer-links { display: flex; flex-wrap: wrap; gap: 1.4rem; margin-top: 1.6rem; font-family: var(--mono); font-size: 0.82rem; }
  .legal { margin-top: 2rem; font-size: 0.72rem; color: var(--ink-3); max-width: 72ch; line-height: 1.6; }

  .title-slide { padding: 4.5rem 3.25rem; }
  .wordmark { font-size: 1rem; font-weight: 800; letter-spacing: 0.22em; margin-bottom: 2.2rem; }
  .wordmark .dot { color: var(--crimson); }
  .title-badges { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-top: 1.8rem; }

  @media (max-width: 640px) {
    .slide, .title-slide { padding: 2rem 1.4rem; }
    h1 { font-size: 2.1rem; }
    h2 { font-size: 1.45rem; }
  }
  @media (prefers-reduced-motion: no-preference) {
    .slide { transition: border-color 0.2s ease; }
    .slide:hover { border-color: var(--ink-3); }
  }

`;

export const DECK_HTML = `
<div class="deck">

  <!-- 01 · Title -->
  <section class="slide title-slide">
    <div class="slide-head">
      <span class="eyebrow">Grant Application Deck · August 2026</span>
      <span class="slide-num">01 / 12</span>
    </div>
    <p class="wordmark">KUMPLY<span class="dot">.</span></p>
    <h1>The compliance layer for the Avalanche ecosystem.</h1>
    <p class="lede" style="margin-top: 1.4rem;">
      On-chain KYC, KYB, and KYA attestations that any dApp or sovereign L1 can verify in under a second -
      plus the first Avalanche L1 designed so that every validator must pass business verification (KYB) to join consensus.
    </p>
    <div class="title-badges">
      <span class="badge live">Live on Mainnet C-Chain · Beta</span>
      <span class="badge brand">ACP-99 · ACP-77 · ICM</span>
      <span class="badge warn">Production KYC is the next milestone</span>
    </div>
    <div class="footer-links">
      <a href="https://kumply.xyz">kumply.xyz</a>
      <a href="https://github.com/kumplyprotocol/Kumply">github.com/kumplyprotocol/Kumply</a>
      <a href="https://www.npmjs.com/package/@kumply/sdk">npm: @kumply/sdk</a>
    </div>
  </section>

  <!-- 02 · Problem -->
  <section class="slide">
    <div class="slide-head">
      <span class="eyebrow">Problem</span>
      <span class="slide-num">02 / 12</span>
    </div>
    <h2>Institutions can't answer one question on-chain: who is the counterparty?</h2>
    <p class="lede">
      A regulated entity cannot transact with an EVM address it cannot resolve. And under Mexican data-protection
      law (LFPDPPP), every party that stores the identity documents behind that resolution carries the liability for
      holding them. So the workarounds below don't just add friction - each one duplicates a legal exposure that
      nobody wants. What's missing is a <strong>compliant counterparty-resolution layer</strong>: a way to prove who
      is on the other side without every participant holding the underlying documents.
    </p>
    <div class="grid cols-3">
      <div class="cell">
        <h3>Off-chain whitelists</h3>
        <p>Break composability. Every integration is a bespoke bilateral agreement.</p>
      </div>
      <div class="cell">
        <h3>Per-dApp KYC</h3>
        <p>Users re-verify for every app. Costs repeat; liquidity fragments.</p>
      </div>
      <div class="cell">
        <h3>Permissioned forks</h3>
        <p>Walled gardens disconnected from public DeFi and its liquidity.</p>
      </div>
    </div>
    <p class="lede" style="margin-top: 1.5rem;">
      And a new class of counterparty is arriving faster than any of these workarounds can handle:
      <strong>autonomous AI agents</strong> transacting with real capital.
    </p>
  </section>

  <!-- 03 · Solution -->
  <section class="slide">
    <div class="slide-head">
      <span class="eyebrow">Solution</span>
      <span class="slide-num">03 / 12</span>
    </div>
    <h2>Verify once. Composable everywhere.</h2>
    <p class="lede">
      A user, business, or AI agent verifies once through KUMPLY. The credential is written to the
      <strong>AttestationStore</strong> contract - no personal data on-chain, just wallet, tier, and expiry.
      From that moment, any contract on Avalanche resolves the counterparty with one free
      <code>verify(address)</code> call.
    </p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Tier</th><th>Credential</th><th>Who it's for</th></tr></thead>
        <tbody>
          <tr><td>Tier 1–3</td><td>KYC - Basic / Standard / Enhanced</td><td>Individuals, from retail DeFi to regulated products</td></tr>
          <tr><td>Tier 4</td><td>KYB - Business verification</td><td>Companies; required to validate on the KUMPLY L1</td></tr>
          <tr><td>Tier 5</td><td>KYA - Know Your Agent</td><td>Autonomous AI agents operating on-chain capital</td></tr>
        </tbody>
      </table>
    </div>
    <p class="note"><strong>A primitive, not a walled SaaS.</strong> KUMPLY is Apache 2.0-licensed contracts plus a TypeScript SDK.
      Any Avalanche dApp or sovereign L1 integrates compliance in a few lines - nobody has to route through our app.</p>
  </section>

  <!-- 04 · Live proof -->
  <section class="slide">
    <div class="slide-head">
      <span class="eyebrow">Working today - every claim clickable</span>
      <span class="slide-num">04 / 12</span>
    </div>
    <h2>Don't trust the deck. Click it.</h2>
    <div class="grid cols-3">
      <div class="cell"><div class="kpi">164</div><div class="kpi-label">automated tests, CI on every push</div></div>
      <div class="cell"><div class="kpi">&lt; 1 s</div><div class="kpi-label">on-chain credential lookup</div></div>
      <div class="cell"><div class="kpi">~3 s</div><div class="kpi-label">KYC approval → credential on-chain</div></div>
    </div>
    <div class="grid cols-2">
      <div class="cell">
        <h3>Contracts verified on both networks</h3>
        <p class="proof"><span class="label">AttestationStore · Mainnet</span>
          <a class="addr" href="https://snowtrace.io/address/0xa116261Ed3a848A9E1cd34923D5A0442D1455F71">0xa116…5F71</a></p>
        <p class="proof"><span class="label">ComplianceGate · Mainnet</span>
          <a class="addr" href="https://snowtrace.io/address/0x01BEEA13A485c7bAD58f926E345325e9e3773bEe">0x01BE…3bEe</a></p>
        <p class="proof"><span class="label">AttestationStore · Fuji</span>
          <a class="addr" href="https://testnet.snowtrace.io/address/0xa3Bc5564A18e107807aF41fF2a5215Db050b22dD">0xa3Bc…22dD</a></p>
        <p class="proof"><span class="label">ComplianceGate · Fuji</span>
          <a class="addr" href="https://testnet.snowtrace.io/address/0xcFDdeA5482baE9A6733B58F6a39FC36BCe6164cF">0xcFDd…64cF</a></p>
        <p class="proof"><span class="label">ValidatorSetManager (Fuji)</span>
          <a class="addr" href="https://testnet.snowtrace.io/address/0x7Dc03c4Af8a604E602A0237eb2f6868B95097333">0x7Dc0…7333</a></p>
        <p style="margin-top: 0.6rem; font-size: 0.85em;">Read-path smoke tests run live against both deployments on every release: <strong>8/8 on mainnet, 10/10 on Fuji</strong> (incl. gate rejection/admission paths).</p>
      </div>
      <div class="cell">
        <h3>End-to-end flow, live</h3>
        <p>Connect wallet → Sumsub identity check → webhook issues the attestation on-chain → app shows the credential.
          Full loop runs in about three seconds after approval.</p>
        <p class="proof" style="margin-top: 0.6rem;">
          <a href="https://kumply.xyz/verify">Try it: kumply.xyz/verify</a>
        </p>
        <p class="proof" style="margin-top: 0.4rem;">
          <a href="https://kumply.xyz/dashboard">__TOTAL_ATTESTATIONS__ attestations issued on Fuji - browse them live</a>
        </p>
      </div>
      <div class="cell">
        <h3>Published SDK</h3>
        <p><code>@kumply/sdk</code> v1.x on npm - viem-based client, ABIs, network configs for Fuji, mainnet, and the KUMPLY L1.</p>
      </div>
      <div class="cell">
        <h3>Interactive demo</h3>
        <p>Three scenarios (DeFi pool, RWA transfer, agent marketplace) checking real attestations on the selected network - Mainnet or Fuji - no login, no wallet needed.</p>
        <p class="proof" style="margin-top: 0.6rem;"><a href="https://kumply.xyz/demo">kumply.xyz/demo</a></p>
      </div>
    </div>
    <p class="note"><strong>Honest status:</strong> the non-custodial core (AttestationStore + ComplianceGate) is live and verified on
      <strong>Mainnet C-Chain</strong> as a read-only beta with fees at zero - self-funded, July 2026 - alongside the full suite on Fuji Testnet.
      Identity checks currently run on Sumsub's sandbox tier.
      The KUMPLY L1 is registered on Fuji with validator activation in progress - live status at <a href="https://kumply.xyz/l1">kumply.xyz/l1</a>.
      Production identity checks and mainnet fee activation are exactly what this grant funds - see slide 11.</p>
  </section>

  <!-- 05 · How it works -->
  <section class="slide">
    <div class="slide-head">
      <span class="eyebrow">Architecture</span>
      <span class="slide-num">05 / 12</span>
    </div>
    <h2>One write, unlimited reads.</h2>
    <div class="flow">
      <div class="flow-step">
        <span class="step-label">1 · Verify</span>
        <h3>User connects wallet</h3>
        <p>Picks a tier, completes identity verification (Sumsub WebSDK). KUMPLY never stores personal data.</p>
      </div>
      <div class="flow-step">
        <span class="step-label">2 · Attest</span>
        <h3>Webhook signs the result</h3>
        <p>HMAC-verified webhook issues <code>issueAttestation</code> on-chain: wallet, tier, expiry. Idempotent by design.</p>
      </div>
      <div class="flow-step">
        <span class="step-label">3 · Compose</span>
        <h3>Anyone verifies free</h3>
        <p><code>verify(address)</code> from any contract, the SDK, or cross-L1 via ICM. Sub-second, no API keys.</p>
      </div>
      <div class="flow-step">
        <span class="step-label">4 · Enforce</span>
        <h3>Gates and validators</h3>
        <p><code>ComplianceGate</code> guards dApp actions by minimum tier; the L1's validator manager requires Tier 4 to join consensus.</p>
      </div>
    </div>
    <p class="lede" style="margin-top: 1.5rem;">
      Attestations expire and can be revoked. If a validator's KYB attestation lapses, the ACP-99 contract
      removes it from the set automatically - <strong>anyone can trigger the purge</strong>. Compliance isn't a
      policy document; it's enforced by consensus.
    </p>
  </section>

  <!-- 06 · Avalanche-native -->
  <section class="slide">
    <div class="slide-head">
      <span class="eyebrow">Why Avalanche - and only Avalanche</span>
      <span class="slide-num">06 / 12</span>
    </div>
    <h2>Built with the primitives this ecosystem invented.</h2>
    <div class="grid cols-2">
      <div class="cell">
        <h3>ACP-99 ValidatorSetManager, KYB-gated</h3>
        <p>Our <code>KumplyValidatorSetManager</code> implements the full two-phase validator lifecycle with
        Avalanche-codec Warp payloads - and adds a requirement we have not seen on another L1: validators must hold a live
        Tier-4 attestation. 27 dedicated tests.</p>
      </div>
      <div class="cell">
        <h3>ACP-77 sovereign L1</h3>
        <p>KUMPLY Compliance L1, registered on Fuji with validator activation in progress: Subnet-EVM,
        chainId 43210, 2-second blocks, KMP gas token, deployer allow-list gated by KYB.</p>
      </div>
      <div class="cell">
        <h3>ICM: a network-wide primitive</h3>
        <p>Attestations issued on C-Chain propagate to any Avalanche L1 via Interchain Messaging -
        one verification serves the whole ecosystem, not one chain.</p>
      </div>
      <div class="cell">
        <h3>C-Chain composability</h3>
        <p><code>ComplianceGate</code> drops into any EVM dApp as a 3-line dependency: institutional pools,
        accredited markets, qualified lending - without migrating anything.</p>
      </div>
    </div>
  </section>

  <!-- 07 · KYA -->
  <section class="slide">
    <div class="slide-head">
      <span class="eyebrow">Differentiator</span>
      <span class="slide-num">07 / 12</span>
    </div>
    <h2>KYA - Know Your Agent. First of its kind on Avalanche.</h2>
    <p class="lede">
      Agentic DeFi is arriving: autonomous market makers, AI portfolio managers, on-chain agents holding real budgets.
      Every protocol will need to distinguish a <strong>trusted, bounded agent</strong> from an anonymous script -
      and no compliance rail exists for that today.
    </p>
    <div class="grid cols-3">
      <div class="cell">
        <h3>Tier 5 attestations</h3>
        <p>Agents get on-chain credentials tied to a verified owner (Tier 4 KYB) - accountability chains upward.</p>
      </div>
      <div class="cell">
        <h3>First in the ecosystem</h3>
        <p>To our knowledge, the first Avalanche L1 - and the first EVM compliance layer - purpose-built for agent identity.</p>
      </div>
      <div class="cell">
        <h3>Roadmapped depth</h3>
        <p>AgentRegistry.sol extension: model fingerprint, behavior bounds, liveness - planned for Q3 2026.</p>
      </div>
    </div>
  </section>

  <!-- 08 · Business model -->
  <section class="slide">
    <div class="slide-head">
      <span class="eyebrow">Business model - already in the contracts</span>
      <span class="slide-num">08 / 12</span>
    </div>
    <h2>Two revenue rails, both implemented on-chain.</h2>
    <div class="grid cols-2">
      <div class="cell">
        <h3>Pay-per-check · $0.50</h3>
        <p><code>checkCompliance(address)</code> is a payable read for dApps that want verified counterparties without
        a subscription. The fee logic, treasury accounting, and withdrawal are live in AttestationStore today -
        currently set to zero on both mainnet and testnet.</p>
      </div>
      <div class="cell">
        <h3>SaaS subscription</h3>
        <p><code>setSubscription</code> exempts a partner's ComplianceGate from per-call fees - flat monthly billing
        for high-volume integrators, enforced by the contract, not an invoice.</p>
      </div>
    </div>
    <p class="lede" style="margin-top: 1.5rem;">
      <strong>Software-only by design:</strong> non-custodial, no fiat rails, no tradable token sale.
      KMP is the L1 gas token, not an investment product. This posture keeps KUMPLY outside regulated
      financial classifications - a written Mexican legal opinion is scoped for Q3 2026, before fee activation on mainnet.
    </p>
  </section>

  <!-- 09 · Market -->
  <section class="slide">
    <div class="slide-head">
      <span class="eyebrow">Market &amp; demand thesis</span>
      <span class="slide-num">09 / 12</span>
    </div>
    <h2>The LatAm institutional wedge - and what we can't prove yet.</h2>
    <p class="note"><strong>Stated plainly: KUMPLY is pre-revenue, with no users and no signed counterparties.</strong>
      The case below is structural - the regulatory and ecosystem conditions that make this layer necessary - not
      evidence of committed demand. Converting it into named design partners - Avalanche builders and startups,
      KUMPLY's actual near-term buyer, not necessarily a regulated institution - is milestone M0: scoped, dated,
      and costed at zero on slide 11. The same 2 confirmed pilot integrators M0 is scoped to produce are the
      candidates for M4's pilot integrations - one proof-of-concept pipeline, not two separate asks.
      We would rather show you the gap than have you find it.</p>
    <div class="grid cols-3">
      <div class="cell">
        <h3>Regulatory pressure</h3>
        <p>Under LFPDPPP, every party storing identity documents carries the liability for them. Attestations put the
        <em>proof</em> on-chain and leave the <em>documents</em> with one regulated processor - the exposure stops duplicating.</p>
      </div>
      <div class="cell">
        <h3>The institutional standard, at scale</h3>
        <p>ERC-3643 has tokenised <strong>$32B+ of real-world assets across 180+ jurisdictions</strong>. The SEC names
        it in official speeches, DTCC integrated it into ComposerX, MAS builds on it in Project Guardian, and an ISO
        process is advancing. Its architecture is the one we converged on independently: an on-chain identity registry,
        verified claims, trusted issuers, and a compliance check before every transfer.</p>
      </div>
      <div class="cell">
        <h3>Avalanche is already where institutions go</h3>
        <p>Evergreen subnets embed KYC/KYB at the chain level through validator permissioning and allow-lists, and
        Franklin Templeton and Hamilton Lane have explored Avalanche deployments for tokenised funds. The stated appeal
        is a chain <em>where every validator is known and KYC'd</em>. That is precisely what our L1 enforces in
        contract code rather than by policy.</p>
      </div>
      <div class="cell">
        <h3>Ecosystem signal</h3>
        <p>Avalanche's LatAm Institutional Hackathon (May 2026) was built around challenges defined by Arkangeles and
        Bankaool. The ecosystem is actively sourcing institutional deployment paths for this region - that demand
        signal is Avalanche's, not ours to claim.</p>
      </div>
      <div class="cell">
        <h3>What the leading answer can't do</h3>
        <p>Base shipped onchain identity in July 2026 - 300,000+ verifications on its predecessor - proving uniqueness
        from a social or exchange account. No regulated counterparty can accept that as KYC: no document, no legal
        entity behind it, no expiry, no revocation. The gap it leaves is exactly ours, and it is the harder half.</p>
      </div>
      <div class="cell">
        <h3>Cost of the status quo</h3>
        <p>Per-dApp KYC re-charges the same verification for the same user at every protocol they touch. The unit cost
        is knowable and it repeats. That repetition is the market.</p>
      </div>
    </div>
    <p class="lede" style="margin-top: 1.5rem;">
      <strong>Beachhead:</strong> Mexican digital banks and fintechs, reached through the Avalanche LatAm community.
      <strong>Expansion:</strong> Colombia, Brazil, Chile, with multi-jurisdiction tier definitions planned for 2027.
      Each institution that trusts a KUMPLY attestation lowers the onboarding cost for the next one.
    </p>
  </section>

  <!-- 10 · Team -->
  <section class="slide">
    <div class="slide-head">
      <span class="eyebrow">Team</span>
      <span class="slide-num">10 / 12</span>
    </div>
    <h2>Two builders who ship every week.</h2>
    <div class="grid cols-2">
      <div class="cell founder-cell">
        <img class="avatar" src="/pitch-giovanny.jpg" alt="Giovanny Amador" width="56" height="56" />
        <div class="founder-info">
          <h3>Giovanny Amador - Technical lead</h3>
          <p>Contracts, L1, SDK, infrastructure. Avalanche Team1 Collaborator.
            <a href="https://github.com/Eras256">github.com/Eras256</a> · <a href="https://x.com/vaiossx">@vaiossx</a></p>
        </div>
      </div>
      <div class="cell founder-cell">
        <img class="avatar" src="/pitch-monserrat.jpg" alt="Monserrat Mendoza" width="56" height="56" />
        <div class="founder-info">
          <h3>Monserrat Mendoza - Product &amp; design lead</h3>
          <p>Product, design, content. ETH Uruguay 2025 winner. Avalanche Team1 Collaborator.
            <a href="https://github.com/M0nsxx">github.com/M0nsxx</a> · <a href="https://x.com/smithserrat">@smithserrat</a></p>
        </div>
      </div>
    </div>
    <p class="lede" style="margin-top: 1.5rem;">
      Active in the Team1 LatAm community - introduced KUMPLY at a Team1 weekly call, and shipped two additional
      Avalanche builds in a single weekend (an invisible-blockchain museum ticketing app and an agricultural
      traceability demo), shared with the community. <strong>Building on Avalanche is what we do, grant or no grant.</strong>
    </p>
    <p class="note" style="margin-top: 1rem;"><strong>Bus factor, addressed:</strong> today both code and
      partnerships run through two people, and M0-M3 are scoped to stay deliverable that way. M4 is the funded
      trigger to bring on a third technical contributor - pilot integrations and validator operations are exactly
      the load that pulls a founder's time toward meetings and away from shipping, so that is where we add hands
      rather than before it is needed.</p>
  </section>

  <!-- 11 · Roadmap & funds -->
  <section class="slide">
    <div class="slide-head">
      <span class="eyebrow">Roadmap &amp; use of funds</span>
      <span class="slide-num">11 / 12</span>
    </div>
    <h2>Every dollar maps to a verifiable milestone.</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Milestone</th><th>Deliverable</th><th>Weeks</th><th>Budget</th></tr></thead>
        <tbody>
          <tr><td>M0</td><td>Demand validation - 5 structured interviews with Avalanche L1 operators, payment platforms, and KYC providers serving LatAm. Deliverable: a published findings document with attributable quotes, plus either 2 confirmed pilot integrators (Avalanche builders/startups, not necessarily regulated institutions) or a documented decision to re-target the ICP. Runs whether or not this grant is funded, and is not a disbursement gate - M1 starts in parallel in week 1</td><td class="num">1–2</td><td class="num">$0</td></tr>
          <tr><td>M1</td><td>Security &amp; quality hardening of AttestationStore + ComplianceGate: static analysis (Slither/Aderyn), fuzz + invariant test suite, expanded edge-case coverage, failure detection and alerting on the attestation-issuance path, and a published threat-model report - findings fixed, all in-repo</td><td class="num">1–3</td><td class="num">$2,000</td></tr>
          <tr><td>M2</td><td>Mexican legal entity incorporated (a hard prerequisite: Sumsub's production tier requires one), then Sumsub production activated and the first real KYC attestations issued on-chain end-to-end. Includes a ring-fenced reserve for Tier-4 KYB provisioning, which M4's validator gating depends on</td><td class="num">2–6</td><td class="num">$3,000</td></tr>
          <tr><td>M3</td><td>On-chain query fee activation on Mainnet C-Chain - the free read layer is already live and verified on mainnet (self-funded, July 2026); this milestone adds a written Mexican fintech legal opinion, trademark registration with IMPI, migrates admin/treasury to cold-key ops, enables fees post-hardening, and ships the SDK mainnet release on npm</td><td class="num">6–9</td><td class="num">$2,000</td></tr>
          <tr><td>M4</td><td>KUMPLY L1 validator activation on Fuji; ICM integration for cross-L1 attestation reads; 2 pilot integrations generating real mainnet activity</td><td class="num">9–12</td><td class="num">$3,000</td></tr>
        </tbody>
      </table>
    </div>
    <p class="note"><strong>M0 is already in motion.</strong> Two candidate integrators - Avalanche-ecosystem builders -
      are in active conversation, with expected close dates within the next two weeks. Neither is signed yet; this is
      real-time status, not a completed deliverable.</p>
    <p class="note"><strong>M1 is not theoretical - here is one we found this week.</strong> While preparing this
      application, a verified identity check failed to produce its on-chain credential. The cause: Fuji's public RPC
      intermittently returned a gas estimate of ~9.3&times;10<sup>15</sup>, far above the block limit, so issuance reverted
      <em>after</em> the user had already passed verification. Fixed by pinning gas on the issuance path. The real defect
      wasn't the bad estimate - it was that the failure was <strong>silent</strong>. That is precisely the class of work
      M1 funds: not just static analysis, but detection and alerting so a dropped attestation surfaces immediately
      instead of looking like a hung spinner.</p>
    <p class="note"><strong>Where the dollars actually go.</strong> M0 costs nothing but sequencing - it is the first thing
      we do, because the weakest part of this application is unproven demand and we would rather resolve that in week two
      than discover it in month six. Everything after it is hard costs, itemised against
      <strong>Sumsub's published rates (checked August 2026)</strong>: Basic is $149/month minimum at $1.35 per
      verification, Compliance $299/month at $1.85. <strong>M2's $3,000 breaks down as ~$900 for six months of Sumsub
      Basic, ~$1,000 to incorporate the Mexican entity, and ~$1,100 ring-fenced against the pending Enterprise
      quote for Tier-4 KYB.</strong> That reserve is deliberate rather than padding: KYB is the gate on validator
      registration, so M4 cannot be delivered as written if Tier-4 provisioning is unfunded - and Enterprise pricing
      is the one line we genuinely cannot forecast. If the quote lands lower, the balance goes back or gets
      reallocated with your approval; if it lands higher, we re-scope rather than overrun. At our volume the Basic
      monthly floor already covers ~110 verifications, so no separate per-check line is needed.
      We start on Basic rather than Compliance deliberately: the delta is AML screening, and KUMPLY's
      legal posture is that it is not an AML-obligated entity - we will upgrade the month a customer requires it, not
      before. Six months of runway, not twelve, because this is a twelve-week programme and we would rather return
      unspent scope than pre-buy a subscription for a product still proving demand. Tier-4 <strong>KYB is Enterprise-only
      and quoted per customer; that quote is pending</strong>, and we will re-scope against it rather than pad now.
      M3 covers the written Mexican fintech legal opinion, IMPI trademark registration, and cold-key
      treasury setup before any fee is switched on. <strong>M4</strong> covers a year of dedicated validator node hosting
      alongside the ICM work and two pilot integrations.
      <strong>M1 is $2,000</strong>, up from our first draft, because its scope grew: on top of the open-source tooling
      (Slither, Aderyn, fuzzing) and the published threat model, it now funds failure detection and alerting on the
      issuance path - the gap the incident above exposed.</p>
    <p class="note"><strong>Sized for discretion.</strong> Milestones are independently scoped, so the plan degrades gracefully
      if funded below the full ask: <strong>$5,000</strong> delivers M1–M2 (hardened contracts, incorporated entity, real
      production verifications), <strong>$7,000</strong> adds mainnet fee activation and the legal opinion, and the full
      <strong>$10,000</strong> completes L1 activation and pilot integrations. Note where the money is <em>not</em>
      concentrated: identity-verification vendor costs are roughly <strong>20% of the total ask</strong>, and over half
      of that is the returnable KYB reserve. The rest is
      security work, a legal entity and opinion, and infrastructure that keeps a compliance L1 running. What this
      budget deliberately does
      <strong>not</strong> include: a formal third-party audit of the L1
      validator manager, scoped for Retro9000 / Accelerator funding once mainnet usage proves demand. Nothing this grant
      puts on mainnet custodies user funds. <strong>Already shipped self-funded before this application</strong> - and not
      billed to it: the mainnet C-Chain launch of the non-custodial core (verified on Snowtrace), the 164-test suite with CI,
      the published SDK on npm, and the live dashboard/demo at kumply.xyz.</p>
  </section>

  <!-- 12 · Ask -->
  <section class="slide">
    <div class="slide-head">
      <span class="eyebrow">The ask</span>
      <span class="slide-num">12 / 12</span>
    </div>
    <h2>Fund the bridge from beta to production.</h2>
    <p class="lede">
      KUMPLY is already built, tested, and live on Mainnet C-Chain as a free read-only beta - we shipped
      that ourselves. What stands between this beta and real production verifications are exactly two things
      a bootstrapped two-person team cannot self-fund: <strong>production identity-verification costs</strong>
      and a <strong>disciplined security-hardening pass</strong> before fees go live on the mainnet core.
      That is what this grant buys - everything else, we ship ourselves.
    </p>
    <div class="grid cols-2">
      <div class="cell">
        <h3>Giovanny Amador - Technical lead</h3>
        <p>Discord <code>Vaiosx</code> · Telegram <a href="https://t.me/Vaiosx">@Vaiosx</a> · X <a href="https://x.com/vaiossx">@vaiossx</a></p>
      </div>
      <div class="cell">
        <h3>Monserrat Mendoza - Product &amp; design lead</h3>
        <p>Discord <code>smithserrat</code> · Telegram <a href="https://t.me/M0nsxx">@M0nsxx</a> · X <a href="https://x.com/smithserrat">@smithserrat</a></p>
      </div>
    </div>
    <div class="footer-links">
      <a href="https://kumply.xyz">kumply.xyz</a>
      <a href="https://kumply.xyz/demo">Live demo</a>
      <a href="https://kumply.xyz/verify">Verification flow</a>
      <a href="https://github.com/kumplyprotocol/Kumply">GitHub</a>
      <a href="https://www.npmjs.com/package/@kumply/sdk">@kumply/sdk</a>
      <a href="https://snowtrace.io/address/0xa116261Ed3a848A9E1cd34923D5A0442D1455F71">Snowtrace</a>
    </div>
    <p class="legal">
      The AVALANCHE® and AVAX® trademarks are owned by Ava Labs, Inc. KUMPLY is an independent project -
      not endorsed by, sponsored by, or affiliated with Ava Labs, Inc. or the Avalanche Foundation.
      Core contracts live on Avalanche Mainnet C-Chain (read-only beta, fees at zero) and Fuji Testnet.
      Automated identity checks remain on Sumsub's sandbox tier; not for production verifications yet.
    </p>
  </section>

</div>
`;
