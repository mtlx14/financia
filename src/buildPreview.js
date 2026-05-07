/**
 * Tooling de validación visual: genera `templates/_preview-<preset>.html`
 * con TODAS las combinaciones de variantes (axis × axis) en una sola página.
 *
 * Útil para validar a ojo cómo se ven las variantes nuevas antes de cerrar
 * el preset. No forma parte del entregable al back.
 *
 *   node src/buildPreview.js post-tip
 */

import fs   from 'node:fs/promises';
import path from 'node:path';
import { buildPreset, PRESET_VARIANTS } from './extractPresets.js';

const ROOT    = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'templates');

function cartesian(axes) {
  const keys = Object.keys(axes);
  if (keys.length === 0) return [{}];
  return keys.reduce(
    (acc, key) => acc.flatMap((a) => axes[key].values.map((v) => ({ ...a, [key]: v }))),
    [{}],
  );
}

function applyVariant(html, preset, combo) {
  // Reemplaza las clases default --axis-{default} por --axis-{combo[axis]}
  const variants = PRESET_VARIANTS[preset];
  let out = html;
  for (const [axis, val] of Object.entries(combo)) {
    const def = variants[axis].default;
    out = out.replaceAll(
      `${preset}--${axis}-${def}`,
      `${preset}--${axis}-${val}`,
    );
  }
  return out;
}

export async function buildPreview(preset) {
  const variants = PRESET_VARIANTS[preset];
  if (!variants) throw new Error(`No hay variants para preset: ${preset}`);

  const baseHtml = await buildPreset(preset);
  const headEnd  = baseHtml.indexOf('</head>');
  const bodyStart = baseHtml.indexOf('<body>') + '<body>'.length;
  const bodyEnd   = baseHtml.indexOf('</body>');
  const head      = baseHtml.slice(0, headEnd);
  const bodyMarkup = baseHtml.slice(bodyStart, bodyEnd).trim();

  const combos = cartesian(variants);
  const cards  = combos.map((combo) => {
    const label = Object.entries(combo).map(([k, v]) => `${k}=${v}`).join(' · ');
    const variant = applyVariant(bodyMarkup, preset, combo);
    return `<section class="preview-card">
  <header>${label}</header>
  <div class="preview-frame">${variant}</div>
</section>`;
  }).join('\n');

  // El body de cada preset está pensado para 1080×1080 a tamaño real.
  // Acá los achicamos via transform:scale para que entren en la página.
  const previewCss = `
body { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; padding: 32px; background: #1a1d1c; align-items: start; justify-content: center; }
.preview-card { background: #0c1410; border-radius: 12px; padding: 16px; color: #fff; font-family: var(--font-mono); display: flex; flex-direction: column; gap: 12px; }
.preview-card header { font-size: 14px; color: #999; letter-spacing: 0.05em; text-transform: uppercase; }
.preview-frame { width: 540px; height: 540px; overflow: hidden; border-radius: 8px; }
.preview-frame .ig-post { transform: scale(0.5); transform-origin: top left; flex-shrink: 0; }
`;

  return `${head}
<style>${previewCss}</style>
</head>
<body>
${cards}
</body>
</html>`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const preset = process.argv[2];
  if (!preset) {
    console.error('uso: node src/buildPreview.js <preset>');
    process.exit(1);
  }
  const html = await buildPreview(preset);
  const out = path.join(OUT_DIR, `_preview-${preset}.html`);
  await fs.writeFile(out, html, 'utf8');
  console.log(`[financia-ds] preview escrito · ${out}`);
}
