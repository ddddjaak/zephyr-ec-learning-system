/**
 * 生成品牌资产（一次性脚本，产物入库，无需加入 prebuild）：
 *   - app/icon.png           512×512 favicon（App Router icon 约定）
 *   - public/og.png          1200×630 Open Graph 分享卡片
 *
 * 运行：node scripts/generate-brand-assets.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const logoPath = path.join(root, 'public', 'media', 'chipsea-logo.png');
const iconOut = path.join(root, 'app', 'icon.png');
const ogOut = path.join(root, 'public', 'og.png');

// ---------- 菱形标志：logo 左侧的图形部分（文字部分缩到 16px 不可读） ----------
// 源图 294×103，菱形约占左侧 108px。
const diamondBuf = await sharp(logoPath)
  .extract({ left: 0, top: 0, width: 108, height: 103 })
  .png()
  .toBuffer();

// ---------- favicon：菱形标志居中放在深色底上 ----------
const PAD = 128; // 512 - 2*PAD = 256 内容区
await sharp(diamondBuf)
  .resize(512 - PAD * 2, 512 - PAD * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()
  .then((mark) =>
    sharp({
      create: { width: 512, height: 512, channels: 4, background: { r: 10, g: 10, b: 11, alpha: 1 } },
    })
      .composite([
        {
          input: mark,
          top: PAD,
          left: PAD,
        },
      ])
      .png()
      .toFile(iconOut),
  );
console.log('icon.png written:', iconOut);

// ---------- OG 分享卡片 1200×630 ----------
// 文字用系统字体（Microsoft YaHei / sans-serif），生成后需人工核验 CJK 渲染。
const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0b"/>
      <stop offset="100%" stop-color="#17131f"/>
    </linearGradient>
    <radialGradient id="glow-cyan" cx="85%" cy="15%" r="45%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#00E5FF" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow-purple" cx="10%" cy="90%" r="50%">
      <stop offset="0%" stop-color="#673AB7" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#673AB7" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#673AB7"/>
      <stop offset="100%" stop-color="#00E5FF"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow-cyan)"/>
  <rect width="1200" height="630" fill="url(#glow-purple)"/>

  <!-- 顶部 eyebrow -->
  <text x="100" y="150" font-family="Consolas, monospace" font-size="24" letter-spacing="6" fill="#8b8b94">CHIPSEA ZEPHYR EC · ZEPHYR 3.7 LTS</text>
  <rect x="100" y="176" width="140" height="4" rx="2" fill="url(#accent)"/>

  <!-- 主标题 -->
  <text x="100" y="290" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="76" font-weight="700" fill="#ffffff">换芯片，只改 Device Tree。</text>

  <!-- 副标题 -->
  <text x="100" y="366" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="30" fill="#a0a0aa">同一套应用代码，CSCE250X / CSCE2010 / CSCE2520 之间零修改迁移</text>

  <!-- 模块标签 -->
  <g font-family="Consolas, monospace" font-size="24" fill="#00E5FF">
    <rect x="100" y="424" width="126" height="52" rx="10" fill="#00E5FF" fill-opacity="0.08" stroke="#00E5FF" stroke-opacity="0.35"/>
    <text x="163" y="458" text-anchor="middle">kscan</text>
    <rect x="246" y="424" width="146" height="52" rx="10" fill="#00E5FF" fill-opacity="0.08" stroke="#00E5FF" stroke-opacity="0.35"/>
    <text x="319" y="458" text-anchor="middle">charger</text>
    <rect x="412" y="424" width="136" height="52" rx="10" fill="#00E5FF" fill-opacity="0.08" stroke="#00E5FF" stroke-opacity="0.35"/>
    <text x="480" y="458" text-anchor="middle">thermal</text>
    <rect x="568" y="424" width="136" height="52" rx="10" fill="#00E5FF" fill-opacity="0.08" stroke="#00E5FF" stroke-opacity="0.35"/>
    <text x="636" y="458" text-anchor="middle">pwrseq</text>
  </g>

  <!-- 底部终端行 -->
  <g font-family="Consolas, monospace">
    <rect x="100" y="516" width="780" height="52" rx="10" fill="#161618" stroke="#2a2a2e"/>
    <circle cx="126" cy="542" r="6" fill="#ff5f57"/>
    <circle cx="146" cy="542" r="6" fill="#febc2e"/>
    <circle cx="166" cy="542" r="6" fill="#28c840"/>
    <text x="196" y="550" font-size="20" fill="#9ca3af">$ west build -b csce250x_evb</text>
    <text x="590" y="550" font-size="20" fill="#4ade80">[100%] Built target</text>
  </g>
</svg>`;

// librsvg 在 Windows 下加载不了 SVG 内嵌 <image href="file://">，
// 菱形 logo 用 sharp composite 叠加。
await sharp(Buffer.from(svg))
  .composite([
    {
      input: await sharp(diamondBuf)
        .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer(),
      top: 470,
      left: 1010,
    },
  ])
  .png()
  .toFile(ogOut);
console.log('og.png written:', ogOut);
