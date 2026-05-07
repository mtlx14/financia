import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractTokens } from '../src/extractTokens.js';

/**
 * Tests del extractor de tokens (Paso 2.2). No escriben a disco
 * — corren `extractTokens({ writeFile: false })` y validan el árbol.
 */

const tokens = await extractTokens({ writeFile: false });

test('emite todas las categorías esperadas', () => {
  for (const cat of ['typography', 'color', 'radius', 'space', 'shadow', 'motion', 'pixelmark', 'surface', 'text']) {
    assert.ok(tokens[cat], `falta categoría: ${cat}`);
  }
});

test('color brand resuelve a verde esmeralda', () => {
  assert.equal(tokens.color.brand.default, '#00E664');
  assert.equal(tokens.color.brand.bright,  '#2EEB80');
  assert.equal(tokens.color.brand['on-brand'], '#FFFFFF');
});

test('neutros del tema forest', () => {
  assert.equal(tokens.color.palette.ink,    '#0C1410');
  assert.equal(tokens.color.palette.cream,  '#F5F7F2');
  assert.equal(tokens.color.palette.bone,   '#ECF0EB');
});

test('tipografía: tamaños primitivos están todos', () => {
  for (const k of ['xxs', 'xs', 'sm', 'md', 'base', 'lg', 'xl', 'display']) {
    assert.ok(tokens.typography.size[k], `falta size: ${k}`);
  }
});

test('var() resuelve recursivamente · semántica → primitivo', () => {
  // --type-body: var(--text-base) → debería resolver a 48px (1080-native)
  assert.equal(tokens.typography.type.body, '48px');
  // --weight-emphasis: var(--weight-bold) → 700 (number)
  assert.equal(tokens.typography.weight.emphasis, 700);
  // --surface-brand: var(--brand) → "#00E664"
  assert.equal(tokens.surface.brand, '#00E664');
  // --text-on-brand: var(--on-brand) → "#FFFFFF"
  assert.equal(tokens.text['on-brand'], '#FFFFFF');
});

test('var() dentro de valor compuesto · shadow-glow', () => {
  // --shadow-glow: 0 0 8px var(--brand) → "0 0 8px #00E664"
  assert.equal(tokens.shadow.glow, '0 0 8px #00E664');
});

test('weights se coercen a number', () => {
  assert.equal(typeof tokens.typography.weight.light, 'number');
  assert.equal(tokens.typography.weight.light, 300);
  assert.equal(tokens.typography.weight.black, 900);
});

test('pixelmark: opacidades como number, tamaños como string con px', () => {
  assert.equal(tokens.pixelmark['opacity-low'],  0.22);
  assert.equal(tokens.pixelmark['opacity-full'], 1);
  assert.equal(tokens.pixelmark.xs, '56px');
  assert.equal(tokens.pixelmark.xl, '380px');
});

test('space: primitivos numerados + tokens semánticos en la misma categoría', () => {
  assert.equal(tokens.space['1'],          '12px');
  assert.equal(tokens.space['25'],         '272px');
  assert.equal(tokens.space['card-pad-y'], '96px');
  assert.equal(tokens.space['section'],    '220px');
});

test('motion conserva los valores raw', () => {
  assert.equal(tokens.motion['ease-out'],  'cubic-bezier(.2,.8,.2,1)');
  assert.equal(tokens.motion['dur-fast'],  '0.2s');
});

test('_meta tiene fecha ISO válida', () => {
  assert.ok(tokens._meta.generatedAt);
  assert.doesNotThrow(() => new Date(tokens._meta.generatedAt).toISOString());
});
