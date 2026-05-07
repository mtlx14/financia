import { test } from 'node:test';
import assert    from 'node:assert/strict';
import { buildPresetsJson } from '../src/buildPresetsJson.js';

const json = await buildPresetsJson();

test('presets.json: _meta presente con count 13', () => {
  assert.ok(json._meta);
  assert.equal(json._meta.count, 13);
  assert.equal(json._meta.format, '1080x1080');
  assert.match(json._meta.generatedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('presets.json: los 13 presets aprobados están presentes', () => {
  const expected = [
    'post-tip', 'post-carousel', 'post-compare', 'post-data', 'post-edu',
    'post-question', 'post-grid-headline', 'post-grid-dark', 'post-list',
    'post-quote', 'post-checklist', 'post-announcement', 'post-outro',
  ];
  for (const p of expected) {
    assert.ok(json[p], `falta ${p}`);
    assert.equal(json[p].format, '1080x1080');
    assert.ok(json[p].slots);
  }
});

test('presets.json: cada slot tiene type, required y example', () => {
  for (const [preset, def] of Object.entries(json)) {
    if (preset === '_meta') continue;
    for (const [name, slot] of Object.entries(def.slots)) {
      assert.ok(slot.type,                `${preset}.${name} sin type`);
      assert.equal(typeof slot.required, 'boolean', `${preset}.${name} required no es boolean`);
      assert.ok('example' in slot,        `${preset}.${name} sin example`);
    }
  }
});

test('presets.json: slots de post-tip matchean los del template', () => {
  const slots = Object.keys(json['post-tip'].slots);
  assert.deepEqual(slots.sort(), ['headline', 'headline_em', 'pagination', 'tag'].sort());
  assert.equal(json['post-tip'].slots.tag.example, 'TIP DEL DÍA');
});

test('presets.json: slots de post-compare incluyen los 9 esperados', () => {
  const slots = Object.keys(json['post-compare'].slots).sort();
  const expected = ['header', 'bad_label', 'bad_amount', 'bad_desc', 'vs',
                    'good_label', 'good_amount', 'good_desc', 'foot_tag'].sort();
  assert.deepEqual(slots, expected);
});

test('presets.json: post-edu.icon_svg override aplicado (type html)', () => {
  const slot = json['post-edu'].slots.icon_svg;
  assert.equal(slot.type, 'html');
  assert.match(slot.example, /^<path/);
});

test('presets.json: post-list tiene 5 slots de items + tag + title + foot_label', () => {
  const slots = Object.keys(json['post-list'].slots).sort();
  const expected = ['tag', 'title', 'item_1', 'item_2', 'item_3', 'item_4', 'item_5', 'foot_label'].sort();
  assert.deepEqual(slots, expected);
});

/* ─────────── variants ─────────── */

test('presets.json: cada preset tiene bloque variants con axes válidos', () => {
  for (const [preset, def] of Object.entries(json)) {
    if (preset === '_meta') continue;
    assert.ok(def.variants, `${preset}: falta bloque variants`);
    for (const [axis, spec] of Object.entries(def.variants)) {
      assert.ok(Array.isArray(spec.values),         `${preset}.${axis}: values no es array`);
      assert.ok(spec.values.length >= 1,             `${preset}.${axis}: values vacío`);
      assert.ok(spec.default,                        `${preset}.${axis}: falta default`);
      assert.ok(spec.values.includes(spec.default),  `${preset}.${axis}: default no está en values`);
    }
  }
});

test('presets.json: post-tip declara theme + layout con los valores propuestos', () => {
  const v = json['post-tip'].variants;
  assert.deepEqual(v.theme.values.sort(),  ['brand', 'cream', 'ink']);
  assert.equal(v.theme.default, 'brand');
  assert.deepEqual(v.layout.values.sort(), ['center', 'left']);
  assert.equal(v.layout.default, 'left');
});
