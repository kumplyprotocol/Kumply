import { Link } from "@/i18n/routing";
import { getLocale } from "next-intl/server";

type Idea = {
  category: string;
  title: string;
  desc: string;
  helper: string;
  ecosystemLink?: boolean;
};

const content = {
  en: {
    title: "Build",
    subtitle: "Software ideas builders can put on top of KUMPLY.",
    note: "The app never holds user funds or keys, and never receives personal data. It only reads whether an address is verified.",
    ideas: [
      {
        category: "KYC",
        title: "Anti-Sybil filter for airdrops and rewards",
        desc: "Limit a reward to one claim per verified person, so a single person can't split it across many wallets.",
        helper: "isPersonAtLeast(address, TIER.BASIC)",
      },
      {
        category: "KYC",
        title: "One-person-one-vote DAO voting",
        desc: "Gate voting power on a minimum verified level, so one verified person can't split their voice into many addresses.",
        helper: "isPersonAtLeast(address, TIER.BASIC)",
      },
      {
        category: "ANY CATEGORY",
        title: "Gas sponsorship limited to verified wallets",
        desc: "The same idea as the 0xGasless pilot: a paymaster only sponsors gas for addresses that hold a valid attestation, at whatever category or tier the integration needs.",
        helper: "verify() / isPersonAtLeast / isBusiness / isAgent",
        ecosystemLink: true,
      },
      {
        category: "KYA",
        title: "Marketplace where only verified AI agents can list or bid",
        desc: "Gate listing and bidding on isAgent(), with payments settled directly wallet to wallet.",
        helper: "isAgent(address)",
      },
      {
        category: "KYA",
        title: "x402 payment APIs that only serve verified agents",
        desc: "Check isAgent() before completing an HTTP 402 payment, so only a verified agent's wallet can pay for the response.",
        helper: "isAgent(address)",
      },
      {
        category: "KYB",
        title: "B2B invoicing or payroll restricted to verified businesses",
        desc: "Check isBusiness() on both sides of a transfer, so the counterparty is a verified company, not an anonymous wallet.",
        helper: "isBusiness(address)",
      },
      {
        category: "KYB",
        title: "Avalanche L1 validators restricted to verified businesses (ACP-99)",
        desc: "Gate validator registration on isBusiness(), the same pattern KUMPLY's own Compliance L1 uses for its ACP-99 ValidatorSetManager.",
        helper: "isBusiness(address)",
      },
    ] as Idea[],
    ecosystemLinkText: "See how this works in practice on",
    statusTitle: "Where this stands",
    statusBody: "Everything above runs on Avalanche Fuji testnet. Attestations used for testing are demo attestations issued directly by KUMPLY's team, not a real KYC, KYB, or KYA check. Mainnet C-Chain stays at zero attestations issued until Sumsub production is active.",
    legalNote: "This is not legal advice. Each builder reviews the rules of their own jurisdiction.",
    linksIntro: "Read the full integration guide",
    linksDevelopers: "SDK docs",
    linksDocs: "Technical docs",
  },
  es: {
    title: "Build",
    subtitle: "Ideas de software que un builder puede construir sobre KUMPLY.",
    note: "La app nunca guarda fondos ni llaves de los usuarios y nunca recibe datos personales, solo lee si una dirección está verificada.",
    ideas: [
      {
        category: "KYC",
        title: "Filtro anti-Sybil para airdrops y recompensas",
        desc: "Limita una recompensa a un reclamo por persona verificada, para que una sola persona no pueda repartirla entre muchas wallets.",
        helper: "isPersonAtLeast(address, TIER.BASIC)",
      },
      {
        category: "KYC",
        title: "Votación de una persona, un voto en una DAO",
        desc: "Controla el poder de voto con un nivel mínimo verificado, para que una sola persona verificada no pueda dividir su voz en muchas direcciones.",
        helper: "isPersonAtLeast(address, TIER.BASIC)",
      },
      {
        category: "CUALQUIER CATEGORÍA",
        title: "Patrocinio de gas limitado a wallets verificadas",
        desc: "La misma idea del piloto con 0xGasless: un paymaster solo patrocina gas para direcciones con una attestation válida, en la categoría o tier que la integración necesite.",
        helper: "verify() / isPersonAtLeast / isBusiness / isAgent",
        ecosystemLink: true,
      },
      {
        category: "KYA",
        title: "Marketplace donde solo agentes de IA verificados pueden publicar u ofertar",
        desc: "Controla publicar y ofertar con isAgent(), con pagos liquidados directamente de wallet a wallet.",
        helper: "isAgent(address)",
      },
      {
        category: "KYA",
        title: "APIs de pago x402 que solo atienden a agentes verificados",
        desc: "Revisa isAgent() antes de completar un pago HTTP 402, para que solo la wallet de un agente verificado pueda pagar por la respuesta.",
        helper: "isAgent(address)",
      },
      {
        category: "KYB",
        title: "Facturación o nómina B2B restringida a empresas verificadas",
        desc: "Revisa isBusiness() en ambos lados de una transferencia, para que la contraparte sea una empresa verificada, no una wallet anónima.",
        helper: "isBusiness(address)",
      },
      {
        category: "KYB",
        title: "Validadores de una L1 de Avalanche restringidos a empresas verificadas (ACP-99)",
        desc: "Controla el registro de validadores con isBusiness(), el mismo patrón que usa la propia L1 de Compliance de KUMPLY en su ValidatorSetManager de ACP-99.",
        helper: "isBusiness(address)",
      },
    ] as Idea[],
    ecosystemLinkText: "Revisa cómo funciona esto en la práctica en",
    statusTitle: "Dónde está esto hoy",
    statusBody: "Todo lo anterior corre en la testnet Fuji de Avalanche. Las attestations usadas para pruebas son attestations de demo emitidas directamente por el equipo de KUMPLY, no una revisión real de KYC, KYB o KYA. Mainnet C-Chain se mantiene en cero attestations emitidas hasta que Sumsub producción esté activo.",
    legalNote: "Esto no es asesoría legal. Cada builder revisa las reglas de su jurisdicción.",
    linksIntro: "Lee la guía completa de integración",
    linksDevelopers: "Documentación del SDK",
    linksDocs: "Documentación técnica",
  },
};

export default async function BuildPage() {
  const locale = await getLocale();
  const lang = locale === "es" ? "es" : "en";
  const t = content[lang];

  return (
    <div className="container build-container">
      <div className="build-header">
        <h1 className="section-title">{t.title}</h1>
        <p className="section-subtitle build-subtitle">{t.subtitle}</p>
      </div>

      <div className="glass-card build-note">
        <p>{t.note}</p>
      </div>

      <div className="build-grid">
        {t.ideas.map((idea, i) => (
          <div className="glass-card build-card" key={i}>
            <span className="badge badge-accent">{idea.category}</span>
            <h3 className="build-card__title">{idea.title}</h3>
            <p className="build-card__desc">{idea.desc}</p>
            <code className="build-card__helper">{idea.helper}</code>
            {idea.ecosystemLink && (
              <p className="build-card__link">
                {t.ecosystemLinkText} <Link href="/ecosystem">Ecosystem</Link>
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card build-status">
        <h3 className="build-card__title">{t.statusTitle}</h3>
        <p className="build-card__desc">{t.statusBody}</p>
      </div>

      <p className="build-legal">{t.legalNote}</p>

      <p className="build-links">
        <Link href="/blog/building-with-kumply-kyc-kyb-kya">{t.linksIntro}</Link>
        {" · "}
        <Link href="/developers">{t.linksDevelopers}</Link>
        {" · "}
        <Link href="/docs">{t.linksDocs}</Link>
      </p>

      <style dangerouslySetInnerHTML={{ __html: `
        .build-container { padding-top: 2rem; padding-bottom: 5rem; }
        .build-header { text-align: center; margin-bottom: 1.5rem; margin-top: 1.5rem; }
        .build-subtitle { margin: 0 auto; max-width: 600px; }
        .build-note { max-width: 760px; margin: 0 auto 3rem; padding: 1.5rem 1.75rem; text-align: center; border-color: var(--border-accent); }
        .build-note p { color: var(--text-secondary); line-height: 1.7; margin: 0; }
        .build-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .build-card { padding: 1.75rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .build-card__title { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0.25rem 0 0; line-height: 1.35; }
        .build-card__desc { color: var(--text-secondary); line-height: 1.6; font-size: 0.92rem; margin: 0; }
        .build-card__helper { font-family: 'Fira Code', Consolas, monospace; font-size: 0.82rem; background: var(--bg-secondary); border: 1px solid var(--border); padding: 0.3em 0.6em; border-radius: 6px; color: var(--text-primary); align-self: flex-start; }
        .build-card__link { font-size: 0.88rem; color: var(--text-tertiary); margin: 0; }
        .build-status { max-width: 760px; margin: 0 auto 2rem; padding: 2rem; }
        .build-legal { text-align: center; color: var(--text-tertiary); font-size: 0.85rem; max-width: 600px; margin: 0 auto 1.5rem; }
        .build-links { text-align: center; font-size: 0.92rem; }

        @media (max-width: 768px) {
          .build-container { padding-top: 1rem; padding-bottom: 3rem; }
          .build-grid { gap: 1.25rem; }
          .build-card { padding: 1.25rem; }
        }
      ` }} />
    </div>
  );
}
