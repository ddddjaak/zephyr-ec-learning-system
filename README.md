# Chipsea Zephyr EC Manual

芯海 Zephyr EC 固件开发手册 —— 基于 **Fumadocs (Next.js 16)** 构建的静态文档站，面向 EC 固件工程师、FAE / AE，以及从传统 EC 平台迁移的工程师。

**在线阅读**：<https://ddddjaak.github.io/zephyr-ec-learning-system/>

## 内容结构

`content/docs/` 下 102 个 `.mdx` 页面，7 大章节：

| 章节 | 内容 |
|------|------|
| 快速上手 | 按角色学习路径（EC / FAE / AE / 新成员 / 迁移）、环境搭建、编译烧录 |
| 开发指南 | 架构与配置、10 个功能模块、应用开发、调试与验证（含 coredump 后验分析） |
| Zephyr 内核 | 22 篇系统教程（入门 → 内核机制 → 数据传递 / 输入 / 传感器 → 底层与观测 → 源码分析） |
| 移植与定制 | 新平台移植流程、ITE / Nuvoton 迁移对照、Bringup 清单、Zephyr 版本升级 |
| 最佳实践 | 代码规范、功耗优化、安全加固、多线程、日志诊断、客户协作 |
| 参考手册 | 命令 / Kconfig / 设备树 / 错误码速查、硬件接口、版本变更、贡献指南 |
| 常见问题 | 12 类高频 Q\&A 知识库 |

## 本地开发

```bash
npm install          # 首次（postinstall 自动运行 fumadocs-mdx）
npm run dev          # 开发 → localhost:3000/zephyr-ec-learning-system/
npm run build        # 完整构建（--webpack 通道，约 10 分钟）
npm run build:static # 静态导出 → out/，部署用这个
```

> **构建通道**：本机 Turbopack 存在 PostCSS worker 超时问题，两条构建通道均已固定 `--webpack`。详见 [AGENTS.md](AGENTS.md) 的"构建通道说明"。

约定、组件与边界说明见 [AGENTS.md](AGENTS.md)；新增/修改文档的流程见[手册维护与贡献指南](https://ddddjaak.github.io/zephyr-ec-learning-system/docs/reference/09_manual_contribution)。

## 技术栈

Fumadocs v16 · Next.js 16 (Turbopack dev / webpack build) · Tailwind CSS v4 · Flexsearch 静态搜索 · Mermaid · Shiki 高亮 · 基线 Zephyr 3.7.0 LTS

## 部署

推送 `main` 分支即自动部署到 GitHub Pages（`.github/workflows/deploy.yml`）。需要 Node 22。
