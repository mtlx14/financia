/**
 * Paso 2.5 · presets.json
 *
 * Recorre los HTML en `templates/` y emite `presets.json` con el schema
 * de slots por preset. Source de verdad: los `data-slot="X"` del template
 * (escrito por el extractor en Paso 2.4).
 *
 * Cada slot se infiere como { type: "string", required: true, example }.
 * El `example` viene del inner text del elemento. Si en el futuro hay
 * slots opcionales o de otro tipo, se sobrescribe vía SLOT_OVERRIDES.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { PRESET_VARIANTS } from './extractPresets.js';

const ROOT     = path.resolve(import.meta.dirname, '..');
const TPL_DIR  = path.join(ROOT, 'templates');
const OUT_FILE = path.join(ROOT, 'presets.json');

const FORMAT = '1080x1080';

/**
 * Overrides puntuales por preset/slot. Útil si un slot necesita
 * otro tipo (ej. URL) o ser opcional. Vacío por ahora.
 */
const SLOT_OVERRIDES = {
  'post-edu': {
    icon_svg: {
      type:    'html',
      example: '<path d="M3 17l6-6 4 4 8-8M21 7h-5M21 7v5" stroke-linecap="round" stroke-linejoin="round"/>',
    },
  },
};

async function listTemplates() {
  const entries = await fs.readdir(TPL_DIR);
  return entries
    .filter((f) => f.startsWith('post-') && f.endsWith('.html'))
    .map((f) => f.replace(/\.html$/, ''))
    .sort();
}

async function buildSlotsForPreset(preset) {
  const html = await fs.readFile(path.join(TPL_DIR, `${preset}.html`), 'utf8');
  const $    = cheerio.load(html);

  const slots = {};
  $('[data-slot]').each((_, el) => {
    const name    = $(el).attr('data-slot');
    const example = $(el).text().trim().replace(/\s+/g, ' ');

    const override = SLOT_OVERRIDES[preset]?.[name] ?? {};
    slots[name] = {
      type:     'string',
      required: true,
      example,
      ...override,
    };
  });

  return slots;
}

export async function buildPresetsJson() {
  const presets = await listTemplates();
  const out = {
    _meta: {
      generatedAt: new Date().toISOString(),
      source:      'templates/post-*.html (data-slot attributes)',
      format:      FORMAT,
      count:       presets.length,
    },
  };

  for (const preset of presets) {
    out[preset] = {
      format:   FORMAT,
      variants: PRESET_VARIANTS[preset] ?? {},
      slots:    await buildSlotsForPreset(preset),
    };
  }

  return out;
}

export async function writePresetsJson() {
  const json = await buildPresetsJson();
  await fs.writeFile(OUT_FILE, JSON.stringify(json, null, 2) + '\n', 'utf8');
  return OUT_FILE;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = await writePresetsJson();
  const json = await buildPresetsJson();
  const count = Object.keys(json).filter((k) => k !== '_meta').length;
  console.log(`[financia-ds] presets.json escrito · ${count} presets · ${out}`);
}
