// KUMPLY Blog — post registry. Each post carries EN and ES content side by
// side (not machine-translated at request time) so both locales get the
// same editorial quality. Add new posts to BLOG_POSTS; the index and
// [slug] routes read from here.

export interface BlogPost {
  slug: string;
  date: string; // ISO 8601
  author: { name: string; role: { en: string; es: string } };
  readMinutes: number;
  category?: string; // fixed label, same in both locales (e.g. "AVALANCHE NEWS")
  title: { en: string; es: string };
  excerpt: { en: string; es: string };
  bodyHtml: { en: string; es: string };
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "nec-avalanche-biometrics-different-bet",
    date: "2026-09-10",
    author: {
      name: "Monserrat Mendoza",
      role: { en: "Co-founder, Product & Design", es: "Co-founder, Producto y Diseño" },
    },
    readMinutes: 5,
    category: "DEEP DIVE",
    title: {
      en: "Everyone Is Racing to Put Biometrics On-Chain. We Made a Different Bet.",
      es: "Todo el mundo corre a meter biometría on-chain. Nosotros apostamos distinto.",
    },
    excerpt: {
      en: "NEC just signed an MOU with Ava Labs to bring face-verified payments to an Avalanche chain. Here's what that architecture actually does, why we're not building the same thing, and why saying we don't use biometrics would be a lie.",
      es: "NEC acaba de firmar un MOU con Ava Labs para llevar pagos verificados por rostro a una cadena de Avalanche. Así funciona esa arquitectura, por qué no estamos construyendo lo mismo, y por qué decir que no usamos biometría sería mentira.",
    },
    bodyHtml: {
      en: `
<p>On July 10, 2026, Ava Labs announced an MOU with NEC, the company that has ranked #1 in NIST's global face-recognition benchmark since 2009, to jointly explore "FaceVC": biometric identity verification built directly into an Avalanche chain. It's the biggest institutional signal an identity project on Avalanche has gotten this year, and it's not us. Worth being honest about what that means, and what it doesn't.</p>

<h2>What NEC and Ava Labs are actually proposing</h2>

<p>The whitepaper behind the MOU describes three purpose-built chains working together over Interchain Messaging: a permissioned Avalanche L1 that stores identity registries and credential-revocation status, a dedicated payment chain called SETTL for stablecoin settlement, and the public C-Chain for rewards and promotional tokens. The first use case is concrete: a traveler gets a FaceVC before landing in Japan, then approves a stablecoin payment with their face at the point of sale.</p>

<p>To their credit, the design keeps a principle we also hold: biometric data never touches the chain. NEC's own language for it is direct: "biometric data never goes on-chain. A user's face and purchase history stay inside their own wallet." Only proof that verification happened, plus the minimum transaction data, gets recorded.</p>

<h2>The honest part: we're not biometrics-free either</h2>

<p>It would be easy to draw a clean line here, NEC does biometrics, KUMPLY does documents, and it wouldn't be true. Sumsub, the KYC vendor behind our own Tier 1-3 attestations, already runs real facial biometrics as part of a normal verification: 3D face mapping and liveness detection to catch a photo of a photo, and face matching between a selfie and an ID document at around 99% confidence. If we said we don't use biometrics, that would be false, and we'd rather lose an argument than tell you something untrue about our own stack.</p>

<h2>So where's the real difference</h2>

<p>Not in whether biometrics are involved. It's in what kind of company is behind them, and how narrow the thing being built actually is. NEC is a biometrics company first, holding the top spot in NIST's 1:N identification benchmark with a 0.07% error rate against a 12-million-person database, and it built its own recognition technology directly into a three-chain payment architecture, for one specific flow: face-verified stablecoin payments for travelers. It's vertical, specialized, and purpose-built for that use case.</p>

<p>KUMPLY is the opposite bet. We're a general-purpose compliance layer: Tier 1-3 for individual KYC, Tier 4 for business KYB, Tier 5 for the accountable owner behind an AI agent. We don't build our own verification technology, and that's deliberate. Sumsub is a vendor we chose, not a company we are, and we could swap it for another provider without touching <code>AttestationStore</code> or <code>ComplianceGate</code>. Any dApp on Avalanche can call <code>verify(address)</code> against our system for any of those three tiers. NEC built one door for one room. We built the hallway.</p>

<h2>The part we'll say plainly</h2>

<p>Ava Labs partnering directly with the world's top-ranked face-recognition company is a bigger institutional signal than anything we've gotten so far, and it deserves to be treated that way, not minimized. What we can say with no hedging is the stage each of us is at: NEC and Ava Labs are still at "jointly explore," a memorandum signed in July 2026 with a whitepaper and no shipped product yet. KUMPLY's contracts are live today, tested, deployed on mainnet and Fuji. We're ahead on execution. They're ahead on institutional weight. Both things are true at once.</p>

<p>If your protocol needed to let in an AI agent, or a KYB'd business, or a verified individual tomorrow, whose infrastructure would you actually be able to call?</p>
`,
      es: `
<p>El 10 de julio de 2026, Ava Labs anunció un MOU con NEC, la empresa número uno en el benchmark global de reconocimiento facial del NIST desde 2009, para explorar juntos "FaceVC": verificación de identidad biométrica construida directo dentro de una cadena de Avalanche. Es la señal institucional más grande que ha recibido un proyecto de identidad en Avalanche este año, y no somos nosotros. Vale la pena ser honestos sobre qué significa eso, y qué no.</p>

<h2>Qué proponen NEC y Ava Labs en realidad</h2>

<p>El whitepaper detrás del MOU describe tres cadenas separadas trabajando juntas vía Interchain Messaging: una L1 permisionada de Avalanche que guarda registros de identidad y estado de revocación de credenciales, una cadena dedicada a pagos llamada SETTL para settlement de stablecoins, y la C-Chain pública para recompensas y tokens promocionales. El primer caso de uso es concreto: un viajero obtiene su FaceVC antes de aterrizar en Japón, y luego aprueba un pago en stablecoin con su rostro en el punto de venta.</p>

<p>Hay que reconocerles esto: el diseño mantiene un principio que nosotros también sostenemos, el dato biométrico nunca toca la cadena. La frase propia de NEC lo dice directo: "el dato biométrico nunca va on-chain. El rostro y el historial de compra del usuario se quedan dentro de su propia wallet." Solo se registra la prueba de que la verificación ocurrió, más el dato mínimo de la transacción.</p>

<h2>La parte honesta: nosotros tampoco estamos libres de biometría</h2>

<p>Sería fácil trazar una línea limpia aquí, NEC usa biometría, KUMPLY usa documentos, y sería falso. Sumsub, el proveedor de KYC detrás de nuestras propias attestations Tier 1-3, ya corre reconocimiento facial real como parte de una verificación normal: face-mapping 3D y detección de liveness para atrapar la foto de una foto, y matching entre una selfie y un documento de identidad con cerca de 99% de confianza. Si dijéramos que no usamos biometría, sería falso, y preferimos perder un argumento antes que decirte algo que no es cierto sobre nuestra propia arquitectura.</p>

<h2>Entonces dónde está la diferencia real</h2>

<p>No está en si hay biometría involucrada o no. Está en qué tipo de empresa hay detrás, y qué tan angosto es lo que de verdad se está construyendo. NEC es primero una empresa de biometría, con el primer lugar en el benchmark de identificación 1:N del NIST con una tasa de error de 0.07% contra una base de 12 millones de imágenes, y construyó su propia tecnología de reconocimiento directo dentro de una arquitectura de pagos de tres cadenas, para un flujo específico: pagos en stablecoin verificados por rostro para viajeros. Es vertical, especializada, y construida a la medida de ese caso de uso.</p>

<p>KUMPLY es la apuesta opuesta. Somos una capa de compliance de propósito general: Tier 1-3 para KYC de individuos, Tier 4 para KYB de empresas, Tier 5 para el dueño responsable detrás de un agente de IA. No construimos nuestra propia tecnología de verificación, y eso es deliberado. Sumsub es un proveedor que elegimos, no una empresa que somos, y podríamos cambiarlo por otro proveedor sin tocar <code>AttestationStore</code> ni <code>ComplianceGate</code>. Cualquier dApp en Avalanche puede llamar a <code>verify(address)</code> contra nuestro sistema para cualquiera de esos tres tiers. NEC construyó una puerta para un cuarto. Nosotros construimos el pasillo.</p>

<h2>La parte que decimos sin rodeos</h2>

<p>Que Ava Labs se asocie directo con la empresa de reconocimiento facial mejor rankeada del mundo es una señal institucional más grande que cualquier cosa que hayamos tenido hasta ahora, y merece tratarse así, no minimizarse. Lo que sí podemos decir sin matices es en qué etapa está cada quien: NEC y Ava Labs siguen en "explorar juntos," un memorando firmado en julio de 2026 con un whitepaper y sin producto enviado todavía. Los contratos de KUMPLY están en vivo hoy, probados, desplegados en mainnet y en Fuji. Nosotros vamos adelante en ejecución. Ellos van adelante en peso institucional. Las dos cosas son ciertas al mismo tiempo.</p>

<p>Si tu protocolo necesitara dejar entrar mañana a un agente de IA, a una empresa con KYB, o a un individuo verificado, ¿a la infraestructura de quién podrías llamar de verdad?</p>
`,
    },
  },
  {
    slug: "acp99-kyb-gated-consensus-validator-bug",
    date: "2026-09-07",
    author: {
      name: "Giovanny Amador",
      role: { en: "Co-founder, Technical Lead", es: "Co-founder, Líder Técnico" },
    },
    readMinutes: 6,
    category: "DEEP DIVE",
    title: {
      en: "KYB-Gated Consensus: How KumplyValidatorSetManager Works, and the Bug That Almost Broke It",
      es: "Consenso Gateado por KYB: Cómo Funciona KumplyValidatorSetManager, y el Bug Que Casi lo Rompe",
    },
    excerpt: {
      en: "Every validator on KUMPLY's Compliance L1 needs a live Tier-4 KYB attestation to join consensus, and loses its seat automatically the moment it expires. Here's how that gate actually works, plus a bug in the ACP-99 conversion logic that would have permanently blocked the L1 from ever activating, caught by comparing our code against Ava Labs' own reference implementation.",
      es: "Todo validador en la L1 de Compliance de KUMPLY necesita una attestation Tier-4 (KYB) vigente para entrar al consenso, y pierde su lugar automáticamente en el momento en que expira. Así funciona ese gate en la práctica, más la historia de un bug en la lógica de conversión de ACP-99 que hubiera bloqueado la activación de la L1 para siempre, encontrado al comparar nuestro código contra la implementación de referencia real de Ava Labs.",
    },
    bodyHtml: {
      en: `
<p>Avalanche's own pitch for institutional adoption keeps coming back to one idea: a chain where every validator is known and KYC'd. Evergreen Subnets embed that at the chain level through permissioning and allow-lists. KUMPLY's Compliance L1 takes the same idea further and enforces it in contract code, not policy: <code>KumplyValidatorSetManager</code> (ACP-99) requires a live Tier-4 (KYB) attestation to hold a seat in the validator set, checked on registration and re-checked continuously after.</p>

<h2>How the gate actually works</h2>

<p>The rule is a single immutable constant, <code>REQUIRED_VALIDATOR_TIER == 4</code>. Registering as a validator means the contract calls into <code>AttestationStore</code> and confirms the candidate address holds a Tier 4 (Business/KYB) credential that hasn't expired. No credential, no seat. The gate isn't just at the door, either: if a validator's KYB attestation expires while it's already active, anyone, not just an admin, can call <code>disableExpiredValidator()</code> and purge it from the set. Self-healing, permissionless, no one has to notice and act.</p>

<p>Two more mechanics keep the set stable while that's happening: churn is capped at <code>MAX_CHURN_PER_PERIOD == 20</code> validator changes per rolling <code>CHURN_PERIOD == 1 day</code>, and no single validator can hold more than <code>MAX_VALIDATOR_WEIGHT_BPS == 2000</code> (20%) of total stake weight. And the contract is <code>Pausable</code> in a specific, deliberate way: pausing blocks new <code>initiate</code> operations (registrations, removals starting) but never blocks <code>complete</code> operations, because those are settlement, and settlement should never get stuck mid-flight just because something else triggered a pause.</p>

<figure class="blog-diagram">
<svg viewBox="0 0 700 190" width="100%" role="img" aria-label="Diagram: a Tier 4 KYB-verified institution registers as a validator through the Tier 4 gate, becomes an active validator, and if its attestation expires, anyone can permissionlessly purge it from the set">
<rect x="8" y="45" width="190" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border)"/>
<text x="26" y="72" font-family="'Fira Code', Consolas, monospace" font-size="11" font-weight="700" letter-spacing="1" fill="var(--accent)">TIER 4 &#183; KYB</text>
<text x="26" y="98" font-size="16" font-weight="800" fill="var(--text-primary)">Institution</text>
<text x="26" y="118" font-size="11" fill="var(--text-tertiary)">verified owner</text>
<rect x="255" y="45" width="190" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border)"/>
<text x="273" y="72" font-family="'Fira Code', Consolas, monospace" font-size="11" font-weight="700" letter-spacing="1" fill="var(--accent)">ACP-99 GATE</text>
<text x="273" y="98" font-size="16" font-weight="800" fill="var(--text-primary)">Active validator</text>
<text x="273" y="118" font-size="11" fill="var(--text-tertiary)">in consensus set</text>
<rect x="502" y="45" width="190" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border)"/>
<text x="520" y="72" font-family="'Fira Code', Consolas, monospace" font-size="11" font-weight="700" letter-spacing="1" fill="var(--accent)">PERMISSIONLESS</text>
<text x="520" y="98" font-size="16" font-weight="800" fill="var(--text-primary)">Removed</text>
<text x="520" y="118" font-size="11" fill="var(--text-tertiary)">anyone can trigger</text>
<text x="326" y="25" text-anchor="middle" font-family="'Fira Code', Consolas, monospace" font-size="10" letter-spacing="0.5" fill="var(--text-secondary)">register (tier == 4 required)</text>
<path d="M200 90 L253 90" stroke="var(--accent)" stroke-width="2" fill="none" marker-end="url(#acp99-arrow1)"/>
<text x="573" y="25" text-anchor="middle" font-family="'Fira Code', Consolas, monospace" font-size="10" letter-spacing="0.5" fill="var(--text-secondary)">attestation expires</text>
<path d="M447 90 L500 90" stroke="var(--accent)" stroke-width="2" fill="none" marker-end="url(#acp99-arrow2)"/>
<defs>
<marker id="acp99-arrow1" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="var(--accent)"/></marker>
<marker id="acp99-arrow2" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="var(--accent)"/></marker>
</defs>
</svg>
</figure>

<h2>Tested, not just written</h2>

<p><code>KumplyValidatorSetManager.test.ts</code> has grown to 50 dedicated tests today, covering the full two-phase registration and removal lifecycle, weight updates, the 20-per-day churn cap, and pausable settlement behavior. Across the whole contracts package, that's 110 tests passing (43 for <code>AttestationStore</code>, 17 for <code>ComplianceGate</code>, 50 here), verified live before writing this.</p>

<h2>The bug we found comparing against the real thing</h2>

<p>ACP-99 validator sets activate through a P-Chain conversion message. Building the hash for that message means packing several fields together in an exact byte layout, and Avalanche's reference implementation, <code>icm-contracts</code>, defines what that layout has to be. Comparing KUMPLY's <code>computeConversionID</code> function against that reference directly (not against its own docs) found a real mismatch: KUMPLY's version packed the validator manager's address as raw 20 bytes with no length prefix. The reference implementation packs a <code>uint32(20)</code> length prefix immediately before that same address. Four bytes, in the wrong place, and the resulting hash would never match a genuine P-Chain conversionID. Not a cosmetic bug: <code>initializeValidatorSet</code> would have reverted against every real conversion message, forever, and the L1 could never have activated.</p>

<figure class="blog-diagram">
<svg viewBox="0 0 700 200" width="100%" role="img" aria-label="Diagram: the buggy pre-image packs the manager address with no length prefix, while the fixed version matching Ava Labs' reference implementation inserts a uint32(20) length prefix immediately before the address">
<text x="8" y="20" font-family="'Fira Code', Consolas, monospace" font-size="11" font-weight="700" fill="var(--accent)">BEFORE (buggy)</text>
<rect x="8" y="35" width="90" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="53" y="59" text-anchor="middle" font-size="10" fill="var(--text-secondary)">codec</text>
<rect x="98" y="35" width="110" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="153" y="59" text-anchor="middle" font-size="10" fill="var(--text-secondary)">subnetID</text>
<rect x="208" y="35" width="130" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="273" y="59" text-anchor="middle" font-size="10" fill="var(--text-secondary)">blockchainID</text>
<rect x="338" y="35" width="160" height="40" stroke-dasharray="4 3" fill="none" stroke="var(--text-tertiary)"/><text x="418" y="59" text-anchor="middle" font-size="9" fill="var(--text-tertiary)">missing prefix</text>
<rect x="498" y="35" width="130" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="563" y="59" text-anchor="middle" font-size="9" fill="var(--text-secondary)">managerAddress</text>
<text x="8" y="115" font-family="'Fira Code', Consolas, monospace" font-size="11" font-weight="700" fill="var(--accent)">AFTER (matches icm-contracts)</text>
<rect x="8" y="130" width="90" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="53" y="154" text-anchor="middle" font-size="10" fill="var(--text-secondary)">codec</text>
<rect x="98" y="130" width="110" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="153" y="154" text-anchor="middle" font-size="10" fill="var(--text-secondary)">subnetID</text>
<rect x="208" y="130" width="130" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="273" y="154" text-anchor="middle" font-size="10" fill="var(--text-secondary)">blockchainID</text>
<rect x="338" y="130" width="70" height="40" fill="var(--accent-glow, rgba(232,65,66,0.15))" stroke="var(--accent)"/><text x="373" y="149" text-anchor="middle" font-size="9" fill="var(--accent)">uint32</text><text x="373" y="161" text-anchor="middle" font-size="9" fill="var(--accent)">(20)</text>
<rect x="408" y="130" width="130" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="473" y="154" text-anchor="middle" font-size="9" fill="var(--text-secondary)">managerAddress</text>
</svg>
</figure>

<h2>Why 27/27 passing tests didn't catch it</h2>

<p>At the time this was found, <code>KumplyValidatorSetManager.test.ts</code> had 27 tests, and all 27 passed, every time. That wasn't reassuring once we understood why: the test suite's mock Warp messenger lets a test inject any payload directly, so a test that builds its mock conversion message using KUMPLY's own (buggy) packing function will always agree with itself. Nothing in the suite ever called the real <code>icm-contracts</code> packing function to build the injected message, so the mismatch against reality was invisible from the inside. The fix went in two places at once: the pre-image in <code>ValidatorMessages.sol</code>, and the test suite's own off-chain re-implementation of that same packing, which had the identical gap.</p>

<p>Fixed, redeployed to Fuji, Snowtrace-verified: <a href="https://testnet.snowtrace.io/address/0x935114966Ac6CB6Ec569c8C6959aDF5Ceb9E6f64" target="_blank" rel="noopener noreferrer"><code>0x935114966Ac6CB6Ec569c8C6959aDF5Ceb9E6f64</code></a>. Full writeup, including a second, lower-severity finding from the same pass: <a href="https://github.com/kumplyprotocol/Kumply/blob/main/docs/audits/avalanche-ecosystem-audit-2026-08-17.md" target="_blank" rel="noopener noreferrer">docs/audits</a>.</p>

<h2>Where this actually stands, September 2026</h2>

<p>Honestly: the L1 is registered on Fuji with its ACP-99 validator manager live and verified, and validator activation is still in progress, not a running consensus set with real institutional validators yet. What's real today is the mechanism and the demand pattern behind it, not a live customer list. Avalanche is already positioning Evergreen Subnets around exactly this idea for institutions moving into tokenized funds, and KUMPLY's validator gate is that same idea enforced as code instead of chain-level policy. Founding validator slots are open to any KYB-verified institution; none are confirmed and named publicly yet, and this post won't pretend otherwise.</p>
`,
      es: `
<p>El propio argumento de Avalanche para adopción institucional vuelve siempre a la misma idea: una cadena donde cada validador es conocido y pasó KYC. Los Evergreen Subnets meten eso a nivel de cadena con permissioning y allow-lists. La Compliance L1 de KUMPLY lleva la misma idea más lejos y la aplica en código de contrato, no en política: <code>KumplyValidatorSetManager</code> (ACP-99) exige una attestation Tier-4 (KYB) vigente para tener un lugar en el validator set, verificada al registrarse y revisada continuamente después.</p>

<h2>Cómo funciona el gate en la práctica</h2>

<p>La regla es una sola constante inmutable, <code>REQUIRED_VALIDATOR_TIER == 4</code>. Registrarse como validador significa que el contrato llama a <code>AttestationStore</code> y confirma que la dirección candidata tiene una credencial Tier 4 (Empresarial/KYB) vigente, sin expirar. Sin credencial, no hay lugar. Y el gate no es solo en la entrada: si la attestation KYB de un validador ya activo expira, cualquiera, no solo un admin, puede llamar a <code>disableExpiredValidator()</code> y purgarlo del set. Self-healing, permissionless, nadie tiene que notarlo y actuar.</p>

<p>Dos mecanismos más mantienen el set estable mientras eso pasa: el churn está limitado a <code>MAX_CHURN_PER_PERIOD == 20</code> cambios de validador por <code>CHURN_PERIOD == 1 día</code> móvil, y ningún validador puede tener más de <code>MAX_VALIDATOR_WEIGHT_BPS == 2000</code> (20%) del peso total de stake. Y el contrato es <code>Pausable</code> de una forma específica y deliberada: pausar bloquea las operaciones <code>initiate</code> nuevas (registros, remociones que arrancan) pero nunca bloquea las operaciones <code>complete</code>, porque esas son settlement, y el settlement no debería quedar colgado a mitad de camino solo porque algo más disparó una pausa.</p>

<figure class="blog-diagram">
<svg viewBox="0 0 700 190" width="100%" role="img" aria-label="Diagrama: una institución verificada con Tier 4 KYB se registra como validador a través del gate Tier 4, se vuelve validador activo, y si su attestation expira, cualquiera puede purgarla del set de forma permissionless">
<rect x="8" y="45" width="190" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border)"/>
<text x="26" y="72" font-family="'Fira Code', Consolas, monospace" font-size="11" font-weight="700" letter-spacing="1" fill="var(--accent)">TIER 4 &#183; KYB</text>
<text x="26" y="98" font-size="16" font-weight="800" fill="var(--text-primary)">Institución</text>
<text x="26" y="118" font-size="11" fill="var(--text-tertiary)">dueño verificado</text>
<rect x="255" y="45" width="190" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border)"/>
<text x="273" y="72" font-family="'Fira Code', Consolas, monospace" font-size="11" font-weight="700" letter-spacing="1" fill="var(--accent)">GATE ACP-99</text>
<text x="273" y="98" font-size="16" font-weight="800" fill="var(--text-primary)">Validador activo</text>
<text x="273" y="118" font-size="11" fill="var(--text-tertiary)">en el set de consenso</text>
<rect x="502" y="45" width="190" height="90" rx="12" fill="var(--bg-card)" stroke="var(--border)"/>
<text x="520" y="72" font-family="'Fira Code', Consolas, monospace" font-size="11" font-weight="700" letter-spacing="1" fill="var(--accent)">PERMISSIONLESS</text>
<text x="520" y="98" font-size="16" font-weight="800" fill="var(--text-primary)">Removido</text>
<text x="520" y="118" font-size="11" fill="var(--text-tertiary)">cualquiera lo dispara</text>
<text x="326" y="25" text-anchor="middle" font-family="'Fira Code', Consolas, monospace" font-size="10" letter-spacing="0.5" fill="var(--text-secondary)">registro (exige tier == 4)</text>
<path d="M200 90 L253 90" stroke="var(--accent)" stroke-width="2" fill="none" marker-end="url(#acp99-arrow1-es)"/>
<text x="573" y="25" text-anchor="middle" font-family="'Fira Code', Consolas, monospace" font-size="10" letter-spacing="0.5" fill="var(--text-secondary)">expira la attestation</text>
<path d="M447 90 L500 90" stroke="var(--accent)" stroke-width="2" fill="none" marker-end="url(#acp99-arrow2-es)"/>
<defs>
<marker id="acp99-arrow1-es" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="var(--accent)"/></marker>
<marker id="acp99-arrow2-es" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="var(--accent)"/></marker>
</defs>
</svg>
</figure>

<h2>Probado, no solo escrito</h2>

<p><code>KumplyValidatorSetManager.test.ts</code> ya creció a 50 tests dedicados hoy, cubriendo el ciclo de vida completo de dos fases de registro y remoción, actualizaciones de peso, el límite de churn de 20 por día, y el comportamiento de settlement bajo pausa. En todo el paquete de contratos, son 110 tests pasando (43 de <code>AttestationStore</code>, 17 de <code>ComplianceGate</code>, 50 acá), verificado en vivo antes de escribir esto.</p>

<h2>El bug que encontramos comparando contra el original</h2>

<p>Los validator sets de ACP-99 se activan a través de un mensaje de conversión de la P-Chain. Armar el hash de ese mensaje significa empaquetar varios campos juntos en un layout de bytes exacto, y la implementación de referencia de Avalanche, <code>icm-contracts</code>, define cuál tiene que ser ese layout. Comparar la función <code>computeConversionID</code> de KUMPLY directamente contra esa referencia (no contra su propia documentación) encontró un desajuste real: la versión de KUMPLY empaquetaba la dirección del validator manager como 20 bytes crudos, sin prefijo de longitud. La implementación de referencia empaqueta un prefijo de longitud <code>uint32(20)</code> justo antes de esa misma dirección. Cuatro bytes, en el lugar equivocado, y el hash resultante nunca iba a coincidir con un conversionID real de la P-Chain. No era un bug cosmético: <code>initializeValidatorSet</code> hubiera revertido contra cualquier mensaje de conversión real, para siempre, y la L1 nunca hubiera podido activarse.</p>

<figure class="blog-diagram">
<svg viewBox="0 0 700 200" width="100%" role="img" aria-label="Diagrama: el pre-image con el bug empaqueta la direccion del manager sin prefijo de longitud, mientras que la version corregida, igual a la implementacion de referencia de Ava Labs, inserta un prefijo uint32(20) justo antes de la direccion">
<text x="8" y="20" font-family="'Fira Code', Consolas, monospace" font-size="11" font-weight="700" fill="var(--accent)">ANTES (con bug)</text>
<rect x="8" y="35" width="90" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="53" y="59" text-anchor="middle" font-size="10" fill="var(--text-secondary)">codec</text>
<rect x="98" y="35" width="110" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="153" y="59" text-anchor="middle" font-size="10" fill="var(--text-secondary)">subnetID</text>
<rect x="208" y="35" width="130" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="273" y="59" text-anchor="middle" font-size="10" fill="var(--text-secondary)">blockchainID</text>
<rect x="338" y="35" width="160" height="40" stroke-dasharray="4 3" fill="none" stroke="var(--text-tertiary)"/><text x="418" y="59" text-anchor="middle" font-size="9" fill="var(--text-tertiary)">falta el prefijo</text>
<rect x="498" y="35" width="130" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="563" y="59" text-anchor="middle" font-size="9" fill="var(--text-secondary)">managerAddress</text>
<text x="8" y="115" font-family="'Fira Code', Consolas, monospace" font-size="11" font-weight="700" fill="var(--accent)">DESPUES (igual a icm-contracts)</text>
<rect x="8" y="130" width="90" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="53" y="154" text-anchor="middle" font-size="10" fill="var(--text-secondary)">codec</text>
<rect x="98" y="130" width="110" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="153" y="154" text-anchor="middle" font-size="10" fill="var(--text-secondary)">subnetID</text>
<rect x="208" y="130" width="130" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="273" y="154" text-anchor="middle" font-size="10" fill="var(--text-secondary)">blockchainID</text>
<rect x="338" y="130" width="70" height="40" fill="var(--accent-glow, rgba(232,65,66,0.15))" stroke="var(--accent)"/><text x="373" y="149" text-anchor="middle" font-size="9" fill="var(--accent)">uint32</text><text x="373" y="161" text-anchor="middle" font-size="9" fill="var(--accent)">(20)</text>
<rect x="408" y="130" width="130" height="40" fill="var(--bg-card)" stroke="var(--border)"/><text x="473" y="154" text-anchor="middle" font-size="9" fill="var(--text-secondary)">managerAddress</text>
</svg>
</figure>

<h2>Por qué 27/27 tests pasando no lo agarraron</h2>

<p>Cuando esto se encontró, <code>KumplyValidatorSetManager.test.ts</code> tenía 27 tests, y los 27 pasaban, siempre. Eso no tranquilizaba nada una vez que entendimos por qué: el mock del Warp messenger de la suite de tests deja inyectar cualquier payload directamente, así que un test que arma su mensaje de conversión mock usando la propia función de empaquetado de KUMPLY (con el bug) siempre va a coincidir consigo mismo. Nada en la suite llamaba nunca a la función real de empaquetado de <code>icm-contracts</code> para armar el mensaje inyectado, así que el desajuste contra la realidad era invisible desde adentro. El fix entró en dos lugares a la vez: el pre-image en <code>ValidatorMessages.sol</code>, y la reimplementación off-chain de ese mismo empaquetado en la suite de tests, que tenía el mismo hueco idéntico.</p>

<p>Arreglado, redesplegado en Fuji, verificado en Snowtrace: <a href="https://testnet.snowtrace.io/address/0x935114966Ac6CB6Ec569c8C6959aDF5Ceb9E6f64" target="_blank" rel="noopener noreferrer"><code>0x935114966Ac6CB6Ec569c8C6959aDF5Ceb9E6f64</code></a>. Reporte completo, incluyendo un segundo hallazgo de menor severidad de la misma pasada: <a href="https://github.com/kumplyprotocol/Kumply/blob/main/docs/audits/avalanche-ecosystem-audit-2026-08-17.md" target="_blank" rel="noopener noreferrer">docs/audits</a>.</p>

<h2>Dónde queda esto realmente, septiembre 2026</h2>

<p>Con honestidad: la L1 está registrada en Fuji con su validator manager ACP-99 en vivo y verificado, y la activación de validadores sigue en progreso, no es todavía un set de consenso corriendo con validadores institucionales reales. Lo que es real hoy es el mecanismo y el patrón de demanda detrás de él, no una lista de clientes en vivo. Avalanche ya está posicionando los Evergreen Subnets alrededor de exactamente esta idea para instituciones moviéndose hacia fondos tokenizados, y el gate de validadores de KUMPLY es esa misma idea aplicada como código en vez de política a nivel de cadena. Los slots de validador fundador están abiertos para cualquier institución verificada con KYB; ninguno está confirmado ni nombrado públicamente todavía, y este post no va a fingir lo contrario.</p>
`,
    },
  },
  {
    slug: "kya-know-your-agent-tier-5",
    date: "2026-08-31",
    author: {
      name: "Monserrat Mendoza",
      role: { en: "Co-founder, Product & Design", es: "Co-founder, Producto y Diseño" },
    },
    readMinutes: 4,
    category: "DEEP DIVE",
    title: {
      en: "Know Your Agent: Verifying AI Agents Without Losing Accountability",
      es: "Know Your Agent: Verificar Agentes de IA Sin Perder la Responsabilidad",
    },
    excerpt: {
      en: "An autonomous AI agent moving real capital needs to prove it's not an anonymous script, but most compliance tooling wasn't built for that. Here's how KUMPLY's Tier 5 (KYA) ties an agent's on-chain identity to a KYB-verified, legally accountable owner, and what's shipped today versus what's still roadmap.",
      es: "Un agente de IA autónomo moviendo capital real necesita probar que no es un script anónimo, pero la mayoría del tooling de compliance no fue pensado para eso. Así ata KUMPLY el Tier 5 (KYA) la identidad on-chain de un agente a un dueño verificado con KYB, legalmente responsable, y qué está en producción hoy frente a lo que sigue siendo roadmap.",
    },
    bodyHtml: {
      en: `
<p>Agentic DeFi is arriving: autonomous market makers, AI portfolio managers, on-chain agents holding real budgets. Every protocol that lets an agent touch real capital will need to answer the same question: is this a trusted, bounded agent, or an anonymous script? Today, there's no composable on-chain compliance rail for that distinction.</p>

<h2>What KYA actually verifies</h2>

<p>KYA (Know Your Agent) is KUMPLY's Tier 5 attestation. It doesn't try to identify the agent itself as a legal person - agents aren't legal persons. What it verifies is the chain of accountability behind it: a Tier 5 credential is tied to a Tier 4 (KYB) verified owner, a business or individual that already went through business verification. If the agent acts, the accountability chains upward to that owner. That's the actual mechanism: not "trust the agent," but "know who answers for the agent."</p>

<figure class="blog-diagram">
<svg viewBox="0 0 640 170" width="100%" role="img" aria-label="Diagram: an agent's Tier 5 credential is tied to its owner's Tier 4 KYB-verified credential, so accountability chains upward from the agent to the owner">
<rect x="8" y="35" width="230" height="100" rx="12" fill="var(--bg-card)" stroke="var(--border)"/>
<text x="28" y="65" font-family="'Fira Code', Consolas, monospace" font-size="12" font-weight="700" letter-spacing="1" fill="var(--accent)">TIER 5 &#183; KYA</text>
<text x="28" y="92" font-size="18" font-weight="800" fill="var(--text-primary)">Agent</text>
<text x="28" y="112" font-size="12" fill="var(--text-tertiary)">on-chain credential</text>
<rect x="402" y="35" width="230" height="100" rx="12" fill="var(--bg-card)" stroke="var(--border)"/>
<text x="422" y="65" font-family="'Fira Code', Consolas, monospace" font-size="12" font-weight="700" letter-spacing="1" fill="var(--accent)">TIER 4 &#183; KYB</text>
<text x="422" y="92" font-size="18" font-weight="800" fill="var(--text-primary)">Verified owner</text>
<text x="422" y="112" font-size="12" fill="var(--text-tertiary)">legally accountable</text>
<text x="320" y="20" text-anchor="middle" font-family="'Fira Code', Consolas, monospace" font-size="11" letter-spacing="0.5" fill="var(--text-secondary)">accountability chains upward</text>
<path d="M240 85 L392 85" stroke="var(--accent)" stroke-width="2" fill="none" marker-end="url(#kya-arrowhead-en)"/>
<defs>
<marker id="kya-arrowhead-en" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
<path d="M0,0 L8,3 L0,6 Z" fill="var(--accent)"/>
</marker>
</defs>
</svg>
</figure>

<h2>What's live today</h2>

<p>The core mechanism is live: any contract can check an address's tier and expiry with a single <code>verify(address)</code> call, or pay for a stronger read via <code>checkCompliance(address)</code>, a payable function that's fully implemented in AttestationStore on both Fuji and Mainnet C-Chain. That fee is currently set to zero on both networks. It's real, tested code, not a promise - but it's priced at zero while we're in beta, not because the metering doesn't exist yet.</p>

<p>A concrete example of the mechanism, illustrative, not a real transaction: an agent tries to execute a $50,000 trade. Before letting it through, the protocol's contract calls <code>verify(agentAddress)</code>. The response returns the agent's tier, its expiry, and, through the Tier 4 credential it's tied to, who the verified owner behind it is. Tier 5 and unexpired: the trade proceeds, and the protocol already knows who's accountable if it doesn't go as planned. Missing, expired, or below Tier 5: the protocol rejects the trade or falls back to a human signer, before any funds move.</p>

<p>You can see the mechanism in action without a wallet: the <a href="https://kumply.xyz/demo" target="_blank" rel="noopener noreferrer">interactive demo</a> runs three scenarios against real attestations on the network of your choice, including an agent marketplace scenario - the exact context where a Tier 5 check would decide whether an agent can execute.</p>

<h2>What's roadmap, not shipped</h2>

<p>Two things worth being precise about, since it's easy to round "planned" up to "live" when describing your own roadmap. First, deeper agent-specific verification - model fingerprinting, behavior bounds, liveness checks - lives in a planned <code>AgentRegistry.sol</code> extension, scoped for Q3 2026. It doesn't exist in the contracts yet. Second, per-agent payment standards like x402 are part of where this is heading, not something running in production today. Tier 5 attestation and the compliance check are real; automated micropayment rails on top of it are still ahead of us.</p>

<h2>Why "first" needs a qualifier</h2>

<p>KUMPLY isn't the first project building agent identity on Avalanche. Kite AI's Agent Passport, live on its own Avalanche L1, also gives agents a persistent cryptographic identity - by design pseudonymous, with no KYB behind it. What we believe is actually new: tying that on-chain identity to a KYB-verified, legally accountable owner. To our knowledge, KUMPLY is the first Avalanche L1, and the first EVM compliance layer, built specifically for that link - not for agent identity in general.</p>

<p>That distinction matters more than the "first" itself. An agent with a pseudonymous passport can prove it's consistently the same agent. A Tier 5 agent can prove that, and prove who's legally on the hook if it isn't.</p>
`,
      es: `
<p>Las DeFi agénticas están llegando: market makers autónomos, gestores de portafolio con IA, agentes on-chain manejando presupuestos reales. Todo protocolo que deje a un agente tocar capital real va a necesitar responder la misma pregunta: ¿es un agente confiable y acotado, o un script anónimo? Hoy no existe ningún riel de compliance componible on-chain para esa distinción.</p>

<h2>Qué verifica realmente KYA</h2>

<p>KYA (Know Your Agent) es la attestation Tier 5 de KUMPLY. No intenta identificar al agente en sí como persona legal - los agentes no son personas legales. Lo que verifica es la cadena de responsabilidad detrás de él: una credencial Tier 5 está ligada a un dueño verificado con Tier 4 (KYB), una empresa o individuo que ya pasó por verificación empresarial. Si el agente actúa, la responsabilidad encadena hacia arriba, hasta ese dueño. Ese es el mecanismo real: no "confía en el agente", sino "sabe quién responde por el agente".</p>

<figure class="blog-diagram">
<svg viewBox="0 0 640 170" width="100%" role="img" aria-label="Diagrama: la credencial Tier 5 de un agente está ligada a la credencial Tier 4 KYB-verificada de su dueño, así que la responsabilidad encadena hacia arriba, del agente al dueño">
<rect x="8" y="35" width="230" height="100" rx="12" fill="var(--bg-card)" stroke="var(--border)"/>
<text x="28" y="65" font-family="'Fira Code', Consolas, monospace" font-size="12" font-weight="700" letter-spacing="1" fill="var(--accent)">TIER 5 &#183; KYA</text>
<text x="28" y="92" font-size="18" font-weight="800" fill="var(--text-primary)">Agente</text>
<text x="28" y="112" font-size="12" fill="var(--text-tertiary)">credencial on-chain</text>
<rect x="402" y="35" width="230" height="100" rx="12" fill="var(--bg-card)" stroke="var(--border)"/>
<text x="422" y="65" font-family="'Fira Code', Consolas, monospace" font-size="12" font-weight="700" letter-spacing="1" fill="var(--accent)">TIER 4 &#183; KYB</text>
<text x="422" y="92" font-size="18" font-weight="800" fill="var(--text-primary)">Dueño verificado</text>
<text x="422" y="112" font-size="12" fill="var(--text-tertiary)">legalmente responsable</text>
<text x="320" y="20" text-anchor="middle" font-family="'Fira Code', Consolas, monospace" font-size="11" letter-spacing="0.5" fill="var(--text-secondary)">la responsabilidad encadena hacia arriba</text>
<path d="M240 85 L392 85" stroke="var(--accent)" stroke-width="2" fill="none" marker-end="url(#kya-arrowhead-es)"/>
<defs>
<marker id="kya-arrowhead-es" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
<path d="M0,0 L8,3 L0,6 Z" fill="var(--accent)"/>
</marker>
</defs>
</svg>
</figure>

<h2>Qué está en vivo hoy</h2>

<p>El mecanismo central está en vivo: cualquier contrato puede consultar el tier y la expiración de una dirección con una sola llamada <code>verify(address)</code>, o pagar por una lectura más fuerte vía <code>checkCompliance(address)</code>, una función pagable que está completamente implementada en AttestationStore tanto en Fuji como en Mainnet C-Chain. Ese fee está fijado en cero en ambas redes hoy. Es código real, probado, no una promesa - pero está en cero mientras estamos en beta, no porque el medidor todavía no exista.</p>

<p>Un ejemplo concreto del mecanismo, ilustrativo, no una transacción real: un agente intenta ejecutar una operación de $50,000. Antes de dejarlo pasar, el contrato del protocolo llama a <code>verify(agentAddress)</code>. La respuesta trae el tier del agente, su expiración, y, a través de la credencial Tier 4 a la que está ligado, quién es el dueño verificado detrás. Tier 5 y sin expirar: la operación avanza, y el protocolo ya sabe quién responde si algo sale mal. Faltante, expirada, o por debajo de Tier 5: el protocolo rechaza la operación o recurre a un firmante humano, antes de que se mueva cualquier fondo.</p>

<p>Podés ver el mecanismo funcionando sin wallet: el <a href="https://kumply.xyz/demo" target="_blank" rel="noopener noreferrer">demo interactivo</a> corre tres escenarios contra attestations reales en la red que elijas, incluyendo un escenario de marketplace de agentes - justo el contexto donde una verificación Tier 5 decidiría si un agente puede ejecutar.</p>

<h2>Qué es roadmap, no está enviado</h2>

<p>Dos cosas vale la pena precisar, porque es fácil redondear "planeado" hacia "en vivo" cuando describís tu propio roadmap. Primero, la verificación específica de agentes más profunda - huella del modelo, límites de comportamiento, checks de liveness - vive en una extensión planeada, <code>AgentRegistry.sol</code>, programada para Q3 2026. Todavía no existe en los contratos. Segundo, los estándares de pago por agente como x402 son parte de hacia dónde va esto, no algo corriendo en producción hoy. La attestation Tier 5 y el check de compliance son reales; los rieles de micropago automatizado encima de eso todavía están por delante.</p>

<h2>Por qué "primero" necesita un matiz</h2>

<p>KUMPLY no es el primer proyecto construyendo identidad de agentes en Avalanche. El Agent Passport de Kite AI, en vivo en su propia L1 de Avalanche, también le da a los agentes una identidad criptográfica persistente - por diseño pseudónima, sin KYB detrás. Lo que creemos que sí es nuevo: atar esa identidad on-chain a un dueño verificado con KYB, legalmente responsable. Hasta donde sabemos, KUMPLY es la primera L1 de Avalanche, y la primera capa de compliance EVM, construida específicamente para ese vínculo - no para identidad de agentes en general.</p>

<p>Esa distinción importa más que el "primero" en sí. Un agente con un passport pseudónimo puede probar que es consistentemente el mismo agente. Un agente Tier 5 puede probar eso, y probar quién responde legalmente si no lo es.</p>
`,
    },
  },
  {
    slug: "kyc-composability-ai-agents",
    date: "2026-08-18",
    author: {
      name: "Monserrat Mendoza",
      role: { en: "Co-founder, Product & Design", es: "Co-founder, Producto y Diseño" },
    },
    readMinutes: 4,
    title: {
      en: "Traditional KYC Is Killing DeFi Composability. Can AI Agents Make It Worse?",
      es: "El KYC tradicional está matando la componibilidad en DeFi. ¿Y los agentes de IA pueden empeorarlo?",
    },
    excerpt: {
      en: "Every dApp collecting its own passports and selfies isn't innovation — it's fragmented liquidity and a legal-risk problem nobody wants. Here's how KUMPLY verifies once, on-chain, with no PII, and what happens when the next counterparty isn't a person at all.",
      es: "Que cada dApp coleccione sus propios pasaportes y selfies no es innovación — es liquidez fragmentada y un problema de riesgo legal que nadie quiere. Así verifica KUMPLY una sola vez, on-chain, sin PII — y qué pasa cuando la siguiente contraparte ya no es una persona.",
    },
    bodyHtml: {
      en: `
<p>Everyone in the ecosystem is talking about bringing the great wave of institutional capital on-chain. But while the industry spends its time debating how to onboard banks, the real paradigm shift has already arrived: autonomous AI agents operating real capital.</p>

<p>Not too far out, a huge share of on-chain volume will have no direct human involvement at all. It will be agents executing complex strategies at machine speed. But here's a problem nobody wants to look at: most protocols can't tell the difference between an audited autonomous agent and an anonymous, malicious script.</p>

<h2>The institutional adoption industry's small, dirty secret</h2>

<p>Forcing every dApp to collect its own passports and selfies isn't innovation. It's wasted time and a bad user experience. If I have to verify ten times to use ten different protocols, liquidity fragments and walled gardens win. We didn't build crypto to reinvent traditional banks with worse databases — we built an ecosystem meant to be accessible to everyone.</p>

<h2>Verify once. No detours. One identity, the whole Avalanche ecosystem.</h2>

<p>Your identity in DeFi shouldn't require handing your documents to every dApp you touch. It should be a mathematical proof, not an attachment. At KUMPLY, we decided the only way to scale this on Avalanche is through cryptographic proofs, not personal data.</p>

<p>Our <code>AttestationStore</code> doesn't know your name. It only knows that a specific wallet holds a verification level (Tier) and an expiry date. Any contract on the network can check your status in under a second with one <code>verify(address)</code> call. Legal risk disappears, and DeFi's global composability stays intact.</p>

<p>That's why we built KUMPLY. We're the first layer on Avalanche that ties an AI agent's identity to a human or business owner, verified through KYB, in a legally accountable way.</p>

<p>What does this look like in practice? Picture this scenario:</p>

<blockquote class="blog-scenario">
<p>An AI agent spots an arbitrage opportunity in an institutional DeFi pool. In the old model, the agent gets blocked — there's no "passport," no human available to sign the transaction in that instant.</p>
<p>On KUMPLY, the Agent (holding a Tier 5 credential) presents its on-chain credential. The pool's smart contract queries our system and instantly confirms this bot is cryptographically tied to "Company X" (Tier 4), which already went through a legal KYB process.</p>
<p>The agent executes the trade, liquidity flows, and legal accountability stays anchored to the corporate owner. All of it in under a second, with zero friction.</p>
</blockquote>

<h2>Fewer promises, more code</h2>

<p>People are tired of infrastructure projects that are just a PDF and a speculative token. KUMPLY is code, plain and simple. We don't have an investment token.</p>

<p>Our core architecture is already live on Mainnet C-Chain (Beta), and the full suite runs on Fuji Testnet, using primitives like ACP-99 to force validators to pass KYB by consensus.</p>

<p>So — do you think your protocol is ready to survive the arrival of AI agents operating real capital, or will you keep trusting centralized databases?</p>
`,
      es: `
<p>Todos en el ecosistema hablan de traer la gran ola de capital institucional a la blockchain. Pero mientras la industria pierde el tiempo discutiendo cómo incorporar a los bancos, el verdadero cambio de paradigma ya llegó: agentes de IA autónomos operando capital real.</p>

<p>Se proyecta que, en un futuro no muy lejano, una inmensa parte del volumen on-chain no tendrá intervención humana directa. Serán agentes ejecutando estrategias complejas a la velocidad de la luz. Pero aquí hay un problema enorme que nadie quiere mirar: la mayoría de los protocolos no puede distinguir entre un agente autónomo auditado y un script anónimo malicioso.</p>

<h2>El pequeño secreto de la adopción institucional</h2>

<p>Obligar a cada dApp a coleccionar pasaportes y fotografías no es innovación. Es tiempo perdido y una fea experiencia de usuario. Si tengo que verificar 10 veces para usar 10 protocolos distintos, la liquidez se fragmenta y los silos de liquidez ganan. No construimos cripto para volver a inventar los bancos tradicionales con peores bases de datos, construimos un imperio accesible para todos y todas.</p>

<h2>Verifica una vez. Sin rodeos. Acceso a una identidad total al ecosistema de Avalanche.</h2>

<p>Tu identidad en DeFi no debería requerir que entregues tus documentos a cada dApp que utilizas. Debería ser una prueba matemática, no un archivo adjunto. En KUMPLY decidimos que la única forma de escalar esto en Avalanche es mediante pruebas criptográficas, no datos personales.</p>

<p>Nuestro <code>AttestationStore</code> no sabe tu nombre. Solo sabe que una wallet específica tiene un nivel de verificación (Tier) y una fecha de expiración. Cualquier contrato en la red puede consultar tu estado en menos de un segundo con una llamada <code>verify(address)</code>. El riesgo legal desaparece, y la componibilidad global de DeFi se mantiene intacta.</p>

<p>Por eso construimos KUMPLY. Somos la primera capa en Avalanche que ata la identidad de un agente de IA a un dueño humano o empresarial verificado con KYB, de forma legalmente responsable.</p>

<p>¿Cómo se ve esto en la práctica? Imagina este escenario:</p>

<blockquote class="blog-scenario">
<p>Un agente de IA detecta una oportunidad de arbitraje en un pool institucional de DeFi. En el modelo viejo, el agente es bloqueado porque no tiene un "pasaporte" o un humano que firme la transacción en ese momento.</p>
<p>En KUMPLY, el Agente (con nivel de verificación Tier 5) presenta su credencial on-chain. El contrato inteligente del pool consulta nuestro sistema y verifica instantáneamente que este bot está vinculado criptográficamente a la "Empresa X" (Tier 4), la cual ya pasó por un proceso legal de KYB.</p>
<p>El agente ejecuta la operación, la liquidez fluye y la responsabilidad legal queda anclada al dueño corporativo. Todo en menos de un segundo, sin fricción.</p>
</blockquote>

<h2>Menos promesas, más código</h2>

<p>Las personas están hartas de proyectos de infraestructura que son solo un PDF y un token especulativo. KUMPLY es código puro y duro. No tenemos token de inversión.</p>

<p>Nuestra arquitectura base ya está viva en la Mainnet C-Chain (Beta) y la suite completa corre en Fuji Testnet, usando primitivas como ACP-99 para obligar a los validadores a pasar un KYB por consenso.</p>

<p>¿Y tú, crees que tu protocolo está listo para sobrevivir a la llegada de los agentes de IA operando capital, o seguirás confiando en bases de datos centralizadas?</p>
`,
    },
  },
  {
    slug: "avalanche-news-august-2026",
    date: "2026-08-24",
    author: {
      name: "Giovanny Amador",
      role: { en: "Co-founder, Technical Lead", es: "Co-founder, Líder Técnico" },
    },
    readMinutes: 3,
    category: "AVALANCHE NEWS",
    title: {
      en: "Three Signals From Avalanche's August",
      es: "Tres señales del agosto de Avalanche",
    },
    excerpt: {
      en: "New leadership at Ava Labs, a new metric that shows who actually captures Avalanche's value, and 15 million academic records anchored in Kenya — three verified signals from the ecosystem this August, sourced directly from Ava Labs, not aggregators.",
      es: "Nuevo liderazgo en Ava Labs, una métrica nueva que muestra quién captura realmente el valor de Avalanche, y 15 millones de registros académicos anclados en Kenia — tres señales verificadas del ecosistema este agosto, con fuente directa en Ava Labs, no en agregadores.",
    },
    bodyHtml: {
      en: `
<p>Three stories from Avalanche this month point in the same direction: the ecosystem is being asked to prove itself with numbers, not narratives.</p>

<h2>New leadership, an operator's focus</h2>

<p>On August 18, Ava Labs announced a leadership shift: Charley Cooper, previously COO, becomes President, with day-to-day operations now his mandate. John Wu, stepping back from the President role, moves to Senior Advisor, focused on long-term strategy. Lydia Chiu, who had been serving as interim CFO, is now CFO.</p>

<p>Cooper brings a background spanning R3, State Street, Deutsche Bank, and the CFTC — public and private sector experience in exactly the kind of institutional plumbing Avalanche has been courting. His stated focus areas — 24/7 markets, tokenization, AI — aren't new territory for Avalanche, but the framing is: turning existing traction into "sustainable business growth" rather than expansion for its own sake. For builders, the signal worth watching is whether that translates into closer, faster engagement from Ava Labs itself.</p>

<h2>A new way to measure who actually gets paid</h2>

<p>On August 12, the Avalanche Foundation published a new framework: Gross Chain Income (GCI). Where Gross Chain Product (GCP) measures what the on-chain economy produces, GCI asks who actually captures the value — including income that originates off-chain but flows to residents holding tokenized assets and yield-bearing stablecoins. A further layer, GCI-general, adds issuer reserve income currently captured by external parties rather than ecosystem participants.</p>

<p>The June 2026 numbers make the gap concrete: $3.1M of on-chain production (NGCP) for the month, $2.7M more once holder yield is added ($5.8M NGCI), and $6.9M more once reserve income is counted ($12.7M NGCI-general). Since January 2024, the ecosystem has burned roughly $23.5M in fees against a cumulative $954.8M of GCP and $242.8M of issuer reserve income — most of which isn't landing with ecosystem residents yet. It's a metric built to be uncomfortable, and that's the point: it names a growth lever (routing more of that reserve income back to residents) that a vaguer metric would have left invisible.</p>

<h2>Fifteen million records, one country, zero paper</h2>

<p>On August 3, Kenya's National Examinations Council (KNEC) anchored more than 15 million academic records onto Avalanche's C-Chain, in partnership with local technology provider LegitDoc. The dataset reaches back to 1989 — decades of primary, secondary, advanced diploma, and teacher-training results — and nearly 1 million KCSE 2025 certificates are now issued exclusively through the resulting e-certificate platform. Employers and institutions that used to wait weeks for a paper verification can now check a credential in seconds.</p>

<p>It's a reminder of what "real-world usage" looks like when it isn't denominated in TVL: a national institution moving its actual system of record on-chain, at a scale — fifteen million records and counting — that most crypto infrastructure never gets asked to handle.</p>

<p>Sources: <a href="https://www.avax.network/about/blog/leadership-announcement-from-ava-labs" target="_blank" rel="noopener noreferrer">Ava Labs leadership announcement</a>, <a href="https://www.avax.network/about/blog/from-gross-chain-product-to-gross-chain-income-where-the-value-goes" target="_blank" rel="noopener noreferrer">Avalanche Foundation, Gross Chain Income</a>, <a href="https://www.avax.network/about/blog/securing-a-nations-credentials-kenya-anchors-academic-records-on-avalanche" target="_blank" rel="noopener noreferrer">Ava Labs, Kenya academic records</a>.</p>
`,
      es: `
<p>Tres noticias de Avalanche este mes apuntan en la misma dirección: al ecosistema le están pidiendo que se demuestre con números, no con narrativa.</p>

<h2>Nuevo liderazgo, enfoque de operador</h2>

<p>El 18 de agosto, Ava Labs anunció un cambio de liderazgo: Charley Cooper, antes COO, pasa a ser Presidente, con la operación del día a día ahora bajo su mandato. John Wu, que deja el rol de Presidente, pasa a Senior Advisor, enfocado en estrategia de largo plazo. Lydia Chiu, que venía como CFO interina, ahora es CFO.</p>

<p>Cooper trae una trayectoria que pasa por R3, State Street, Deutsche Bank y la CFTC — experiencia tanto en sector público como privado, justo el tipo de infraestructura institucional que Avalanche ha estado cortejando. Sus áreas de foco declaradas — mercados 24/7, tokenización, IA — no son territorio nuevo para Avalanche, pero el enfoque sí lo es: convertir la tracción ya existente en "crecimiento de negocio sostenible" en vez de expansión por sí misma. Para los builders, la señal a seguir es si eso se traduce en un involucramiento más cercano y rápido de Ava Labs.</p>

<h2>Una nueva forma de medir quién realmente cobra</h2>

<p>El 12 de agosto, la Avalanche Foundation publicó un nuevo marco: Gross Chain Income (GCI). Donde Gross Chain Product (GCP) mide lo que produce la economía on-chain, GCI pregunta quién captura realmente ese valor — incluyendo ingresos que se originan fuera de la cadena pero fluyen hacia residentes que tienen activos tokenizados y stablecoins que generan yield. Una capa adicional, GCI-general, suma el ingreso de reservas de emisores que hoy captan terceros externos en vez de participantes del ecosistema.</p>

<p>Los números de junio de 2026 hacen el hueco concreto: $3.1M de producción on-chain (NGCP) en el mes, $2.7M más al sumar el holder yield ($5.8M de NGCI), y $6.9M más al contar el ingreso de reservas ($12.7M de NGCI-general). Desde enero de 2024, el ecosistema ha quemado cerca de $23.5M en fees contra un acumulado de $954.8M de GCP y $242.8M de ingreso de reservas de emisores — la mayoría de lo cual todavía no llega a los residentes del ecosistema. Es una métrica diseñada para ser incómoda, y ese es el punto: nombra una palanca de crecimiento (redirigir más de ese ingreso de reservas hacia los residentes) que una métrica más vaga habría dejado invisible.</p>

<h2>Quince millones de registros, un país, cero papel</h2>

<p>El 3 de agosto, el Consejo Nacional de Exámenes de Kenia (KNEC) ancló más de 15 millones de registros académicos en la C-Chain de Avalanche, en alianza con el proveedor de tecnología local LegitDoc. El conjunto de datos llega hasta 1989 — décadas de resultados de primaria, secundaria, diplomados avanzados y formación docente — y casi 1 millón de certificados KCSE 2025 ya se emiten exclusivamente a través de la plataforma de e-certificados resultante. Empleadores e instituciones que antes esperaban semanas por una verificación en papel ahora pueden confirmar una credencial en segundos.</p>

<p>Es un recordatorio de cómo se ve el "uso real" cuando no se mide en TVL: una institución nacional moviendo su sistema de registro real on-chain, a una escala — quince millones de registros y sumando — que a la mayoría de la infraestructura cripto nunca le piden manejar.</p>

<p>Fuentes: <a href="https://www.avax.network/about/blog/leadership-announcement-from-ava-labs" target="_blank" rel="noopener noreferrer">anuncio de liderazgo de Ava Labs</a>, <a href="https://www.avax.network/about/blog/from-gross-chain-product-to-gross-chain-income-where-the-value-goes" target="_blank" rel="noopener noreferrer">Avalanche Foundation, Gross Chain Income</a>, <a href="https://www.avax.network/about/blog/securing-a-nations-credentials-kenya-anchors-academic-records-on-avalanche" target="_blank" rel="noopener noreferrer">Ava Labs, registros académicos de Kenia</a>.</p>
`,
    },
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
