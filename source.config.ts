import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import remarkDirective from 'remark-directive';
import {
  remarkDirectiveAdmonition,
  remarkMdxMermaid,
} from 'fumadocs-core/mdx-plugins';

export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [
      // `:::note[title]` container-directive syntax → Callout components.
      // Loaded for the zephyr-kernel chapter (ported from MkDocs Material,
      // whose `!!! note "title"` admonitions are rewritten to this syntax).
      remarkDirective,
      // Extra type mappings beyond the built-in set: mkdocs `example`/`quote`
      // admonitions have no 1:1 Callout type, map them to info.
      [
        remarkDirectiveAdmonition,
        {
          types: {
            note: 'info',
            tip: 'info',
            info: 'info',
            warn: 'warning',
            warning: 'warning',
            danger: 'error',
            success: 'success',
            example: 'info',
            quote: 'info',
          },
        },
      ],
      // ```mermaid fenced blocks → <Mermaid chart="..." /> (registered in
      // mdx-components.tsx as MermaidChart, which renders client-side).
      remarkMdxMermaid,
    ],
    rehypePlugins: [],
    rehypeCodeOptions: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      langs: [
        'bash',
        'batch',
        'c',
        'cmake',
        'json',
        'jsonc',
        'ini',
        'makefile',
        'mermaid',
        'powershell',
        'python',
        'yaml',
      ],
      defaultLanguage: 'text',
      langAlias: {
        kconfig: 'ini',
        dts: 'c',
        devicetree: 'c',
        // NOTE: no `make` alias here — shiki's `makefile` grammar already
        // registers `make` as an alias; adding it here creates a
        // make -> makefile -> make cycle that breaks Shiki loading.
      },
    },
  },
});
