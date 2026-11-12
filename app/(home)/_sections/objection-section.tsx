'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const objections = [
  {
    q: '换芯片要重写应用固件吗？',
    a: '不用。应用层只依赖 Zephyr 标准 API；引脚、时钟、总线、外设地址这些板级差异收敛在 Device Tree 与 Kconfig 里。换 CSCE250X → CSCE2010/2520，改的是板级配置，不是业务代码。',
    href: '/docs/porting/01_porting_guide',
    label: '移植流程',
  },
  {
    q: '会不会被这家芯片厂绑死？',
    a: '固件基于 Zephyr 3.7 LTS 上游内核与驱动模型，不依赖私有 RTOS。任何支持 Zephyr 的平台都能承接这套应用代码；驱动按上游模型组织，换芯片不需要推倒重来。',
    href: '/docs/zephyr-kernel/07_driver_model',
    label: '驱动模型',
  },
  {
    q: '文档里的 API 和配置可信吗？',
    a: '内核、驱动、子系统章节逐条对照 Zephyr v3.7.0 上游源码核实，关键 API 附真实签名；平台相关内容标注来源（HAL 头文件、板级 DTS），可用你手里的 SDK 复核。',
    href: '/docs/reference/09_manual_contribution',
    label: '内容约定',
  },
  {
    q: '现场出问题，最快从哪查？',
    a: '按症状进 Q&A 知识库。每篇是一条 Triage Checklist：复现 → 定位 → 缩小 → 根因 → 防护，末页附调试工具速查表。不用从零读代码。',
    href: '/docs/qa',
    label: 'Q&A 知识库',
  },
  {
    q: '我从 C51 裸机 / 友商 EC 过来，多久能上手？',
    a: '三条迁移路径：裸机心智模型映射（超级循环 → 线程、中断下半部 → workqueue）、ITE IT557x 对照、Nuvoton NPCX 对照。对照表直接给出“原来这么写，现在这么写”。',
    href: '/docs/development/architecture/02_vs_legacy_ec',
    label: '与传统 EC 对比',
  },
  {
    q: '新平台 bring-up 要多久？',
    a: '按清单逐项验收：时钟 → 调试串口 → eSPI → 键盘 → 电池 → 热管理 → PD。每项有判据与未通过时的排查方向，一次 bring-up 走完不用回头补。',
    href: '/docs/porting/07_bringup_checklist',
    label: 'Bring-up 清单',
  },
];

export function ObjectionSection() {
  const { scopeRef } = useScrollReveal({ stagger: 0.07, fromY: 28 });

  return (
    <div className="w-full bg-white dark:bg-[#08080a]">
      <div className="mx-auto max-w-5xl px-6 py-24 sm:px-10 sm:py-32">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
          Before you start
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white sm:text-4xl lg:text-5xl">
          工程师真正会问的问题
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-neutral-500 dark:text-neutral-400">
          先回答这六个，再决定要不要往下读。
        </p>

        <div ref={scopeRef} className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
          {objections.map((item) => (
            <Link
              key={item.q}
              href={item.href}
              className="group flex flex-col gap-3 rounded-xl border border-neutral-200 bg-[#fafafa] p-6 transition-colors duration-300 hover:border-neutral-300 hover:bg-white dark:border-neutral-800/80 dark:bg-[#0f0f11] dark:hover:border-neutral-700 dark:hover:bg-[#131316]"
            >
              <p className="text-base font-semibold text-neutral-900 dark:text-white">
                {item.q}
              </p>
              <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {item.a}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 pt-2 font-mono text-xs text-neutral-400 transition-colors group-hover:text-neutral-700 dark:text-neutral-500 dark:group-hover:text-neutral-300">
                {item.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
