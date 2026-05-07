/**
 * Preset extractor — Pasos 2.3 + 2.4
 *
 * Lee `manual-marca.html` y emite un `templates/post-X.html` autónomo
 * por cada preset, con tokens inline + fuentes Fontshare + placeholders
 * `data-slot="key"`. El handle viene hardcodeado (no es slot del back).
 *
 * Paso 2.3 cubre solo `post-tip` como prueba del approach.
 * Paso 2.4 extiende a los 12 restantes.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';

const ROOT      = path.resolve(import.meta.dirname, '..');
const HTML_PATH = path.join(ROOT, 'manual-marca.html');
const OUT_DIR   = path.join(ROOT, 'templates');

const FONTSHARE_HREF =
  'https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&f[]=jetbrains-mono@400,500&display=swap';

const HARDCODED_HANDLE = '@financia.chile';

const TOKENS_START = 'DESIGN TOKENS:START';
const TOKENS_END   = 'DESIGN TOKENS:END';

/* ─────────── helpers de extracción de CSS ─────────── */

async function readManual() {
  return fs.readFile(HTML_PATH, 'utf8');
}

/**
 * Devuelve el CSS crudo (sin parsear) que vive entre los marcadores
 * de design tokens. Incluye los dos bloques `:root` (Capa 1+2 y paleta).
 */
function extractTokensCss(html) {
  const startIdx = html.indexOf(TOKENS_START);
  const endIdx   = html.indexOf(TOKENS_END);
  const cssStart = html.indexOf('*/', startIdx) + 2;
  const cssEnd   = html.lastIndexOf('/*', endIdx);
  return html.slice(cssStart, cssEnd).trim();
}

/**
 * Extrae el CSS de las reglas cuyo selector matchea alguno de los
 * patrones dados. Patrones: regex sobre el selector completo.
 *
 * Mantener orden de aparición en el archivo para no romper cascada.
 */
function extractCssForRules(html, patterns) {
  // Tomar todo el contenido del primer <style> (donde viven las reglas)
  const styleStart = html.indexOf('<style>');
  const styleEnd   = html.indexOf('</style>', styleStart);
  if (styleStart === -1 || styleEnd === -1) {
    throw new Error('No se encontró <style> en el HTML');
  }
  const allCss = html.slice(styleStart + '<style>'.length, styleEnd);

  // Quitar el bloque de tokens — lo inyectamos aparte
  const tokens = extractTokensCss(html);
  const withoutTokens = allCss.replace(tokens, '');

  const root = postcss.parse(withoutTokens);
  const matched = [];

  root.walkRules((rule) => {
    const matches = patterns.some((p) => p.test(rule.selector));
    if (matches) matched.push(rule.toString());
  });

  return matched.join('\n\n');
}

/* ─────────── builder de templates por preset ─────────── */

/**
 * Compone el HTML autónomo de un preset.
 *
 * @param {object} opts
 * @param {string} opts.preset       slug ej: "post-tip"
 * @param {string} opts.tokensCss    bloque :root completo
 * @param {string} opts.presetCss    reglas .ig-post + .post-X*
 * @param {string} opts.bodyMarkup   el `<div class="ig-post post-X">…</div>`
 * @param {string} opts.title        título del <head>
 */
function composeTemplate({ preset, tokensCss, presetCss, bodyMarkup, title }) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${title}</title>
<link href="${FONTSHARE_HREF}" rel="stylesheet">
<style>
/* ───────── design tokens (auto-extraídos de manual-marca.html) ───────── */
${tokensCss}

/* ───────── reset mínimo + viewport ───────── */
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  width: 1080px;
  height: 1080px;
  background: var(--cream);
  font-family: var(--font-display);
  -webkit-font-smoothing: antialiased;
  font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
body {
  display: flex;
  align-items: center;
  justify-content: center;
}
.ig-post { width: 1080px; height: 1080px; border-radius: 0; }

/* ───────── reglas del preset ${preset} ───────── */
${presetCss}
</style>
</head>
<body>
${bodyMarkup}
</body>
</html>
`;
}

/* ─────────── variantes por preset ───────────
 * Cada preset declara axes con values cerrados y un default.
 * Las clases en el markup llevan los defaults: `.post-X--{axis}-{default}`.
 * El back puede emitir el HTML con otras variantes intercambiando esa clase.
 *
 * NOTA: solo `post-tip` tiene CSS de variantes implementado por ahora;
 * los demás declaran el schema pero las clases alternativas son no-ops
 * (mismo render que default) hasta que se sume el CSS preset por preset.
 */

export const PRESET_VARIANTS = {
  'post-tip': {
    theme:  { values: ['brand', 'ink', 'cream'], default: 'brand' },
    layout: { values: ['left', 'center'],        default: 'left' },
  },
  'post-carousel': {
    theme:  { values: ['ink', 'brand'],                            default: 'ink' },
    layout: { values: ['headline-block', 'headline-stack'],        default: 'headline-block' },
  },
  'post-compare': {
    theme:  { values: ['cream', 'ink'],            default: 'cream' },
    layout: { values: ['side-by-side', 'stacked'], default: 'side-by-side' },
  },
  'post-data': {
    theme:  { values: ['bone', 'ink', 'cream'],   default: 'bone' },
    layout: { values: ['num-top', 'num-center'],  default: 'num-top' },
  },
  'post-edu': {
    theme:  { values: ['cream', 'ink', 'brand'],  default: 'cream' },
    layout: { values: ['icon-top', 'icon-side'],  default: 'icon-top' },
  },
  'post-question': {
    theme:  { values: ['brand-pale', 'ink'],          default: 'brand-pale' },
    layout: { values: ['symbol-top', 'symbol-center'], default: 'symbol-top' },
  },
  'post-grid-headline': {
    theme:  { values: ['cream', 'ink'],   default: 'cream' },
    layout: { values: ['left', 'center'], default: 'left' },
  },
  'post-grid-dark': {
    theme:  { values: ['ink'],            default: 'ink' },
    layout: { values: ['left', 'center'], default: 'left' },
  },
  'post-list': {
    theme:  { values: ['bone', 'cream', 'ink'],   default: 'bone' },
    layout: { values: ['numbered', 'bullet'],     default: 'numbered' },
  },
  'post-quote': {
    theme:  { values: ['brand'],                 default: 'brand' },
    layout: { values: ['mark-top', 'mark-side'], default: 'mark-top' },
  },
  'post-checklist': {
    theme:  { values: ['cream', 'ink'],     default: 'cream' },
    layout: { values: ['default', 'dense'], default: 'default' },
  },
  'post-announcement': {
    theme:  { values: ['ink', 'brand'],   default: 'ink' },
    layout: { values: ['left', 'center'], default: 'left' },
  },
  'post-outro': {
    theme:  { values: ['ink', 'brand', 'cream'], default: 'ink' },
    layout: { values: ['stacked', 'split'],      default: 'stacked' },
  },
};

/**
 * Devuelve la lista de clases del root para un preset, con sus variantes
 * default aplicadas. Ej: "ig-post post-tip post-tip--theme-brand post-tip--layout-left".
 */
function rootClasses(preset) {
  const variants = PRESET_VARIANTS[preset] ?? {};
  const out = ['ig-post', preset];
  for (const [axis, { default: def }] of Object.entries(variants)) {
    out.push(`${preset}--${axis}-${def}`);
  }
  return out.join(' ');
}

/* ─────────── markup por preset (con placeholders data-slot) ─────────── */

const PRESET_MARKUP = {
  'post-tip': () => `<div class="${rootClasses('post-tip')}">
  <div class="post-tip-tag" data-slot="tag">TIP DEL DÍA</div>
  <div class="post-tip-headline">
    <span data-slot="headline">Ahorra el 20%</span>
    <em data-slot="headline_em">antes de gastarlo.</em>
  </div>
  <div class="post-tip-foot">
    <span>${HARDCODED_HANDLE}</span>
    <span data-slot="pagination">01 / 01</span>
  </div>
</div>`,

  'post-outro': () => `<div class="${rootClasses('post-outro')}">
  <div class="post-outro-meta">
    <span data-slot="meta_left">// FIN</span>
    <span data-slot="meta_right">2026</span>
  </div>
  <div class="post-outro-stack">
    <span class="brand-wordmark on-dark">Financ<span class="ia">IA</span></span>
    <div class="post-outro-handle">${HARDCODED_HANDLE}</div>
    <div class="post-outro-tagline" data-slot="tagline">Educación financiera · Chile</div>
  </div>
  <span class="post-outro-cta" data-slot="cta">Sígueme →</span>
</div>`,

  'post-announcement': () => `<div class="${rootClasses('post-announcement')}">
  <div class="brand-pixelmark post-corner-mark"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
  <div class="post-announcement-tag" data-slot="tag">NUEVO</div>
  <div class="post-announcement-title">
    <span data-slot="title_pre">Curso gratis:</span><br>
    <span class="brand-accent" data-slot="title_em_1">finanzas</span><br>
    <span class="brand-accent" data-slot="title_em_2">desde cero.</span>
  </div>
  <div class="post-announcement-foot">
    <span class="post-announcement-cta" data-slot="cta">REGÍSTRATE EN BIO →</span>
    <span class="post-announcement-handle">${HARDCODED_HANDLE}</span>
  </div>
</div>`,

  'post-checklist': () => `<div class="${rootClasses('post-checklist')}">
  <div>
    <div class="post-checklist-tag" data-slot="tag">// ANTES DE INVERTIR</div>
    <div class="post-checklist-title" data-slot="title">¿Estás listo?</div>
    <div class="post-checklist-items">
      <div class="post-checklist-item" data-slot="item_1"><div class="checkbox checked"></div><span>Sin deudas con interés &gt;15%</span></div>
      <div class="post-checklist-item" data-slot="item_2"><div class="checkbox checked"></div><span>Fondo de emergencia listo</span></div>
      <div class="post-checklist-item" data-slot="item_3"><div class="checkbox checked"></div><span>Ingreso estable mensual</span></div>
      <div class="post-checklist-item" data-slot="item_4"><div class="checkbox"></div><span>Objetivos a 5+ años definidos</span></div>
      <div class="post-checklist-item" data-slot="item_5"><div class="checkbox"></div><span>Conoces tu tolerancia al riesgo</span></div>
    </div>
  </div>
  <div class="post-checklist-foot">
    <span data-slot="foot_label">CHECKLIST · 03</span>
    <span>${HARDCODED_HANDLE}</span>
  </div>
</div>`,

  'post-quote': () => `<div class="${rootClasses('post-quote')}">
  <div class="brand-pixelmark post-corner-mark"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
  <div class="post-quote-mark" data-slot="mark">"</div>
  <div class="post-quote-text" data-slot="text">
    No ahorres lo que te queda después de gastar. Gasta lo que te queda después de ahorrar.
  </div>
  <div class="post-quote-author">
    <span data-slot="author">— WARREN BUFFETT</span>
    <span>${HARDCODED_HANDLE}</span>
  </div>
</div>`,

  'post-list': () => `<div class="${rootClasses('post-list')}">
  <div>
    <div class="post-list-tag" data-slot="tag">// EN 5 PASOS</div>
    <div class="post-list-title" data-slot="title" style="margin-top: var(--space-2);">Empieza tu fondo de emergencia hoy.</div>
  </div>
  <div class="post-list-items">
    <div class="post-list-item"><div class="post-list-num">1</div><div data-slot="item_1">Calcula 3 meses de gastos esenciales.</div></div>
    <div class="post-list-item"><div class="post-list-num">2</div><div data-slot="item_2">Abre una cuenta separada solo para esto.</div></div>
    <div class="post-list-item"><div class="post-list-num">3</div><div data-slot="item_3">Automatiza un depósito mensual fijo.</div></div>
    <div class="post-list-item"><div class="post-list-num">4</div><div data-slot="item_4">Invierte en algo líquido (CETES, fondos).</div></div>
    <div class="post-list-item"><div class="post-list-num">5</div><div data-slot="item_5">No tocarlo. Para nada que no sea emergencia.</div></div>
  </div>
  <div class="post-list-foot">
    <span data-slot="foot_label">GUÍA · 005</span>
    <span>${HARDCODED_HANDLE}</span>
  </div>
</div>`,

  'post-grid-dark': () => `<div class="${rootClasses('post-grid-dark')}">
  <div class="brand-pixelmark post-corner-mark"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
  <div class="post-grid-dark-tag" data-slot="tag">DATO 2026</div>
  <div>
    <div class="post-grid-dark-stat"><span data-slot="stat_pre">$</span><span class="brand-accent" data-slot="stat_highlight">427K</span></div>
    <div class="post-grid-dark-context" data-slot="context" style="margin-top: var(--space-3);">es lo que pierdes en 30 años por no invertir $200 al mes.</div>
  </div>
  <div class="post-grid-dark-foot">
    <span data-slot="source">FUENTE · CÁLCULO 8% ANUAL</span>
    <span class="handle">${HARDCODED_HANDLE}</span>
  </div>
</div>`,

  'post-grid-headline': () => `<div class="${rootClasses('post-grid-headline')}">
  <div class="post-grid-tag" data-slot="tag">// EDUCACIÓN FINANCIERA</div>
  <div class="post-grid-headline-text">
    <span data-slot="headline_pre">Deja de </span><em data-slot="headline_em">vivir</em><br><span data-slot="headline_post">al día.</span>
  </div>
  <div class="post-grid-foot">
    <span data-slot="post_num">POST 042</span>
    <span>${HARDCODED_HANDLE}</span>
  </div>
</div>`,

  'post-question': () => `<div class="${rootClasses('post-question')}">
  <div class="post-question-symbol" data-slot="symbol">?</div>
  <div class="post-question-text" data-slot="question">¿Cuánto necesitas ahorrar para retirarte sin trabajar?</div>
  <div class="post-question-foot">
    <span data-slot="cta">// RESPONDE EN COMENTARIOS</span>
    <span>${HARDCODED_HANDLE}</span>
  </div>
</div>`,

  'post-edu': () => `<div class="${rootClasses('post-edu')}">
  <div class="post-edu-icon">
    <svg viewBox="0 0 24 24" data-slot="icon_svg"><path d="M3 17l6-6 4 4 8-8M21 7h-5M21 7v5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>
  <div>
    <div class="post-edu-title" data-slot="title">¿Qué es el interés compuesto?</div>
    <div class="post-edu-body" data-slot="body" style="margin-top: var(--space-3);">
      Es cuando los intereses generan más intereses. El dinero crece sobre lo que ya creció.
    </div>
  </div>
  <div class="post-edu-foot">
    <span data-slot="foot_label">CONCEPTO · 01</span>
    <strong>${HARDCODED_HANDLE}</strong>
  </div>
</div>`,

  'post-data': () => `<div class="${rootClasses('post-data')}">
  <div class="brand-pixelmark post-corner-mark"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
  <div class="post-data-tag" data-slot="tag">// DATO INCÓMODO</div>
  <div>
    <div class="post-data-num"><span data-slot="num">73</span><sup data-slot="num_unit">%</sup></div>
    <div class="post-data-context" data-slot="context">de los adultos no podrían cubrir un gasto inesperado de $500 sin endeudarse.</div>
  </div>
  <div class="post-data-foot">
    <span class="post-data-source" data-slot="source">FUENTE · ESTUDIO 2025</span>
    <span class="post-data-handle">${HARDCODED_HANDLE}</span>
  </div>
</div>`,

  'post-compare': () => `<div class="${rootClasses('post-compare')}">
  <div class="post-compare-header" data-slot="header">Ahorrar $5,000/mes durante 30 años</div>
  <div class="post-compare-grid">
    <div class="compare-side compare-bad">
      <div>
        <div class="compare-label" data-slot="bad_label">En la cuenta</div>
        <div class="compare-amount" data-slot="bad_amount">$1.8M</div>
      </div>
      <div class="compare-desc" data-slot="bad_desc">Sin invertir, dinero quieto pierde ante la inflación.</div>
    </div>
    <div class="compare-vs" data-slot="vs">vs</div>
    <div class="compare-side compare-good">
      <div>
        <div class="compare-label" data-slot="good_label">Invertido al 8%</div>
        <div class="compare-amount" data-slot="good_amount">$7.4M</div>
      </div>
      <div class="compare-desc" data-slot="good_desc">Con interés compuesto el dinero trabaja por ti.</div>
    </div>
  </div>
  <div class="post-compare-foot">
    <span>${HARDCODED_HANDLE}</span>
    <span data-slot="foot_tag">· educa · invierte</span>
  </div>
</div>`,

  'post-carousel': () => `<div class="${rootClasses('post-carousel')}">
  <div class="post-carousel-top">
    <span class="post-carousel-num" data-slot="num">// 001</span>
    <span class="post-carousel-swipe" data-slot="swipe">desliza →</span>
  </div>
  <div class="post-carousel-headline"><span data-slot="headline_pre">Cómo invertir </span><span class="hl" data-slot="headline_highlight">$100</span><span data-slot="headline_post"> al mes.</span></div>
  <div class="post-carousel-foot">
    <span class="post-carousel-handle">${HARDCODED_HANDLE}</span>
    <div class="post-carousel-dots" data-slot="dots">
      <span class="is-active"></span><span></span><span></span><span></span><span></span>
    </div>
  </div>
</div>`,
};

/* ─────────── reglas CSS que cada preset necesita ─────────── */

const PRESET_RULES = {
  'post-tip': [
    /^\.ig-post(?:[, >]|$)/,
    /^\.post-tip\b/,
    /^\.post-tip-/,
    /^\.post-tip[-.]/,
  ],
  'post-carousel': [
    /^\.ig-post(?:[, >]|$)/,
    /^\.post-carousel\b/,
    /^\.post-carousel-/,
  ],
  'post-compare': [
    /^\.ig-post(?:[, >]|$)/,
    /^\.post-compare\b/,
    /^\.post-compare-/,
    /^\.compare-/,
  ],
  'post-data': [
    /^\.ig-post(?:[, >]|$)/,
    /^\.post-data\b/,
    /^\.post-data-/,
    /^\.brand-pixelmark\b/,
    /^\.post-corner-mark\b/,
  ],
  'post-edu': [
    /^\.ig-post(?:[, >]|$)/,
    /^\.post-edu\b/,
    /^\.post-edu-/,
  ],
  'post-question': [
    /^\.ig-post(?:[, >]|$)/,
    /^\.post-question\b/,
    /^\.post-question-/,
  ],
  'post-grid-headline': [
    /^\.ig-post(?:[, >]|$)/,
    /^\.post-grid-headline\b/,
    /^\.post-grid-headline-/,
    /^\.post-grid-tag\b/,
    /^\.post-grid-foot\b/,
  ],
  'post-grid-dark': [
    /^\.ig-post(?:[, >]|$)/,
    /^\.post-grid-dark\b/,
    /^\.post-grid-dark-/,
    /^\.brand-pixelmark\b/,
    /^\.post-corner-mark\b/,
  ],
  'post-list': [
    /^\.ig-post(?:[, >]|$)/,
    /^\.post-list\b/,
    /^\.post-list-/,
  ],
  'post-quote': [
    /^\.ig-post(?:[, >]|$)/,
    /^\.post-quote\b/,
    /^\.post-quote-/,
    /^\.brand-pixelmark\b/,
    /^\.post-corner-mark\b/,
  ],
  'post-checklist': [
    /^\.ig-post(?:[, >]|$)/,
    /^\.post-checklist\b/,
    /^\.post-checklist-/,
    /^\.checkbox\b/,
  ],
  'post-announcement': [
    /^\.ig-post(?:[, >]|$)/,
    /^\.post-announcement\b/,
    /^\.post-announcement-/,
    /^\.brand-pixelmark\b/,
    /^\.post-corner-mark\b/,
  ],
  'post-outro': [
    /^\.ig-post(?:[, >]|$)/,
    /^\.post-outro\b/,
    /^\.post-outro-/,
    /^\.brand-wordmark\b/,
  ],
};

/* ─────────── flatten + ajustes específicos por preset ─────────── */

/**
 * El template es un único <div> sin estructura de "tag-key/tag-meta",
 * así que descartamos esas reglas heredadas del demo del manual.
 * Devolvemos el CSS limpio.
 */
function postProcessCss(preset, css) {
  if (preset === 'post-tip') {
    // Las clases tag-key/tag-meta no existen en el template (se colapsaron a un solo slot)
    return css.replace(/\.post-tip-tag \.tag-key,?\s*\.post-tip-tag \.tag-meta\s*\{[^}]*\}\s*/g, '');
  }
  return css;
}

/* ─────────── builder principal por preset ─────────── */

export async function buildPreset(preset) {
  const html       = await readManual();
  const tokensCss  = extractTokensCss(html);

  const rules      = PRESET_RULES[preset];
  if (!rules) throw new Error(`No hay reglas definidas para preset: ${preset}`);
  const presetCss  = postProcessCss(preset, extractCssForRules(html, rules));

  const markup     = PRESET_MARKUP[preset]?.();
  if (!markup) throw new Error(`No hay markup definido para preset: ${preset}`);

  return composeTemplate({
    preset,
    tokensCss,
    presetCss,
    bodyMarkup: markup,
    title: `FinancIA · ${preset}`,
  });
}

export async function writePreset(preset) {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const out  = path.join(OUT_DIR, `${preset}.html`);
  const html = await buildPreset(preset);
  await fs.writeFile(out, html, 'utf8');
  return out;
}

/* ─────────── main ─────────── */

export const PRESET_NAMES = Object.keys(PRESET_MARKUP);

if (import.meta.url === `file://${process.argv[1]}`) {
  const written = [];
  for (const preset of PRESET_NAMES) {
    written.push(await writePreset(preset));
  }
  console.log(`[financia-ds] templates/ escritos:\n  ${written.join('\n  ')}`);
}
