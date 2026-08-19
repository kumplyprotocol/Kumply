// KUMPLY Blog — post registry. Each post carries EN and ES content side by
// side (not machine-translated at request time) so both locales get the
// same editorial quality. Add new posts to BLOG_POSTS; the index and
// [slug] routes read from here.

export interface BlogPost {
  slug: string;
  date: string; // ISO 8601
  author: { name: string; role: { en: string; es: string } };
  readMinutes: number;
  title: { en: string; es: string };
  excerpt: { en: string; es: string };
  bodyHtml: { en: string; es: string };
}

export const BLOG_POSTS: BlogPost[] = [
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
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
