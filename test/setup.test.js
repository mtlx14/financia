import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Tests del setup (Paso 2.1). Verifican que la estructura del proyecto
 * está bien formada antes de empezar a implementar el extractor.
 */

const root = path.resolve(import.meta.dirname, '..');

test('manual-marca.html existe en la raíz', () => {
  assert.ok(fs.existsSync(path.join(root, 'manual-marca.html')));
});

test('package.json es ESM y declara las deps esperadas', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.type, 'module');
  for (const dep of ['cheerio', 'postcss', 'postcss-value-parser']) {
    assert.ok(pkg.dependencies?.[dep], `falta dep: ${dep}`);
  }
});

test('src/ existe', () => {
  assert.ok(fs.existsSync(path.join(root, 'src')));
});
