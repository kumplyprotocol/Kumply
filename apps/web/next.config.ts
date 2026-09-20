import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      accounts: false,
    };
    return config;
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js inline scripts + next-intl + Luma's checkout-button widget
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://embed.lu.ma",
              // Sumsub iframe + self + Luma's checkout modal (embeds luma.com, not embed.lu.ma)
              "frame-src 'self' https://*.sumsub.com https://luma.com",
              // Sumsub SDK + Google Fonts + Avalanche RPC
              "connect-src 'self' https://api.sumsub.com https://api.avax-test.network https://api.avax.network wss://api.avax-test.network wss://api.avax.network https://raw.githack.com",
              // Google Fonts + Luma's own checkout-button.css it self-injects
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://embed.lu.ma",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
