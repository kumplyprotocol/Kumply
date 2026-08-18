import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0B0B0D",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://kumply.xyz"),
  title: "KUMPLY - Grant Pitch Deck",
  description:
    "Compliance infrastructure for the Avalanche ecosystem: on-chain KYC/KYB/KYA attestations live on Fuji, a KYB-gated L1, and a milestone-scoped roadmap to mainnet.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "KUMPLY - Grant Pitch Deck",
    description:
      "On-chain KYC/KYB/KYA attestations live on Fuji, a KYB-gated Avalanche L1, and a milestone-scoped roadmap to mainnet.",
    type: "website",
    siteName: "KUMPLY",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KUMPLY - Grant Pitch Deck",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KUMPLY - Grant Pitch Deck",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Standalone root layout: /pitch renders the deck as a full document,
// outside the [locale] tree (no Navbar/Footer, no i18n).
//
// data-theme="light" is the server-rendered default (institutional reviewers,
// not a dev-tool audience — light reads more professional than this deck's
// dark-by-default CSS). The inline script below runs synchronously before
// paint and flips to dark only if a returning visitor previously chose it
// (localStorage), so there's no flash for the common first-visit case and
// no flash for a returning dark-mode visitor either.
export default function PitchLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('kumply-pitch-theme')==='dark'){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
