import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import localFont from 'next/font/local';
import { StaticSearchDialog } from '@/components/search-dialog';
import './global.css';

const jetbrainsMono = localFont({
  src: './fonts/JetBrainsMono.ttf',
  variable: '--font-mono',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={jetbrainsMono.variable} suppressHydrationWarning>
      <head>
        {/*
         * Baseline CSP for static export on GitHub Pages — production only.
         * - next.config headers() is unavailable with output: 'export', and
         *   GitHub Pages does not send custom response headers, so a <meta>
         *   CSP is the only lever.
         * - Injected only in production: React dev mode requires 'unsafe-eval'
         *   (callstack reconstruction), which would otherwise break the dev
         *   server with "eval() is not supported in this environment".
         * - 'unsafe-inline' for script/style is required by Next/Fumadocs
         *   runtime + Shiki inline styles; the meta CSP still hardens against
         *   data exfiltration (connect-src) and framing (frame-ancestors).
         */}
        {process.env.NODE_ENV === 'production' && (
          <meta
            httpEquiv="Content-Security-Policy"
            content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'"
          />
        )}
      </head>
      <body className="min-h-screen">
        <RootProvider
          theme={{ defaultTheme: 'dark' }}
          search={{
            SearchDialog: StaticSearchDialog,
            options: {
              api: '/zephyr-ec-learning-system/api/search.json',
            },
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
