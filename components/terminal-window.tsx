/**
 * TerminalWindow — 终端输出卡片的视觉容器
 *
 * 用于把"真实命令与输出"呈现成工程师熟悉的终端窗口，替代抽象插画。
 * 纯展示组件：不执行任何命令，内容由调用方以 lines 传入。
 */

export type TerminalTone = 'cmd' | 'out' | 'ok' | 'warn' | 'dim' | 'blank';

export interface TerminalLine {
  tone?: TerminalTone;
  text: string;
}

const toneClass: Record<TerminalTone, string> = {
  cmd: 'text-neutral-100',
  out: 'text-neutral-400',
  ok: 'text-emerald-400',
  warn: 'text-amber-400',
  dim: 'text-neutral-600',
  blank: '',
};

const PROMPTS = ['uart:~$ ', '$ '];

function renderLine(line: TerminalLine, i: number) {
  const tone = line.tone ?? 'out';

  if (tone === 'blank') {
    return <div key={i} className="h-[1.1em]" aria-hidden="true" />;
  }

  // 命令行的提示符单独上色，其余按普通文本
  const prompt = PROMPTS.find((p) => line.text.startsWith(p));
  if (tone === 'cmd' && prompt) {
    return (
      <div key={i} className="whitespace-pre">
        <span className="text-emerald-400">{prompt}</span>
        <span className={toneClass[tone]}>{line.text.slice(prompt.length)}</span>
      </div>
    );
  }

  return (
    <div key={i} className={`whitespace-pre ${toneClass[tone]}`}>
      {line.text}
    </div>
  );
}

export function TerminalWindow({
  title,
  lines,
  className = '',
}: {
  title: string;
  lines: TerminalLine[];
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-neutral-800 bg-[#0b0b0d] shadow-[0_24px_70px_-34px_rgba(0,0,0,0.85)] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-neutral-800/80 bg-[#151517] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" aria-hidden="true" />
        <span className="ml-2 truncate font-mono text-[11px] text-neutral-500">{title}</span>
      </div>
      <div className="overflow-x-auto p-4 font-mono text-[12px] leading-[1.75] sm:text-[12.5px]">
        {lines.map(renderLine)}
      </div>
    </div>
  );
}
