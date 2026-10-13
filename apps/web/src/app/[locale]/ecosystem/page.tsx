import { Link } from "@/i18n/routing";
import { getLocale } from "next-intl/server";

const content = {
  en: {
    title: "Ecosystem",
    subtitle: "Real integrations with KUMPLY's attestation layer.",
    intro: "KUMPLY is infrastructure other teams on Avalanche can read from directly. This page lists real, running integrations: what is actually calling KUMPLY's contracts today.",
    cardBadge: "PILOT INTEGRATION",
    cardName: "0xGasless",
    cardDescription: "0xGasless, which runs ERC-4337 account-abstraction infrastructure (bundler, paymaster, smart accounts) and x402 payment rails on Avalanche.",
    howTitle: "How the integration works",
    howBody: "0xGasless runs a sponsorship service in front of its paymaster. For UserOperations submitted under the pilot's API key on Fuji, the service calls KUMPLY's verify() for the smart account and approves sponsorship only when the account holds a valid attestation. The check covers that traffic; it is not a gate on 0xGasless's sponsorship service more broadly.",
    statusTitle: "Status",
    statusBody: "This is a technical pilot on Avalanche Fuji testnet. The attestations behind it are demo attestations: KUMPLY's own team issued them directly, with no document check or identity verification behind them. Nothing here has touched Mainnet C-Chain.",
    onchainTitle: "See it on-chain",
    onchainIntro: "Full write-up:",
    onchainLinkText: "How a Paymaster Decides Who Gets Free Gas",
    tx1Label: "Sponsored operation, original pilot wallet",
    tx2Label: "Attestation issued to the control wallet",
    tx3Label: "Sponsored operation, control wallet",
  },
  es: {
    title: "Ecosistema",
    subtitle: "Integraciones reales con la capa de attestations de KUMPLY.",
    intro: "KUMPLY es infraestructura que otros equipos en Avalanche pueden leer directamente. Esta página lista integraciones reales y en funcionamiento: lo que de verdad llama a los contratos de KUMPLY hoy.",
    cardBadge: "INTEGRACIÓN PILOTO",
    cardName: "0xGasless",
    cardDescription: "0xGasless, que opera infraestructura de abstracción de cuentas ERC-4337 (bundler, paymaster, smart accounts) y rieles de pago x402 en Avalanche.",
    howTitle: "Cómo funciona la integración",
    howBody: "0xGasless corre un servicio de patrocinio frente a su paymaster. Para las UserOperations enviadas bajo la API key del piloto en Fuji, el servicio llama al verify() de KUMPLY para la smart account y aprueba el patrocinio solo cuando la cuenta tiene una attestation válida. La revisión cubre ese tráfico; no controla de forma más amplia el servicio de patrocinio de 0xGasless.",
    statusTitle: "Estado",
    statusBody: "Esto es un piloto técnico en la testnet Fuji de Avalanche. Las attestations detrás son attestations de demo: el propio equipo de KUMPLY las emitió directamente, sin revisión de documentos ni verificación de identidad detrás. Nada de esto ha tocado Mainnet C-Chain.",
    onchainTitle: "Revísalo on-chain",
    onchainIntro: "Nota completa:",
    onchainLinkText: "Cómo un Paymaster Decide a Quién Patrocinarle el Gas",
    tx1Label: "Operación patrocinada, wallet original del piloto",
    tx2Label: "Attestation emitida a la wallet de control",
    tx3Label: "Operación patrocinada, wallet de control",
  },
};

export default async function EcosystemPage() {
  const locale = await getLocale();
  const lang = locale === "es" ? "es" : "en";
  const t = content[lang];

  return (
    <div className="container ecosystem-container">
      <div className="ecosystem-header">
        <h1 className="section-title">{t.title}</h1>
        <p className="section-subtitle ecosystem-subtitle">{t.subtitle}</p>
      </div>

      <p className="ecosystem-intro">{t.intro}</p>

      <div className="glass-card ecosystem-card">
        <span className="badge badge-accent">{t.cardBadge}</span>
        <h2 className="ecosystem-card__name">{t.cardName}</h2>
        <p className="ecosystem-card__desc">{t.cardDescription}</p>

        <h3 className="ecosystem-card__heading">{t.howTitle}</h3>
        <p className="ecosystem-card__body">{t.howBody}</p>

        <h3 className="ecosystem-card__heading">{t.statusTitle}</h3>
        <p className="ecosystem-card__body">{t.statusBody}</p>

        <h3 className="ecosystem-card__heading">{t.onchainTitle}</h3>
        <p className="ecosystem-card__body">
          {t.onchainIntro}{" "}
          <Link href="/blog/0xgasless-paymaster-pilot-kya">{t.onchainLinkText}</Link>
        </p>
        <ul className="ecosystem-card__tx-list">
          <li>
            <a href="https://testnet.snowtrace.io/tx/0xc3b40ae2908f3075c10c1cd40755975be48cac817844977cd4db104c69b32b70" target="_blank" rel="noopener noreferrer">
              {t.tx1Label}: <code>0xc3b40a...2b70</code> ↗
            </a>
          </li>
          <li>
            <a href="https://testnet.snowtrace.io/tx/0x084e7d548c08fd3a7440cb2a891a7448b2088c8250e8fb5e7e3e3211a462d8aa" target="_blank" rel="noopener noreferrer">
              {t.tx2Label}: <code>0x084e7d...d8aa</code> ↗
            </a>
          </li>
          <li>
            <a href="https://testnet.snowtrace.io/tx/0x4a4490f570fdab1d94f539cc839e85222be608525fd61cfd2a43f08c35a1d9b1" target="_blank" rel="noopener noreferrer">
              {t.tx3Label}: <code>0x4a4490...d9b1</code> ↗
            </a>
          </li>
        </ul>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .ecosystem-container { padding-top: 2rem; padding-bottom: 5rem; }
        .ecosystem-header { text-align: center; margin-bottom: 1.5rem; margin-top: 1.5rem; }
        .ecosystem-subtitle { margin: 0 auto; max-width: 600px; }
        .ecosystem-intro { text-align: center; color: var(--text-secondary); max-width: 680px; margin: 0 auto 3rem; line-height: 1.7; }
        .ecosystem-card { max-width: 760px; margin: 0 auto; padding: 2.5rem; }
        .ecosystem-card__name { font-size: 1.6rem; font-weight: 800; margin: 1rem 0 1rem; color: var(--text-primary); }
        .ecosystem-card__desc { color: var(--text-secondary); line-height: 1.7; margin-bottom: 2rem; font-size: 1.05rem; }
        .ecosystem-card__heading { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 1.75rem 0 0.6rem; }
        .ecosystem-card__body { color: var(--text-secondary); line-height: 1.7; }
        .ecosystem-card__tx-list { list-style: none; padding: 0; margin: 0.75rem 0 0; display: flex; flex-direction: column; gap: 0.6rem; }
        .ecosystem-card__tx-list a { color: var(--text-secondary); text-decoration: none; font-size: 0.92rem; }
        .ecosystem-card__tx-list a:hover { color: var(--accent); }
        .ecosystem-card__tx-list code { font-family: 'Fira Code', Consolas, monospace; font-size: 0.85em; background: var(--bg-secondary); border: 1px solid var(--border); padding: 0.1em 0.4em; border-radius: 6px; color: var(--text-primary); }

        @media (max-width: 768px) {
          .ecosystem-container { padding-top: 1rem; padding-bottom: 3rem; }
          .ecosystem-card { padding: 1.5rem; }
        }
      ` }} />
    </div>
  );
}
