'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen, Braces, Terminal, Blocks } from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsap';
import { HeroBackground } from './hero-background';
import { TerminalWindow } from '@/components/terminal-window';

const quickLinks = [
  { icon: BookOpen, label: '开发指南', href: '/docs/development' },
  { icon: Braces, label: '应用开发', href: '/docs/development/appdev/01_new_feature_module' },
  { icon: Blocks, label: '移植', href: '/docs/porting' },
  { icon: Terminal, label: '命令参考', href: '/docs/reference/01_command_reference' },
];

const buildLines = [
  {
    tone: 'cmd' as const,
    text: '$ west build -b csce250x_evb app/ -p --build-dir build/ec_fw',
  },
  { tone: 'dim' as const, text: '-- west build: generating a build system' },
  { tone: 'dim' as const, text: '-- west build: building application' },
  { tone: 'out' as const, text: '[100%] Built target zephyr_final' },
];

export function HeroSection() {
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const textEls = [headingRef.current, subtitleRef.current, ctaRef.current, eyebrowRef.current];
    gsap.set(textEls, { opacity: 0, y: 24, visibility: 'visible' });
    if (pillsRef.current) {
      const children = Array.from(pillsRef.current.children) as HTMLElement[];
      gsap.set(children, { opacity: 0, y: 16, visibility: 'visible' });
    }
    gsap.set(proofRef.current, { opacity: 0, y: 32, visibility: 'visible' });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.15)
      .to(headingRef.current, { opacity: 1, y: 0, duration: 1.2 }, 0.35)
      .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.9 }, 0.7)
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.95);

    if (pillsRef.current) {
      const children = Array.from(pillsRef.current.children) as HTMLElement[];
      tl.to(children, {
        opacity: 1, y: 0,
        duration: 0.5, stagger: 0.06, ease: 'power3.out',
      }, 1.15);
    }

    tl.to(proofRef.current, { opacity: 1, y: 0, duration: 0.9 }, 1.35);
  }, []);

  return (
    <section className="relative flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden bg-white dark:bg-[#0a0a0b] sm:min-h-[90vh]">
      <HeroBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-16 text-center sm:px-8 sm:py-20">
        <p
          ref={eyebrowRef}
          className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500"
        >
          Chipsea Zephyr EC · Zephyr 3.7 LTS
        </p>

        <h1
          ref={headingRef}
          className="text-balance font-sans text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-neutral-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          <span className="block sm:inline">换芯片，</span>
          <span className="block sm:inline">只改 Device Tree。</span>
        </h1>

        <p
          ref={subtitleRef}
          className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-lg"
        >
          键盘扫描用 <code className="font-mono text-neutral-700 dark:text-neutral-300">kscan</code>、
          电池充电用 <code className="font-mono text-neutral-700 dark:text-neutral-300">charger</code>、
          热管理用 <code className="font-mono text-neutral-700 dark:text-neutral-300">thermal</code>、
          电源时序用 <code className="font-mono text-neutral-700 dark:text-neutral-300">pwrseq</code>
          ——同一套 Zephyr 3.7 LTS 应用代码，在
          <strong className="font-semibold text-neutral-900 dark:text-white"> CSCE250X / CSCE2010 / CSCE2520 </strong>
          之间迁移，应用层零修改。
        </p>

        {/* CTA */}
        <div ref={ctaRef} className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/docs/getting-started"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-neutral-900 px-8 text-sm font-semibold text-white transition-all duration-300 hover:bg-black hover:scale-[1.03] active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            开始 Zephyr！
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/docs/development"
            className="inline-flex h-12 items-center rounded-full border border-neutral-300 px-8 text-sm font-semibold text-neutral-700 transition-all duration-300 hover:border-neutral-900 hover:text-black hover:scale-[1.03] active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white"
          >
            浏览文档
          </Link>
        </div>

        {/* 快速导航 */}
        <div ref={pillsRef} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {quickLinks.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100/80 px-4 py-2 text-sm font-medium text-neutral-600 backdrop-blur-sm transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-200 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/80 dark:hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>

        {/* 构建实景 — 工程师的第一眼信任 */}
        <div ref={proofRef} className="mt-14 w-full max-w-xl text-left">
          <TerminalWindow
            title="ecfw-zephyr — west build 示例输出"
            lines={buildLines}
          />
        </div>
      </div>
    </section>
  );
}
