/**
 * Token extractor — Paso 2.2
 *
 * Lee `manual-marca.html`, recorta el bloque entre los marcadores
 * `DESIGN TOKENS:START` / `:END`, parsea con PostCSS, resuelve los
 * `var(--…)` recursivamente y emite `tokens.json` agrupado por categoría.
 *
 * Los nombres de las categorías y la forma del JSON son el contrato
 * machine-readable que consume el equipo de backend.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

const ROOT          = path.resolve(import.meta.dirname, '..');
const HTML_PATH     = path.join(ROOT, 'manual-marca.html');
const OUTPUT_PATH   = path.join(ROOT, 'tokens.json');
const START_MARKER  = 'DESIGN TOKENS:START';
const END_MARKER    = 'DESIGN TOKENS:END';

/* ─────── 1. cortar el bloque de tokens del HTML ─────── */

function extractCssBlock(html) {
  const startIdx = html.indexOf(START_MARKER);
  const endIdx   = html.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`No se encontraron marcadores ${START_MARKER}/${END_MARKER} en el HTML`);
  }
  // Saltar el cierre del comentario que contiene START_MARKER, y cortar
  // antes de la apertura del comentario que contiene END_MARKER, para
  // no devolver comentarios sin cerrar al parser.
  const cssStart = html.indexOf('*/', startIdx) + 2;
  const cssEnd   = html.lastIndexOf('/*', endIdx);
  return html.slice(cssStart, cssEnd);
}

/* ─────── 2. extraer todas las CSS vars de los :root ─────── */

function collectCssVars(css) {
  const root = postcss.parse(css);
  const raw  = new Map();   // name (--foo) → valor crudo

  root.walkRules((rule) => {
    if (rule.selector !== ':root') return;
    rule.walkDecls(/^--/, (decl) => {
      raw.set(decl.prop, decl.value.trim());
    });
  });

  return raw;
}

/* ─────── 3. resolver var(--…) recursivamente ─────── */

function resolveValue(rawValue, allVars, seen = new Set()) {
  const parsed = valueParser(rawValue);

  parsed.walk((node) => {
    if (node.type !== 'function' || node.value !== 'var') return false;

    const ref = node.nodes.find((n) => n.type === 'word')?.value;
    if (!ref) return false;

    if (seen.has(ref)) {
      throw new Error(`Ciclo de resolución detectado en ${ref}`);
    }
    if (!allVars.has(ref)) {
      // var() con fallback, o ref no declarada — dejar como string
      return false;
    }

    const resolved = resolveValue(allVars.get(ref), allVars, new Set([...seen, ref]));
    // Reemplazar el nodo function por su valor resuelto
    node.type    = 'word';
    node.value   = resolved;
    node.nodes   = undefined;
    return false; // no descender ya que reemplazamos
  });

  return valueParser.stringify(parsed).trim();
}

/* ─────── 4. clasificar cada token en una categoría ─────── */

const COLOR_NEUTRALS = ['ink', 'charcoal', 'graphite', 'stone', 'mist', 'bone', 'cream', 'white'];
const COLOR_SEMANTIC = ['positive', 'negative', 'warning'];

function categorize(name) {
  const n = name.replace(/^--/, '');

  if (n.startsWith('font-'))    return ['typography', 'family',   n.slice(5)];
  if (/^text-(xxs|xs|sm|md|base|lg|xl|display)$/.test(n)) return ['typography', 'size', n.slice(5)];
  if (n.startsWith('text-'))    return ['text',       null,        n.slice(5)];
  if (n.startsWith('type-'))    return ['typography', 'type',      n.slice(5)];
  if (n.startsWith('weight-'))  return ['typography', 'weight',    n.slice(7)];
  if (n.startsWith('track-'))   return ['typography', 'tracking',  n.slice(6)];
  if (n.startsWith('radius-'))  return ['radius',     null,        n.slice(7)];
  if (n.startsWith('space-'))   return ['space',      null,        n.slice(6)];
  if (n.startsWith('shadow-'))  return ['shadow',     null,        n.slice(7)];
  if (/^(ease|dur)-/.test(n))   return ['motion',     null,        n];
  if (n.startsWith('pixelmark-')) return ['pixelmark', null,       n.slice(10)];
  if (n.startsWith('surface-')) return ['surface',    null,        n.slice(8)];

  if (n === 'brand' || n === 'on-brand' || n.startsWith('brand-')) {
    const key = n === 'brand' ? 'default' : (n === 'on-brand' ? 'on-brand' : n.slice(6));
    return ['color', 'brand', key];
  }
  if (COLOR_NEUTRALS.includes(n))  return ['color', 'palette',  n];
  if (COLOR_SEMANTIC.includes(n))  return ['color', 'semantic', n];

  return ['misc', null, n];
}

/* ─────── 5. coerce numéricos donde corresponde ─────── */

function coerceValue(category, subcategory, value) {
  if (category === 'typography' && subcategory === 'weight') {
    const n = Number(value);
    return Number.isFinite(n) ? n : value;
  }
  if (category === 'pixelmark' && /^opacity-/.test(`${subcategory ?? ''}-${value}`)) {
    // not used — opacities ya tienen subcategoría null y coerce se hace abajo
  }
  if (category === 'pixelmark') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return value;
}

/* ─────── 6. armar el JSON agrupado ─────── */

function buildTokens(rawVars) {
  const out = {
    _meta: {
      source:      'manual-marca.html',
      generatedAt: new Date().toISOString(),
    },
  };

  // Resolver todos los valores primero
  const resolved = new Map();
  for (const [name, value] of rawVars) {
    resolved.set(name, resolveValue(value, rawVars));
  }

  // Clasificar y poblar el árbol
  for (const [name, value] of resolved) {
    const [cat, sub, key] = categorize(name);
    const coerced = coerceValue(cat, sub, value);

    if (sub) {
      out[cat]              ??= {};
      out[cat][sub]         ??= {};
      out[cat][sub][key]    = coerced;
    } else {
      out[cat]      ??= {};
      out[cat][key] = coerced;
    }
  }

  return out;
}

/* ─────── 7. main ─────── */

export async function extractTokens({ writeFile = true } = {}) {
  const html   = await fs.readFile(HTML_PATH, 'utf8');
  const css    = extractCssBlock(html);
  const raw    = collectCssVars(css);
  const tokens = buildTokens(raw);

  if (writeFile) {
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(tokens, null, 2) + '\n', 'utf8');
  }
  return tokens;
}

// Ejecutar si se invoca directo
if (import.meta.url === `file://${process.argv[1]}`) {
  const tokens = await extractTokens();
  const count  = Object.keys(tokens).filter((k) => !k.startsWith('_')).length;
  console.log(`[financia-ds] tokens.json escrito · ${count} categorías`);
}
