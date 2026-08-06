/**
 * One-time migration script: refs/zephyr-ec/docs/zephyr-kernel/*.md (MkDocs
 * Material) → content/docs/zephyr-kernel/*.mdx (Fumadocs MDX).
 *
 * Transformations:
 *  1. Keep YAML frontmatter (title/description) as-is.
 *  2. Drop the leading `# h1` heading (the template renders the title).
 *  3. `!!! type "title"` admonitions (indented body) → `:::type[title]` +
 *     dedented body + closing `:::` (remark-directive fenced container).
 *     Indented bodies must be dedented, else remark parses them as an
 *     indented code block (verified experimentally).
 *  4. Relative links to sibling .md files → absolute /docs/zephyr-kernel/...
 *     slugs (trailing .md stripped).
 *  5. ```gdb fenced blocks → ```console (no gdb grammar in Shiki).
 *
 * Usage: node scripts/convert-zephyr-kernel.mjs
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SRC_DIR = path.join(ROOT, 'refs', 'zephyr-ec', 'docs', 'zephyr-kernel');
const DST_DIR = path.join(ROOT, 'content', 'docs', 'zephyr-kernel');

// mkdocs nav order (mkdocs.yml), used for the meta.json pages array.
const NAV_ORDER = [
  '08_introduction',
  '09_project_structure',
  '10_west_tool',
  '11_basic_examples',
  '01_kernel_mechanisms',
  '02_config_system',
  '03_driver_model',
  '04_subsystems',
  '12_architecture_design',
  '05_optimization',
  '06_security',
  '07_kernel_source',
  '13_community_contribution',
];

const SIBLINGS = new Set(NAV_ORDER);

function splitFrontmatter(text) {
  if (!text.startsWith('---\n')) return { frontmatter: '', body: text };
  const end = text.indexOf('\n---', 4);
  if (end === -1) return { frontmatter: '', body: text };
  return {
    frontmatter: text.slice(0, end + 4),
    body: text.slice(end + 4),
  };
}

/**
 * Strip the first top-level `# h1` heading (the page title — the template
 * renders the title, so the h1 would duplicate it). Only matches h1 outside
 * fenced code blocks; each source page has exactly one.
 */
function dropH1(body) {
  const lines = body.split('\n');
  let inFence = false;
  let dropped = false;
  const out = [];
  for (const line of lines) {
    if (!dropped && /^\s*```/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (!dropped && !inFence && /^#\s+\S/.test(line)) {
      dropped = true;
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}

/** Convert `!!! type "title"` (indented body) into `:::type[title]` fenced. */
function convertAdmonitions(body) {
  const lines = body.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const m = lines[i].match(/^!!!\s+(\w+)(?:\s+"([^"]*)")?\s*$/);
    if (!m) {
      out.push(lines[i]);
      i++;
      continue;
    }

    const type = m[1];
    const title = m[2] ?? '';
    out.push(title ? `:::${type}[${title}]` : `:::${type}`);

    // Collect indented body until a non-indented, non-blank line.
    const bodyLines = [];
    i++;
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === '') {
        bodyLines.push('');
        i++;
        continue;
      }
      if (/^(\s{1,})/.test(line) && !/^!!!\s/.test(line.trimStart())) {
        bodyLines.push(line);
        i++;
        continue;
      }
      break;
    }
    // Drop trailing blank lines, dedent by the minimal indent.
    while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === '') bodyLines.pop();
    let minIndent = Infinity;
    for (const l of bodyLines) {
      if (l.trim() === '') continue;
      const indent = l.match(/^\s*/)[0].length;
      if (indent < minIndent) minIndent = indent;
    }
    if (minIndent === Infinity) minIndent = 0;
    const dedented = bodyLines.map((l) => (l.trim() === '' ? '' : l.slice(minIndent)));
    out.push(...dedented);
    out.push(':::');
    out.push(''); // blank line after the fenced container (MDX block boundary)
  }
  return out.join('\n');
}

/** Rewrite sibling relative links to absolute /docs/zephyr-kernel/ slugs. */
function convertLinks(body) {
  return body.replace(/\]\(([^)\s]+)(?:\.md)?(#[^)\s]*)?(?:\s+"[^"]*")?\)/g, (full, href, anchor) => {
    const base = href.split('#')[0];
    if (!SIBLINGS.has(base.replace(/\.md$/, ''))) return full;
    const slug = base.replace(/\.md$/, '');
    return full.replace(href + (anchor ?? ''), `/docs/zephyr-kernel/${slug}${anchor ?? ''}`);
  });
}

/** gdb grammar does not exist in Shiki → console. */
function convertGdb(body) {
  return body.replace(/```gdb/g, '```console');
}

/**
 * Zephyr console log lines like `[00:00:10.234,000] <err> uart_stm32: ...`
 * appear in the sources as bare prose (MkDocs tolerates them). In MDX the
 * `<err>` etc. tags parse as HTML elements and must be escaped — but only
 * outside fenced code blocks (inside them they are safe).
 */
function escapeLogTags(body) {
  const lines = body.split('\n');
  let inFence = false;
  const out = [];
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (!inFence) out.push(line.replace(/<(err|inf|wrn|dbg)>/g, '&lt;$1&gt;'));
    else out.push(line);
  }
  return out.join('\n');
}

/**
 * HTML comments (`<!-- ... -->`) at block level trip the MDX parser in some
 * contexts (they end up as a JSX comment token and fail). Rewrite them to
 * MDX comments (`{/* ... *\/}`) outside fenced code blocks.
 */
function convertHtmlComments(body) {
  const lines = body.split('\n');
  let inFence = false;
  const out = [];
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (!inFence) out.push(line.replace(/<!--\s*([\s\S]*?)\s*-->/g, '{/* $1 */}'));
    else out.push(line);
  }
  return out.join('\n');
}

const MARKDOWN_STRUCTURE = /^(#{2,}|>\s|\|\s|[-*+]\s|\d+\.\s|\[|<!|:::|\*\*|`{2,})/;

/**
 * Repair orphan fenced code blocks. Source docs contain three defect shapes:
 *   A. closing ``` with no opener (code text after a normal block) → re-open
 *      before the code-shaped content above it (CONFIG_* → ini, else bash).
 *   B. a stray bare ``` with no code above → treated as a normal unlabelled
 *      opener; the EOF handler drops it if the tail is not code.
 *   C. ` ```lang ` opener whose body is a verbatim duplicate of the text
 *      above it (copy-paste defect) → wrap the first copy, drop the duplicate
 *      body + stray fences.
 * Normal paired ` ```lang ` openers pass through untouched; a trailing
 * unclosed opener at EOF is closed if the tail looks like code, else dropped.
 */
function repairOrphanCodeBlocks(body) {
  const lines = body.split('\n');
  const out = [];
  let inFence = false;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const isFence = /^\s*```/.test(line);

    if (isFence && !inFence) {
      const nextIdx = lines.slice(i + 1).findIndex((l) => /^\s*```/.test(l));

      if (/^```\S/.test(line) && nextIdx !== -1) {
        // Case C: is the fenced body a verbatim duplicate of the text above?
        const closeIdx = i + 1 + nextIdx;
        const dup = lines.slice(i + 1, closeIdx);
        const prevStart = i + 1 - dup.length;
        const same =
          prevStart >= 0 &&
          dup.length > 0 &&
          dup.every((l, k) => l.trim() === lines[prevStart + k].trim());
        if (same) {
          out.push(line); // keep opener
          for (let j = prevStart; j < i; j++) out.push(lines[j]);
          out.push('```'); // close the first copy
          i = closeIdx + 1; // skip dup body + stray close
          continue;
        }
        // Normal paired opener.
        inFence = true;
        out.push(line);
        i++;
        continue;
      }

      if (/^```\S/.test(line)) {
        // Opener with no close anywhere → treat as normal opener; the EOF
        // handler decides whether to close or drop it.
        inFence = true;
        out.push(line);
        i++;
        continue;
      }

      // Bare ``` — Case A (orphan close with code above) or a normal
      // unlabelled block opener.
      const start = collectCodeCandidate(lines, i - 1);
      if (start !== -1) {
        const block = lines.slice(start, i);
        const first = block.find((l) => l.trim() !== '') ?? '';
        if (first.startsWith('# ') && block.length <= 60) {
          const lang = /CONFIG_[A-Z0-9_]+=/.test(block.join('\n')) ? 'ini' : 'bash';
          // The block lines were already pushed by the main loop — rewind
          // them out, then re-emit wrapped in a fence.
          const n = i - start;
          const tailStart = out.length - n;
          if (tailStart >= 0 && out.slice(tailStart).join('\n') === block.join('\n')) {
            out.length = tailStart;
          } else {
            // Out-of-sync (prior repairs shifted things): search backwards.
            const idx = out.lastIndexOf(block[0]);
            if (idx !== -1) out.length = idx;
          }
          out.push('```' + lang);
          for (let j = start; j < i; j++) out.push(lines[j]);
          out.push('```');
          i++; // consume the orphan close
          continue;
        }
      }
      // Case B / normal unlabelled opener.
      inFence = true;
      out.push(line);
      i++;
      continue;
    }

    // Closing fence inside a block.
    if (isFence) inFence = false;
    out.push(line);
    i++;
  }

  // EOF: a fence left open — close it if the tail looks like code, else drop
  // the stray opener.
  if (inFence) {
    const lastOpen = out
      .map((l, idx) => (/^\s*```/.test(l) ? idx : -1))
      .filter((x) => x !== -1)
      .pop();
    if (lastOpen !== undefined) {
      const tail = out.slice(lastOpen + 1).filter((l) => l.trim() !== '');
      const looksCode = tail.length > 0 && tail.every((l) => l.startsWith('# ') || !MARKDOWN_STRUCTURE.test(l));
      if (looksCode && tail.length <= 60) {
        out.push('```');
      } else {
        out.splice(lastOpen, 1); // stray opener
        if (out[out.length - 1]?.trim() === '') out.pop();
      }
    }
  }
  return out.join('\n');
}

/** Walk back from `idx` while lines look like code; return start index or -1.
 * "Code-like": `# ` comment lines (any language), CONFIG_ assignments,
 * commands — i.e. lines with no CJK prose. A line containing Chinese text
 * that is not a comment ends the scan (it is prose, not code). */
function collectCodeCandidate(lines, idx) {
  let start = idx;
  while (start >= 0) {
    const l = lines[start];
    if (/^\s*```/.test(l)) break; // a real block boundary above — stop here
    if (l.trim() === '') {
      start--;
      continue;
    }
    const isComment = l.trimStart().startsWith('# ');
    const hasCjk = /[\u4e00-\u9fff]/.test(l);
    if (isComment || (!MARKDOWN_STRUCTURE.test(l) && !l.includes('](') && !hasCjk)) {
      start--;
      continue;
    }
    break; // prose / markdown structure — stop
  }
  return start + 1;
}

function convert(source) {
  let { frontmatter, body } = splitFrontmatter(source);
  body = dropH1(body);
  body = convertAdmonitions(body);
  body = convertLinks(body);
  body = convertGdb(body);
  body = escapeLogTags(body);
  body = convertHtmlComments(body);
  body = repairOrphanCodeBlocks(body);
  return frontmatter + '\n' + body;
}

async function main() {
  const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith('.md'));
  await mkdir(DST_DIR, { recursive: true });

  const summary = [];
  for (const f of files) {
    const raw = await readFile(path.join(SRC_DIR, f), 'utf8');
    const src = raw.replace(/\r\n/g, '\n'); // normalize CRLF → LF
    const out = convert(src);
    const dst = path.join(DST_DIR, f.replace(/\.md$/, '.mdx'));
    await writeFile(dst, out, 'utf8');
    const mdxLines = out.split('\n').length;
    const mdLines = src.split('\n').length;
    summary.push(`${f} → ${f.replace(/\.md$/, '.mdx')}  (${mdLines}→${mdxLines} lines)`);
  }

  // meta.json for the new chapter, ordered by mkdocs nav.
  const meta = { title: 'Zephyr 内核', pages: NAV_ORDER };
  await writeFile(path.join(DST_DIR, 'meta.json'), JSON.stringify(meta), 'utf8');

  console.log(summary.join('\n'));
  console.log(`\nWrote ${files.length} .mdx files + meta.json to ${DST_DIR}`);
  console.log(`Remaining admonitions (should be 0): ${(await readdir(DST_DIR)).length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
