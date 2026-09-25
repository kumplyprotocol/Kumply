---
name: mexico-legal-check
description: >
  Checks whether KUMPLY — a crypto/software product operated from Mexico —
  needs Mexican financial-regulatory registration: IFPE under Ley Fintech/
  LRITF, LFPIORPI's "actividad vulnerable" (art. 17 fr. XVI), facilitación/
  intermediación (art. 24 Bis 4 of the Acuerdo 115/2026 Reglas de Carácter
  General — NOT the LFPIORPI law's own article numbering, see the
  law-vs-reglamento warning below), or intermediación con valores under the
  Ley del Mercado de Valores. Use when a new KUMPLY product, feature, or
  on-chain instruction needs a legal-posture read before scaling, before
  citing it as "software-only" traction, or before a grant/SCF/investor
  submission leans on that claim. Covers where to get the real statute
  text and how to extract it when the PDF resists WebFetch.
allowed-tools: [Read, Write, Edit, WebFetch, WebSearch, Bash]
---

# Mexico legal check — regtech posture for KUMPLY

KUMPLY's standing legal defense is "software-only, non-custodial" — see
`LEGAL_REVIEW_BRIEF.md` and `KumplyMainnet.md` §3.2.1 (the walkthrough of
applying this framework to `AttestationStore.sol`/`ComplianceGate.sol`,
12-Sep-2026, reasoned "no," not counsel-confirmed). This skill is the
repeatable process for testing whether that defense actually holds for a
specific product or feature, not the substantive law itself — the law is
already verified below and in memory (see `[[kumply-lfpiorpi-fraccion-xvi-date-fix]]`
for the fracción XVI enforcement-date correction this skill's test #2
already reflects). Re-derive nothing that's already confirmed there; apply
it to the new case.

## READ THIS FIRST — the law is not the same document as its reglamento

Mexican financial regulation here comes in two independent layers, each
with its own article numbering, and confusing them once already produced
a real same-day false alarm (12-sep-2026):

1. **The law itself** (e.g. LFPIORPI, diputados.gob.mx/LeyesBiblio/pdf/
   LFPIORPI.pdf) — has its own article numbers. LFPIORPI's own text has
   no "24 Bis" article of any kind (only 22 Bis, 33 Bis/Ter/Quáter, 41
   Bis, 51 Bis/Ter, 54 Bis) — true, and irrelevant to test #3 below.
2. **The reglamento/Reglas de Carácter General** SHCP issues to implement
   the law, amended periodically by a numbered Acuerdo (e.g. Acuerdo
   115/2026, DOF, edición vespertina, 7-ago-2026) — has its own, separate
   article numbering layered on top. Art. 24 Bis 4 lives here, not in the
   law.

If you search only the law's own PDF for an article number and don't
find it, that does **not** mean the article is fabricated — it may simply
live in the reglamento instead. Before concluding any citation
"doesn't exist," confirm which of the two document types it was
originally attributed to, and fetch that document specifically.

## The four tests, in order

Run these in this order — each is independent, passing one does not
answer the next:

1. **IFPE (LRITF art. 22)** — does the product open or hold a per-client
   electronic-payment-fund account (a balance you credit/debit)? If it
   only ever moves money in one-off direct transfers with no stored
   balance per client, this is a "no."
2. **LFPIORPI art. 17 fr. XVI ("actividad vulnerable")** — is the product
   habitually and professionally commercializing or exchanging virtual
   assets as its own business (acting as the exchange), as opposed to
   selling an unrelated service that happens to be paid for in crypto?
   This fraction has been **IN FORCE since ~10-Sep-2019** (added by the
   decree published DOF 9-Mar-2018, in force the day after publication,
   with an 18-month vacatio legis on fracción XVI specifically per that
   decree's own "Disposición Transitoria"). It was later reformed/
   expanded (paragraphs 1-2 amended, paragraphs 3-4 added — the custody/
   consideration thresholds) by the DOF 16-Jul-2025 decree, effective the
   very next day (17-Jul-2025), with no delay of its own. **There is no
   real 17-Jan-2027 date for fracción XVI itself.** Any prior analysis
   that treated fracción XVI as "not yet enforceable, gives runway" needs
   re-reading against this.
3. **Art. 24 Bis 4 of the Acuerdo 115/2026 Reglas de Carácter General**
   (facilitación/intermediación, does NOT require custody — this article
   lives in the reglamento, not the LFPIORPI law's own numbering, see
   above) — the load-bearing question. Real refinement, 12-sep-2026
   (confirmed against the article's own verbatim opening clause):
   Art. 24 Bis 4 is **NOT** an independent trigger
   separate from test #2 — it is interpretive/operational content
   anchored to fracción XVI itself. Treat tests #2 and #3 as **one
   combined inquiry**, not two independent gates: ask whether the
   product's infrastructure connects, reconciles, or matches a client's
   own buy/sell/exchange/custody operation with a counterparty, on the
   client's behalf — that functional test does not require custody. The
   key distinction: being paid for your own work product (analytics, a
   computed result, a report) is not the same as executing someone else's
   transaction for them. If the product only ever computes and returns
   information, or only records a fact about a transaction that happened
   elsewhere, it does not "celebrar" or "conectar" that operation.

   Verbatim text (extracted from the real DOF PDF, 12-sep-2026 — cite
   this instead of re-fetching unless the article changes):

   > "Artículo 24 Bis 4.- Para efectos de lo previsto en la fracción XVI
   > del artículo 17 de la Ley, se entenderá que se realiza la
   > facilitación o intermediación de activos virtuales cuando quien
   > realice esta Actividad Vulnerable provea infraestructura, interfaces
   > o plataformas electrónicas que conecten, concilien o emparejen
   > operaciones de compra, venta, intercambio o custodia de activos
   > virtuales por cuenta de sus Clientes o Usuarias, aun cuando no
   > mantenga el control de los activos virtuales o limite su
   > participación operativa a la intermediación de flujos en moneda
   > nacional o divisas.
   >
   > En los casos señalados en el párrafo anterior, quien realice la
   > Actividad Vulnerable deberá considerar para la presentación del
   > Aviso correspondiente, el monto de la operación realizada o la
   > comisión cobrada de conformidad con el artículo 31 Bis del
   > Reglamento.
   >
   > Cuando en la facilitación o intermediación a que se refiere este
   > artículo, incluya la participación de más de un proveedor de
   > servicios de activos virtuales, ya sea nacional o extranjero, cada
   > uno de ellos debe cumplir con las obligaciones establecidas en la
   > Ley, respecto a sus propios Clientes o Usuarias, de conformidad con
   > lo previsto en el artículo 17, fracción XVI de la Ley."

   Two textual details worth remembering when applying this to a new
   product: the trigger is explicit that control of the assets is
   irrelevant ("aun cuando no mantenga el control de los activos
   virtuales") — so "we don't custody" is never a complete argument on
   its own; and Art. 24 Bis 4 itself only says the Aviso computation
   follows "el monto de la operación realizada o la comisión cobrada de
   conformidad con el artículo 31 Bis del Reglamento" — it does **not**
   state the actual UMA thresholds. **Correction, 12-sep-2026:**
   the numeric thresholds (210 UMA per client operation, 4 UMA per
   platform fee/commission, with concurrence rules I/II/III) live in
   **Art. 24 Bis 5**, a separate article — cite 24 Bis 5 for the
   thresholds themselves, 24 Bis 4 only for the facilitación/
   intermediación definition. Either way, a flat per-lookup/per-service
   fee unrelated to any transaction's value sits outside the fact pattern
   both articles describe; a commission that scales with a client's
   trade size does not.
4. **LMV art. 2, "Intermediación con valores"** — only relevant if the
   product touches securities/tokenized equities specifically. Ask: does
   it (a) match buyers to sellers, (b) execute a securities transaction
   on a third party's behalf (as commissioner/mandatary/any capacity), or
   (c) trade its own account? A product that only reports facts about
   securities exposure, with zero valuation/profitability/buy-sell
   commentary, fails all three prongs.

## Other regimes to rule out — don't stop at the four core tests

- **ITF de fondeo colectivo / crowdfunding** (LRITF arts. 15-21) — does
  the product pool capital from multiple funders into a project/company/
  loan, or match investors to a specific funding target?
- **Banxico Circular 4/2019** (activos virtuales) — restricts what
  Banxico-regulated entities can do with virtual assets; doesn't by
  itself regulate an unregulated software product.
- **Beneficiario Controlador disclosure** (CFF arts. 32-B Ter/Quater/
  Quinquies) — applies to essentially every Mexican legal entity, gated
  by having a company, not by activity type.
- **Territorial/jurisdiction nexus** — genuinely open, not resolved in
  this workspace's memory yet.

## Software-only design checklist — build it so each test comes back "no"

- Stay outside IFPE (test #1): never accrue a per-client balance; every
  operation settles atomically to the client's own account/address.
- Stay outside LFPIORPI actividad vulnerable (test #2): don't be the
  counterparty buying/selling/exchanging virtual assets as your own
  business — being paid IN crypto for an unrelated service is fine.
- Stay outside Art. 24 Bis 4 (test #3, the easiest to trip by accident):
  the infrastructure must never be the thing that connects, reconciles,
  or matches two other parties' operation. A pure-fiat product is not
  automatically exempt just because fracción XVI excludes fiat-denominated
  value — the right question is transaction topology: does anything your
  infrastructure connects, anywhere in the chain, convert to/from a
  virtual asset on a client's behalf?
- Stay outside LMV intermediación con valores (test #4): never match
  buyers/sellers of securities, never execute on a third party's behalf.
- Watch the language, not just the code: "wallet," "exchange," "custody,"
  "broker," "intermediary," "matching engine" read as regulated activity
  even over clean architecture.

## Getting the real statute text

- Federal statutes: `diputados.gob.mx/LeyesBiblio/pdf/<ACRONYM>.pdf`.
- DOF publications: `dof.gob.mx/nota_to_pdf.php?fecha=<DATE>&edicion=<ED>`
  → JS-redirects to `abrirPDF.php?archivo=...`, which automated fetch
  often misses.
- **pdftotext first**: WebFetch's own extraction fails on these long
  PDFs. `pdftotext <file>.pdf <file>.txt && grep -n -i "<term>" <file>.txt`.
  Ships with Git for Windows at `Program Files\Git\mingw64\bin\pdftotext.exe`.
- `nota_detalle.php` HTML alternative: wraps almost every word in its own
  `<span>` — strip tags/unescape before grepping.

## When you're done

Write the product's read to its own memory file, mark primary-source
confirmed vs. reasoned inference explicitly, and flag this as regulatory
research for planning, not formal legal advice.
