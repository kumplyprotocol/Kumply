import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#0B0B0D",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://kumply.xyz"),
  title: "KUMPLY — Grant Pitch Deck",
  description:
    "Compliance infrastructure for the Avalanche ecosystem: on-chain KYC/KYB/KYA attestations live on Fuji, a KYB-gated L1, and a milestone-scoped roadmap to mainnet.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "KUMPLY — Grant Pitch Deck",
    description:
      "On-chain KYC/KYB/KYA attestations live on Fuji, a KYB-gated Avalanche L1, and a milestone-scoped roadmap to mainnet.",
    type: "website",
    siteName: "KUMPLY",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KUMPLY — Grant Pitch Deck",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KUMPLY — Grant Pitch Deck",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Standalone root layout: /pitch renders the deck as a full document,
// outside the [locale] tree (no Navbar/Footer, no i18n).
export default function PitchLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
