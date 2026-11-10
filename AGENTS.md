# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

# AGENTS.md — Chipsea Zephyr EC Manual

Fumadocs (Next.js 16) 构建的 EC 固件开发手册。源文件：95 `.mdx` 在 `content/docs/`，分 7 个章节。

## 命令

```bash
npm install          # 首次（postinstall 自动运行 fumadocs-mdx）
npm run dev          # 开发 → localhost:3000/zephyr-ec-learning-system/
npm run build        # 完整构建（先运行 prebuild），走 --webpack 通道
npm run build:static # 静态导出（NEXT_STATIC_EXPORT=1）→ out/，部署用这个
```

**构建通道说明（2026-11-03）**：`next build` 默认的 Turbopack 在本机存在确定性失败——PostCSS/Tailwind worker 进程超时（`Failed to write app endpoint /_not-found/page`，`deadline has elapsed`），`npm run build` 与 `npm run build:static` 两种模式均会命中。两条构建通道已固定加 `--webpack`（各约 9~10 分钟，产物一致；webpack 全量构建已验证通过）。若后续 Next.js/Turbopack 升级修复了该 worker 超时问题，可移除两处 `--webpack`。注意：不要混跑两种 bundler 后不清 `.next`——切换通道前先 `rm -rf .next`。

**Prebuild（构建前自动运行）**:
- `scripts/generate-params.mjs` — 递归遍历 `content/docs/`，将静态 slug 写入 `lib/static-slugs.ts`（供 `generateStaticParams` 使用）
- `scripts/generate-search-index.mjs` — 生成 `public/api/search.json`（供客户端搜索使用的 flexsearch 静态索引）

推送 = 自动部署到 GitHub Pages（`.github/workflows/deploy.yml`）。需要 Node 22。

注意：`esbuild` / `sharp` 的安装脚本通过 `package.json` 的 `allowScripts` 白名单放行，新增原生依赖时需同步更新。

## 技术栈

- **框架**: Fumadocs v16 + Next.js 16.2 (Turbopack) + Tailwind CSS v4
- **MDX**: `fumadocs-mdx` → `source.config.ts` → `.source/` → `lib/source.ts`
- **高亮**: Shiki (github-light / github-dark)，langs: bash/batch/c/cmake/json/jsonc/ini/makefile/mermaid/powershell/python/yaml
- **搜索**: Flexsearch 静态索引（`public/api/search.json`） + 自定义 `StaticSearchDialog` 组件（非 Orama）
- **图表**: Mermaid（```mermaid 代码块经 remarkMdxMermaid → `@/components/mermaid` 渲染）
- **Admonition**: `:::note[标题]` / `:::tip` / `:::warning` / `:::danger` 等 remark-directive（zephyr-kernel 章节大量使用）
- **字体**: JetBrains Mono（等宽）
- **主题**: Purple preset + 自定义 cyber 暗色（deep purple `#673AB7` + cyan `#00E5FF`）
- **路径别名**: `@/*` → `./*`（tsconfig paths）

## 关键文件（按改动频率）

```
修改文档   → content/docs/**/*.mdx + meta.json
修改首页   → app/(home)/page.tsx + app/(home)/_sections/*.tsx（每个区域一个组件）
修改样式   → app/global.css          (~490 行，.dark/:root 双模式)
修改导航   → app/layout.config.ts
构建配置   → next.config.ts            (basePath + trailingSlash + conditional export)
MDX 配置   → source.config.ts          (Shiki themes/langs、admonition 类型)
路由页面   → app/docs/[[...slug]]/page.tsx
预构建     → scripts/generate-params.mjs → lib/static-slugs.ts
搜索索引   → scripts/generate-search-index.mjs → public/api/search.json
MDX 组件   → mdx-components.tsx        (Tabs, Steps, Files, MermaidChart)
```

## 布局结构

三层 Next.js 布局嵌套：

```
app/layout.tsx              → RootProvider + 搜索 + JetBrains Mono 字体
├─ app/(home)/layout.tsx    → HomeLayout（首页布局，无侧边栏）
│   └─ app/(home)/page.tsx  → 按顺序组装 _sections/ 下的区域组件（GSAP 动画）
└─ app/docs/layout.tsx      → DocsLayout + ReadingProgress 组件
    └─ app/docs/[[...slug]]/page.tsx
```

## 自定义组件

`components/` 下的组件（非 Fumadocs 内置）：

| 组件 | 用途 |
|------|------|
| `dot-pattern.tsx` | 背景点阵图案 |
| `hero-search.tsx` | 首页居中搜索条的客户端包装器 |
| `hero-svg-chip.tsx` | 首页 hero 芯片 SVG 插画 |
| `search-dialog.tsx` | 用于静态导出的 Flexsearch 搜索对话框 |
| `mermaid.tsx` | MDX 中使用的 Mermaid 图表渲染器（客户端） |
| `mermaid-inner.tsx` | Mermaid 内部渲染逻辑 |
| `reading-progress.tsx` | 文档页面顶部阅读进度条 |

首页区域组件在 `app/(home)/_sections/`（hero、痛点方案、优势、指标、平台、用例、开发流程、交付）。

## 文档约定

- **Frontmatter 必须**: `title: 文档标题`
- **内部链接**: 绝对路径 `/docs/...`（不用相对路径）
- **禁止硬编码 basePath**: 不要写 `/zephyr-ec-learning-system/docs/...`（next/link 会自动补 basePath，硬编码会在仓库改名后全部失效）
- **代码块语言别名**: `kconfig`→`ini`, `dts`/`devicetree`→`c`（其余用 Shiki 已注册语言，未知语言回落 `text`）
- **标题层级**: 页面模板已渲染 h1，内容标题从 `##` 起步
- **CSS 类**: `.grid-cards`（卡片网格）、`.page-footer`、`.reading-progress`；章节入口页还有 `.hub-card` / `.step-card` / `.qa-mini-card` / `.feature-card`
- **图标**: `import { Rocket } from 'lucide-react'` → `<Rocket />`
- **MDX 可用组件**: `<Tabs>`, `<Tab>`, `<Steps>`, `<Step>`, `<Files>`, `<File>`, `<Folder>`, `<MermaidChart>`

## 导航结构

```
content/docs/meta.json        → root: [getting-started, development, zephyr-kernel, porting, best-practices, reference, qa]
  每个子目录有 meta.json       → pages: ["index", "01_xxx", ...]（index 排首位 = 章节入口）
  Fumadocs 文件系统路由        → /docs/{section}/{page}
  index.mdx                   → /docs/{section}（章节入口，卡片网格）
  文件名编号 NN_ 与 meta.json 顺序保持一致（新增页面前先对齐编号）
```

## 边界

- **禁止**: 在 MDX 中使用 `class=`（React 用 `className=`）
- **禁止**: 相对链接（必须 `/docs/...` 绝对路径）
- **禁止**: 内容中使用 `# ` 标题（h1 由模板提供，内容从 `## ` 起步）
- **修改样式时**: 同时处理 `.dark` 和 `:root` 两套配色
- **修改 `next.config.ts` 后**: 验证 `npm run dev` + `npm run build` 均正常
- **修改 MDX 配置后**: 运行 `npm run dev` 触发 `.source/` 重新生成

## EC 固件参考

文档中的代码示例来源于 EC 固件仓库和参考实现。这些目录不在本仓库内，需要读取 EC 代码时，必须先向用户确认其本地路径。

常见参考源（实际路径由用户指定）：
- EC Zephyr 固件仓库 — `app/` 功能模块、`drivers/` 设备驱动、`boards/` 板级支持包
