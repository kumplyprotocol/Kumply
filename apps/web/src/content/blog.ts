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
