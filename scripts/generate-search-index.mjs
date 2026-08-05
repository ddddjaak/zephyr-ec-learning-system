/**
 * Generate static search index using Flexsearch.
 * Document structure matches fumadocs-core's buildDocuments format
 * for compatibility with flexsearchStaticClient.
 */
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = join(__dirname, '..', 'content', 'docs');

// ---- Helpers ----

function findMdxFiles(dir, base = '') {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'meta.json') continue;
    const full = join(dir, entry.name);
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...findMdxFiles(full, rel));
    else if (entry.name.endsWith('.mdx')) files.push({ full, rel });
  }
  return files;
}

/**
 * Normalize CRLF → LF so frontmatter regexes work identically on Windows
 * (core.autocrlf=true converts checked-out files to CRLF).
 */
function normalizeLineEndings(content) {
  return content.replace(/\r\n/g, '\n');
}

function extractFrontmatterField(raw, field) {
  const content = normalizeLineEndings(raw);
  const fm = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const re = new RegExp(`^${field}:\\s*(.+)$`, 'm');
  const m = fm[1].match(re);
  return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

function extractHeadings(raw) {
  // Strip frontmatter first
  const content = normalizeLineEndings(raw);
  const body = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const headings = [];
  const lines = body.split('\n');
  let inFence = false;

  for (const line of lines) {
    // Skip lines inside fenced code blocks (e.g. "# dts/bindings/..." in examples)
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = line.match(/^(#{2,4})\s+(.+)$/);
    if (m) {
      headings.push({
        level: m[1].length,
        content: m[2].trim(),
        id: m[2].trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w一-鿿-]/g, ''),
      });
    }
  }
  return headings;
}

function extractBodyText(raw) {
  return normalizeLineEndings(raw)
    .replace(/^---\n[\s\S]*?\n---/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[#*`~>|\[\]()!\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    // 800 chars is enough for full-text search; larger bodies blow up the
    // flexsearch "full" tokenizer index (O(N²) CJK substrings) to >6MB.
    .substring(0, 800);
}

function buildUrl(relPath) {
  let slug = relPath.replace(/\.mdx$/, '');
  if (slug.endsWith('/index')) slug = slug.replace(/\/index$/, '');
  return `/docs/${slug}`;
}

function buildBreadcrumbs(relPath) {
  // e.g. "development/appdev/01_new_feature_module.mdx" → ["Development", "App Dev"]
  const parts = relPath.split('/');
  parts.pop(); // remove filename
  if (parts.length === 0) return [];
  return parts.map((p) => {
    // Try to read section title from meta.json
    const metaPath = join(docsDir, ...parts.slice(0, parts.indexOf(p) + 1), 'meta.json');
    try {
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
      return meta.title || p;
    } catch {
      return p.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
  });
}

function readMetaTitle(sectionPath) {
  try {
    const meta = JSON.parse(readFileSync(join(docsDir, sectionPath, 'meta.json'), 'utf-8'));
    return meta.title || sectionPath;
  } catch {
    return sectionPath;
  }
}

// ---- Main ----

async function main() {
  const _Search = await import('flexsearch');
  const FlexSearch = (_Search && _Search.Document ? _Search : (_Search.default || _Search)).Document;

  // IMPORTANT: Must match fumadocs-core's createDocument() exactly
  // tokenize: 'forward' keeps the CJK index small — 'full' generates O(N²)
  // substring tokens for Chinese text and blows search.json up to multi-MB.
  const index = new FlexSearch({
    tokenize: 'forward',
    document: {
      id: 'id',
      index: ['content'],
      tag: ['tags'],
      store: true,
    },
  });

  const mdxFiles = findMdxFiles(docsDir);
  let count = 0;

  for (const { full, rel } of mdxFiles) {
    const raw = normalizeLineEndings(readFileSync(full, 'utf-8'));
    const title = extractFrontmatterField(raw, 'title');
    if (!title) continue;

    const url = buildUrl(rel);
    const bodyText = extractBodyText(raw);
    const headings = extractHeadings(raw);
    const breadcrumbs = buildBreadcrumbs(rel);
    const tags = rel.includes('/') ? [rel.split('/')[0]] : [];

    // Add page entry (matches fumadocs buildDocuments)
    index.add(count++, {
      id: url,
      page_id: url,
      type: 'page',
      content: title,
      breadcrumbs,
      tags,
      url,
    });

    // Add heading entries as sub-items
    for (const heading of headings) {
      index.add(count++, {
        id: `${url}#${heading.id}`,
        page_id: url,
        type: 'heading',
        content: heading.content,
        tags,
        url: `${url}#${heading.id}`,
      });
    }

    // Add description as text entry (if available)
    const description = extractFrontmatterField(raw, 'description');
    if (description) {
      index.add(count++, {
        id: `${url}-desc`,
        page_id: url,
        type: 'text',
        content: description,
        tags,
        url,
      });
    }

    // Add body text content as a text entry for full-text search
    if (bodyText.length > 0) {
      index.add(count++, {
        id: `${url}-body`,
        page_id: url,
        type: 'text',
        content: bodyText,
        tags,
        url,
      });
    }
  }

  console.log(`Indexed ${count} entries from ${mdxFiles.length} pages`);

  // Sanity check: every page must produce at least 1 entry (the page record).
  // A silent near-empty index (e.g. CRLF frontmatter mismatch) must fail the build.
  if (count < mdxFiles.length) {
    console.error(
      `Sanity check FAILED: expected at least ${mdxFiles.length} entries, got ${count}. ` +
        'Aborting to avoid shipping a broken search index.',
    );
    process.exit(1);
  }

  // Export — collect all chunks from callback
  const raw = {};
  await new Promise((resolve) => {
    let pending = 0;
    index.export((key, data) => {
      raw[key] = data;
      clearTimeout(pending);
      // flexsearch yields chunks across macrotasks; wait for an idle window
      // before resolving so large indexes are not truncated.
      pending = setTimeout(resolve, 250);
    });
  });

  const exported = { type: 'flexsearch', raw };

  const outDir = join(__dirname, '..', 'public', 'api');
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, 'search.json');
  const json = JSON.stringify(exported);
  writeFileSync(outFile, json);
  console.log(`Search index: ${outFile} (${json.length} bytes)`);

  // Guard against future index-size regressions (CJK full-tokenizer blowups).
  const MAX_INDEX_BYTES = 3 * 1024 * 1024;
  if (json.length > MAX_INDEX_BYTES) {
    console.error(
      `Sanity check FAILED: search index is ${json.length} bytes (> ${MAX_INDEX_BYTES}). ` +
        'Trim body text length or switch tokenization strategy.',
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
