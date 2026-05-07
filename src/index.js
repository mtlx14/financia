/**
 * Orquestador del extractor.
 *
 * Llama (en orden):
 *   1. extractTokens.js   → tokens.json
 *   2. extractPresets.js  → templates/post-*.html
 *   3. buildPresetsJson.js → presets.json
 */

import { extractTokens }   from './extractTokens.js';
import { writePreset, PRESET_NAMES } from './extractPresets.js';
import { writePresetsJson } from './buildPresetsJson.js';

await extractTokens();
console.log(`[financia-ds] tokens.json escrito`);

for (const preset of PRESET_NAMES) {
  const out = await writePreset(preset);
  console.log(`[financia-ds] template     · ${out}`);
}

const presetsJson = await writePresetsJson();
console.log(`[financia-ds] presets.json · ${presetsJson}`);
