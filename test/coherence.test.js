/**
 * Paso 2.6 · Validación de coherencia end-to-end.
 *
 * Verifica que las 3 fuentes (manual-marca.html, templates/, presets.json)
 * estén alineadas. Asume que el extractor ya corrió (npm run extract).
 */

import { test }   from 'node:test';
import assert      from 'node:assert/strict';
import fs          from 'node:fs/promises';
import path        from 'node:path';
import * as cheerio from 'cheerio';
import { PRESET_NAMES }      from '../src/extractPresets.js';
import { buildPresetsJson }  from '../src/buildPresetsJson.js';
import { extractTokens }     from '../src/extractTokens.js';

const ROOT     = path.resolve(import.meta.dirname, '..');
const HTML     = await fs.readFile(path.join(ROOT, 'manual-marca.html'), 'utf8');
const TPL_DIR  = path.join(ROOT, 'templates');
const presets  = await buildPresetsJson();
const tokens   = await extractTokens({ writeFile: false });

const PRESET_LIST = PRESET_NAMES;

test('coherence: PRESET_NAMES tiene los 13 presets aprobados', () => {
  assert.equal(PRESET_LIST.length, 13);
});

test('coherence: cada preset tiene su template en disco', async () => {
  for (const preset of PRESET_LIST) {
    const file = path.join(TPL_DIR, `${preset}.html`);
    await fs.access(file);
  }
});

test('coherence: cada preset definido en HTML tiene entry en presets.json', () => {
  for (const preset of PRESET_LIST) {
    assert.ok(presets[preset], `falta entry en presets.json: ${preset}`);
  }
});

test('coherence: presets.json no tiene entries sobrantes (todos están en PRESET_NAMES)', () => {
  const inJson = Object.keys(presets).filter((k) => k !== '_meta');
  for (const preset of inJson) {
    assert.ok(PRESET_LIST.includes(preset), `entry sobrante en presets.json: ${preset}`);
  }
});

test('coherence: cada data-slot del template tiene entry en presets.json', async () => {
  for (const preset of PRESET_LIST) {
    const html  = await fs.readFile(path.join(TPL_DIR, `${preset}.html`), 'utf8');
    const $     = cheerio.load(html);
    const slots = new Set();
    $('[data-slot]').each((_, el) => slots.add($(el).attr('data-slot')));

    const entrySlots = new Set(Object.keys(presets[preset].slots));
    for (const s of slots) {
      assert.ok(entrySlots.has(s), `template ${preset}: slot "${s}" no está en presets.json`);
    }
    for (const s of entrySlots) {
      assert.ok(slots.has(s), `presets.json ${preset}: slot "${s}" no está en el template`);
    }
  }
});

test('coherence: cada preset aprobado existe como selector raíz en el manual', () => {
  for (const preset of PRESET_LIST) {
    // El selector raíz aparece como ".post-X {" (con espacios opcionales)
    const re = new RegExp(`^\\.${preset}\\s*\\{`, 'm');
    assert.match(HTML, re, `preset ${preset} no encontrado como selector raíz en el manual`);
  }
});

test('coherence: tokens.json categoriza los 9 grupos esperados', () => {
  const expected = ['typography', 'color', 'radius', 'space', 'shadow', 'motion', 'pixelmark', 'surface', 'text'];
  for (const cat of expected) {
    assert.ok(tokens[cat], `falta categoría en tokens.json: ${cat}`);
  }
});

test('coherence: presets.json _meta.count matchea cantidad real', () => {
  const real = Object.keys(presets).filter((k) => k !== '_meta').length;
  assert.equal(presets._meta.count, real);
});
