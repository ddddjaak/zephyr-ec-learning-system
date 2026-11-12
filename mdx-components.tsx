import defaultMdxComponents from 'fumadocs-ui/mdx';
import Link from 'fumadocs-core/link';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { MermaidChart } from '@/components/mermaid';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    // 裸 JSX <a> 会被 MDX 编译为原生标签、绕过 basePath；
    // 统一暴露 Link（fumadocs 官方实现，内部走 next/link 自动补 basePath），
    // 内容中的卡片等自定义锚点一律用 <Link ...>。
    Link,
    Tab,
    Tabs,
    Step,
    Steps,
    File,
    Files,
    Folder,
    MermaidChart,
    // remarkMdxMermaid emits <Mermaid chart="..." /> from ```mermaid blocks;
    // route it to the project's themed, sanitized client component.
    Mermaid: MermaidChart,
    ...components,
  };
}
