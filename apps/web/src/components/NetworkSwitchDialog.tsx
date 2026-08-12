"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useKumplyNetwork } from "@/providers/KumplyNetworkProvider";

type CellKind = "yes" | "no" | "note";
type Row = { label: string; fuji: [CellKind, string]; mainnet: [CellKind, string] };

/**
 * Confirmation shown before switching to Mainnet C-Chain.
 *
 * The toggle is not cosmetic: it repoints every read on the site at a different
 * set of deployed contracts, and mainnet has no issuance path until Sumsub's
 * production tier is live. Switching silently would leave a visitor staring at
 * a blocked KYC flow with no explanation, so the capability difference is shown
 * before the switch, not after.
 */
export function NetworkSwitchDialog() {
  const { pendingNetwork, confirmNetworkSwitch, cancelNetworkSwitch } = useKumplyNetwork();
  const t = useTranslations("NetworkMode");
  const confirmRef = useRef<HTMLButtonElement>(null);
  const open = pendingNetwork !== null;

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelNetworkSwitch();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, cancelNetworkSwitch]);

  if (!open) return null;

  const rows: Row[] = [
    { label: t("capReads"), fuji: ["yes", ""], mainnet: ["yes", ""] },
    { label: t("capFeed"), fuji: ["yes", ""], mainnet: ["yes", ""] },
    { label: t("capDemo"), fuji: ["yes", ""], mainnet: ["yes", ""] },
    { label: t("capIssuance"), fuji: ["yes", ""], mainnet: ["no", t("notLive")] },
    { label: t("capFee"), fuji: ["note", t("feeZero")], mainnet: ["note", t("feeBeta")] },
    { label: t("capL1"), fuji: ["note", t("registered")], mainnet: ["no", t("fujiOnly")] },
  ];

  const cell = ([kind, text]: [CellKind, string]) => {
    if (kind === "yes") return <span className="nsd__yes" aria-label={t("available")}>✓</span>;
    if (kind === "no") return <span className="nsd__no">{text || "—"}</span>;
    return <span className="nsd__note">{text}</span>;
  };

  return (
    <div className="nsd__backdrop" onClick={cancelNetworkSwitch}>
      <div
        className="nsd"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="nsd-title"
        aria-describedby="nsd-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="nsd__head">
          <span className="nsd__icon" aria-hidden="true">⚠</span>
          <h2 id="nsd-title" className="nsd__title">{t("dialogTitle")}</h2>
        </header>

        <div className="nsd__body">
          <p id="nsd-desc" className="nsd__desc">{t("dialogDesc")}</p>

          <div className="nsd__table-wrap">
            <table className="nsd__table">
              <thead>
                <tr>
                  <th scope="col">{t("colCapability")}</th>
                  <th scope="col">{t("colFuji")}</th>
                  <th scope="col">{t("colMainnet")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    <td>{cell(r.fuji)}</td>
                    <td>{cell(r.mainnet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="nsd__callout">
            <span className="nsd__callout-icon" aria-hidden="true">◎</span>
            <span>{t("sharedFeed")}</span>
          </p>
        </div>

        <footer className="nsd__foot">
          <button type="button" className="nsd__btn" onClick={cancelNetworkSwitch}>
            {t("stayFuji")}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className="nsd__btn nsd__btn--primary"
            onClick={confirmNetworkSwitch}
          >
            {t("goMainnet")}
          </button>
        </footer>
      </div>
    </div>
  );
}
