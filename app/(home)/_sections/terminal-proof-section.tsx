'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { TerminalWindow, type TerminalLine } from '@/components/terminal-window';

const buildLines: TerminalLine[] = [
  { tone: 'cmd', text: '$ cd ecfw-zephyr && west update' },
  { tone: 'cmd', text: '$ west build -b csce250x_evb app/ -p --build-dir build/ec_fw' },
  { tone: 'dim', text: '-- west build: generating a build system' },
  { tone: 'dim', text: '-- west build: building application' },
  { tone: 'out', text: '[100%] Built target zephyr_final' },
];

const memoryLines: TerminalLine[] = [
  { tone: 'cmd', text: '$ west build -t ram_report' },
  { tone: 'out', text: 'Memory region         Used Size  Region Size  %age Used' },
  { tone: 'warn', text: '           FLASH:      102400 B         1 MB      9.76%' },
  { tone: 'warn', text: '             RAM:       16384 B       256 KB      6.25%' },
  { tone: 'blank', text: '' },
  { tone: 'dim', text: '$ # 按「系统优化」页裁剪 Kconfig 后重新构建' },
  { tone: 'out', text: 'Memory region         Used Size  Region Size  %age Used' },
  { tone: 'ok', text: '           FLASH:       20480 B         1 MB      1.95%' },
  { tone: 'ok', text: '             RAM:        4096 B       256 KB      1.56%' },
];

const runtimeLines: TerminalLine[] = [
  { tone: 'cmd', text: 'uart:~$ i2c scan I2C_0' },
  { tone: 'dim', text: '     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f' },
  { tone: 'out', text: '00:             -- -- -- -- -- -- -- -- -- -- -- --' },
  { tone: 'out', text: '10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --' },
  { tone: 'out', text: '20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --' },
  { tone: 'out', text: '30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --' },
  { tone: 'out', text: '40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --' },
  { tone: 'out', text: '50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 51' },
  { tone: 'blank', text: '' },
  { tone: 'cmd', text: 'uart:~$ log' },
  { tone: 'out', text: '[00:00:00.000,000] <inf> ec_main: reset cause = POR' },
  { tone: 'out', text: '[00:00:01.204,118] <inf> battery: 3S 11840 mV 63%' },
  { tone: 'warn', text: '[00:00:01.212,004] <wrn> thermal: fan 2 stalled, retry' },
];

const windows = [
  {
    title: 'ecfw-zephyr — 构建',
    lines: buildLines,
    href: '/docs/getting-started/02_source_and_build',
    label: '获取源码与编译',
    wide: false,
  },
  {
    title: 'ecfw-zephyr — ram_report 裁剪前后',
    lines: memoryLines,
    href: '/docs/zephyr-kernel/10_optimization',
    label: '系统优化',
    wide: false,
  },
  {
    title: 'uart — i2c scan / log',
    lines: runtimeLines,
    href: '/docs/development/debug/01_logging_and_debug',
    label: '日志与调试',
    wide: true,
  },
];

export function TerminalProofSection() {
  const { scopeRef } = useScrollReveal({ stagger: 0.12, fromY: 36 });

  return (
    <div className="relative w-full overflow-hidden bg-[#0a0a0b]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-[10%] top-[-20%] h-[50%] w-[50%] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.06)_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-6 py-24 sm:px-10 sm:py-32">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Real output
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl lg:text-5xl">
          不是概念图，是终端里跑出来的。
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-neutral-400">
          命令与输出取自本站文档示例，可直接复制执行。
        </p>

        <div ref={scopeRef} className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {windows.map(({ title, lines, href, label, wide }) => (
            <figure key={title} className={wide ? 'md:col-span-2' : undefined}>
              <TerminalWindow title={title} lines={lines} />
              <figcaption className="mt-3 flex items-center gap-1 font-mono text-xs text-neutral-500">
                <span>→</span>
                <Link
                  href={href}
                  className="text-neutral-400 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {label}
                </Link>
                <ArrowUpRight className="h-3.5 w-3.5 text-neutral-600" />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
