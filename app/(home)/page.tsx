import { HeroSection } from './_sections/hero-section';
import { PainSolutionSection } from './_sections/pain-solution-section';
import { ObjectionSection } from './_sections/objection-section';
import { TerminalProofSection } from './_sections/terminal-proof-section';
import { AdvantagesSection } from './_sections/advantages-section';
import { MetricsSection } from './_sections/metrics-section';
import { PlatformsSection } from './_sections/platforms-section';
import { UseCasesSection } from './_sections/use-cases-section';
import { DevFlowSection } from './_sections/dev-flow-section';
import { DeliverySection } from './_sections/delivery-section';

/**
 * 首页 — Apple 风格 GSAP 动画驱动
 *
 * 所有区域均已提取到 _sections/ 目录下的独立组件中。
 * 本页面仅负责按顺序组装。
 *
 * 叙事顺序（吸收 magpie 的"断言 → 具体组合 → 逐条拆异议"结构）：
 *   1. Hero          一句话断言 + 具体模块组合 + 真实构建输出
 *   2. PainSolution  隐性成本 vs 芯海的解法
 *   3. Objection     工程师真正会问的六个问题（逐条给答案与入口）
 *   4. TerminalProof 终端实景：构建 / 内存裁剪 / 运行时诊断
 *   5. 其余          优势、指标、平台、用例、流程、交付
 */
export default function HomePage() {
  return (
    <main className="flex flex-col items-center bg-[#0a0a0b]">
      <HeroSection />
      <PainSolutionSection />
      <ObjectionSection />
      <TerminalProofSection />
      <AdvantagesSection />
      <MetricsSection />
      <PlatformsSection />
      <UseCasesSection />
      <DevFlowSection />
      <DeliverySection />
    </main>
  );
}
