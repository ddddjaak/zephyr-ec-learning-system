import type { Metadata } from 'next';
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

/**
 * 站点级 metadata — 分享卡片（OG/Twitter）与搜索引擎收录的基座。
 *
 * 静态导出部署在 GitHub Pages 项目站点（basePath = /zephyr-ec-learning-system），
 * metadataBase 与 og 路径按当前部署位置写死；仓库改名时与
 * scripts/generate-sitemap.mjs、public/robots.txt 一并同步。
 * app/icon.png（favicon）走 App Router icon 约定，无需在此声明。
 */
export const metadata: Metadata = {
  metadataBase: new URL('https://ddddjaak.github.io'),
  title: {
    default: 'Chipsea Zephyr EC Manual — 换芯片，只改 Device Tree',
    template: '%s | Chipsea Zephyr EC Manual',
  },
  description:
    '基于 Zephyr 3.7 LTS 的芯海 EC 固件开发手册：内核机制、驱动模型、移植流程与调试实践，全部内容逐条对照 Zephyr v3.7.0 上游源码核实。',
  openGraph: {
    type: 'website',
    url: '/zephyr-ec-learning-system/',
    siteName: 'Chipsea Zephyr EC Manual',
    title: '换芯片，只改 Device Tree。| Chipsea Zephyr EC Manual',
    description:
      '键盘扫描 kscan、电池充电 charger、热管理 thermal、电源时序 pwrseq——同一套应用代码，CSCE250X / CSCE2010 / CSCE2520 之间零修改迁移。',
    images: [
      {
        url: '/zephyr-ec-learning-system/og.png',
        width: 1200,
        height: 630,
        alt: 'Chipsea Zephyr EC Manual — 换芯片，只改 Device Tree',
      },
    ],
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/zephyr-ec-learning-system/og.png'],
  },
};

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
