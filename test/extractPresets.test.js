import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPreset } from '../src/extractPresets.js';

/**
 * Tests del extractor de presets (Paso 2.3 + 2.4).
 * Por ahora cubren post-tip; se extienden cuando se sumen los demás.
 */

const tipHtml      = await buildPreset('post-tip');
const carouselHtml = await buildPreset('post-carousel');
const compareHtml  = await buildPreset('post-compare');
const dataHtml     = await buildPreset('post-data');
const eduHtml      = await buildPreset('post-edu');
const questionHtml = await buildPreset('post-question');
const gridHlHtml   = await buildPreset('post-grid-headline');
const gridDkHtml   = await buildPreset('post-grid-dark');
const listHtml     = await buildPreset('post-list');
const quoteHtml    = await buildPreset('post-quote');
const checklistHtml= await buildPreset('post-checklist');
const announceHtml = await buildPreset('post-announcement');
const outroHtml    = await buildPreset('post-outro');

test('post-tip: doctype y estructura básica', () => {
  assert.match(tipHtml, /^<!doctype html>/i);
  assert.match(tipHtml, /<html lang="es">/);
  assert.match(tipHtml, /<title>FinancIA · post-tip<\/title>/);
});

test('post-tip: incluye fuentes Fontshare', () => {
  assert.match(tipHtml, /api\.fontshare\.com\/v2\/css/);
  assert.match(tipHtml, /satoshi@/);
  assert.match(tipHtml, /jetbrains-mono@/);
});

test('post-tip: tokens en :root presentes', () => {
  assert.match(tipHtml, /--brand:\s*#00E664/);
  assert.match(tipHtml, /--ink:\s*#0C1410/);
  assert.match(tipHtml, /--type-body:\s*var\(--text-base\)/);
});

test('post-tip: reglas CSS del preset', () => {
  assert.match(tipHtml, /^\.ig-post\s*\{/m);
  assert.match(tipHtml, /^\.post-tip\s*\{/m);
  assert.match(tipHtml, /^\.post-tip-headline\s*\{/m);
  assert.match(tipHtml, /^\.post-tip-foot\s*\{/m);
});

test('post-tip: data-slot placeholders presentes', () => {
  assert.match(tipHtml, /data-slot="tag"/);
  assert.match(tipHtml, /data-slot="headline"/);
  assert.match(tipHtml, /data-slot="headline_em"/);
  assert.match(tipHtml, /data-slot="pagination"/);
});

test('post-tip: handle hardcodeado a @financia.chile', () => {
  assert.match(tipHtml, /@financia\.chile/);
  assert.doesNotMatch(tipHtml, /data-brand="handle"/);
});

test('post-tip: no incluye reglas legacy de tag-key/tag-meta', () => {
  assert.doesNotMatch(tipHtml, /\.tag-key/);
  assert.doesNotMatch(tipHtml, /\.tag-meta/);
});

test('post-tip: viewport 1080×1080 fijado', () => {
  assert.match(tipHtml, /width:\s*1080px/);
  assert.match(tipHtml, /height:\s*1080px/);
});

test('post-tip: valores 1080-native heredados del manual', () => {
  // Los px crudos vienen directamente del .post-tip* del manual, ya
  // reescrito a 1080-native. No hay overrides en el extractor.
  assert.match(tipHtml, /\.post-tip-headline\s*\{[\s\S]*?font-size:\s*120px/);
  assert.match(tipHtml, /\.post-tip-tag\s*\{[\s\S]*?font-size:\s*30px/);
  assert.match(tipHtml, /\.post-tip-foot\s*\{[\s\S]*?font-size:\s*28px/);
  assert.match(tipHtml, /\.post-tip\s*\{[\s\S]*?padding:\s*100px 88px/);
});

/* ─────────── post-carousel ─────────── */

test('post-carousel: doctype y estructura básica', () => {
  assert.match(carouselHtml, /^<!doctype html>/i);
  assert.match(carouselHtml, /<title>FinancIA · post-carousel<\/title>/);
});

test('post-carousel: tokens y fuentes', () => {
  assert.match(carouselHtml, /api\.fontshare\.com\/v2\/css/);
  assert.match(carouselHtml, /--brand:\s*#00E664/);
  assert.match(carouselHtml, /--ink:\s*#0C1410/);
});

test('post-carousel: reglas CSS del preset', () => {
  assert.match(carouselHtml, /^\.ig-post\s*\{/m);
  assert.match(carouselHtml, /^\.post-carousel\s*\{/m);
  assert.match(carouselHtml, /^\.post-carousel::before\s*\{/m);
  assert.match(carouselHtml, /^\.post-carousel-top\s*\{/m);
  assert.match(carouselHtml, /^\.post-carousel-headline\s*\{/m);
  assert.match(carouselHtml, /^\.post-carousel-foot\s*\{/m);
  assert.match(carouselHtml, /^\.post-carousel-dots\s*\{/m);
});

test('post-carousel: data-slot placeholders presentes', () => {
  assert.match(carouselHtml, /data-slot="num"/);
  assert.match(carouselHtml, /data-slot="swipe"/);
  assert.match(carouselHtml, /data-slot="headline_pre"/);
  assert.match(carouselHtml, /data-slot="headline_highlight"/);
  assert.match(carouselHtml, /data-slot="headline_post"/);
  assert.match(carouselHtml, /data-slot="dots"/);
});

test('post-carousel: handle hardcodeado a @financia.chile', () => {
  assert.match(carouselHtml, /@financia\.chile/);
  assert.doesNotMatch(carouselHtml, /data-brand="handle"/);
});

test('post-carousel: viewport 1080×1080 fijado', () => {
  assert.match(carouselHtml, /width:\s*1080px/);
  assert.match(carouselHtml, /height:\s*1080px/);
});

test('post-carousel: valores 1080-native heredados del manual', () => {
  assert.match(carouselHtml, /\.post-carousel\s*\{[\s\S]*?padding:\s*100px 88px/);
  assert.match(carouselHtml, /\.post-carousel-headline\s*\{[\s\S]*?font-size:\s*140px/);
  assert.match(carouselHtml, /\.post-carousel-num\s*\{[\s\S]*?font-size:\s*30px/);
  assert.match(carouselHtml, /\.post-carousel-handle\s*\{[\s\S]*?font-size:\s*38px/);
});

/* ─────────── post-compare ─────────── */

test('post-compare: doctype y estructura básica', () => {
  assert.match(compareHtml, /^<!doctype html>/i);
  assert.match(compareHtml, /<title>FinancIA · post-compare<\/title>/);
});

test('post-compare: reglas CSS del preset', () => {
  assert.match(compareHtml, /^\.ig-post\s*\{/m);
  assert.match(compareHtml, /^\.post-compare\s*\{/m);
  assert.match(compareHtml, /^\.post-compare-header\s*\{/m);
  assert.match(compareHtml, /^\.post-compare-grid\s*\{/m);
  assert.match(compareHtml, /^\.compare-side\s*\{/m);
  assert.match(compareHtml, /^\.compare-vs\s*\{/m);
  assert.match(compareHtml, /^\.post-compare-foot\s*\{/m);
});

test('post-compare: data-slot placeholders presentes', () => {
  for (const slot of ['header', 'bad_label', 'bad_amount', 'bad_desc', 'vs', 'good_label', 'good_amount', 'good_desc', 'foot_tag']) {
    assert.match(compareHtml, new RegExp(`data-slot="${slot}"`));
  }
});

test('post-compare: handle hardcodeado a @financia.chile', () => {
  assert.match(compareHtml, /@financia\.chile/);
  assert.doesNotMatch(compareHtml, /data-brand="handle"/);
});

test('post-compare: viewport 1080×1080 fijado', () => {
  assert.match(compareHtml, /width:\s*1080px/);
  assert.match(compareHtml, /height:\s*1080px/);
});

test('post-compare: incluye overrides forest (compare-good color, compare-vs color)', () => {
  assert.match(compareHtml, /\.compare-good\s*\{[^}]*color:\s*var\(--brand-soft\)/);
  assert.match(compareHtml, /\.compare-vs\s*\{[^}]*color:\s*var\(--white\)/);
});

/* ─────────── post-data ─────────── */

test('post-data: doctype y estructura básica', () => {
  assert.match(dataHtml, /^<!doctype html>/i);
  assert.match(dataHtml, /<title>FinancIA · post-data<\/title>/);
});

test('post-data: reglas CSS del preset', () => {
  assert.match(dataHtml, /^\.ig-post\s*\{/m);
  assert.match(dataHtml, /^\.post-data\s*\{/m);
  assert.match(dataHtml, /^\.post-data-tag\s*\{/m);
  assert.match(dataHtml, /^\.post-data-num\s*\{/m);
  assert.match(dataHtml, /^\.post-data-num sup\s*\{/m);
  assert.match(dataHtml, /^\.post-data-context\s*\{/m);
  assert.match(dataHtml, /^\.post-data-foot\s*\{/m);
  assert.match(dataHtml, /^\.brand-pixelmark\s*\{/m);
});

test('post-data: data-slot placeholders presentes', () => {
  for (const slot of ['tag', 'num', 'num_unit', 'context', 'source']) {
    assert.match(dataHtml, new RegExp(`data-slot="${slot}"`));
  }
});

test('post-data: handle hardcodeado a @financia.chile', () => {
  assert.match(dataHtml, /@financia\.chile/);
  assert.doesNotMatch(dataHtml, /data-brand="handle"/);
});

test('post-data: viewport 1080×1080 fijado', () => {
  assert.match(dataHtml, /width:\s*1080px/);
  assert.match(dataHtml, /height:\s*1080px/);
});

test('post-data: valores 1080-native heredados del manual', () => {
  assert.match(dataHtml, /\.post-data-num\s*\{[\s\S]*?font-size:\s*320px/);
  assert.match(dataHtml, /\.post-data-num sup\s*\{[\s\S]*?font-size:\s*96px/);
  assert.match(dataHtml, /\.post-data-context\s*\{[\s\S]*?font-size:\s*44px/);
});

/* ─────────── post-edu ─────────── */

test('post-edu: doctype y título', () => {
  assert.match(eduHtml, /^<!doctype html>/i);
  assert.match(eduHtml, /<title>FinancIA · post-edu<\/title>/);
});

test('post-edu: reglas CSS del preset', () => {
  assert.match(eduHtml, /^\.post-edu\s*\{/m);
  assert.match(eduHtml, /^\.post-edu-icon\s*\{/m);
  assert.match(eduHtml, /^\.post-edu-title\s*\{/m);
  assert.match(eduHtml, /^\.post-edu-body\s*\{/m);
  assert.match(eduHtml, /^\.post-edu-foot\s*\{/m);
});

test('post-edu: data-slot placeholders presentes', () => {
  for (const slot of ['icon_svg', 'title', 'body', 'foot_label']) {
    assert.match(eduHtml, new RegExp(`data-slot="${slot}"`));
  }
});

test('post-edu: handle hardcodeado', () => {
  assert.match(eduHtml, /@financia\.chile/);
  assert.doesNotMatch(eduHtml, /data-brand="handle"/);
});

test('post-edu: viewport 1080×1080', () => {
  assert.match(eduHtml, /width:\s*1080px/);
  assert.match(eduHtml, /height:\s*1080px/);
});

test('post-edu: one-offs reescalados a 1080-native', () => {
  assert.match(eduHtml, /\.post-edu-icon\s*\{[\s\S]*?width:\s*176px/);
  assert.match(eduHtml, /\.post-edu-icon svg\s*\{[\s\S]*?width:\s*88px/);
});

/* ─────────── post-question ─────────── */

test('post-question: doctype y título', () => {
  assert.match(questionHtml, /<title>FinancIA · post-question<\/title>/);
});

test('post-question: reglas CSS del preset', () => {
  assert.match(questionHtml, /^\.post-question\s*\{/m);
  assert.match(questionHtml, /^\.post-question-symbol\s*\{/m);
  assert.match(questionHtml, /^\.post-question-text\s*\{/m);
  assert.match(questionHtml, /^\.post-question-foot\s*\{/m);
});

test('post-question: data-slot placeholders presentes', () => {
  for (const slot of ['symbol', 'question', 'cta']) {
    assert.match(questionHtml, new RegExp(`data-slot="${slot}"`));
  }
});

test('post-question: handle hardcodeado', () => {
  assert.match(questionHtml, /@financia\.chile/);
  assert.doesNotMatch(questionHtml, /data-brand="handle"/);
});

test('post-question: one-offs reescalados', () => {
  assert.match(questionHtml, /\.post-question-symbol\s*\{[\s\S]*?font-size:\s*380px/);
  assert.match(questionHtml, /\.post-question-text\s*\{[\s\S]*?font-size:\s*72px/);
});

/* ─────────── post-grid-headline ─────────── */

test('post-grid-headline: doctype y título', () => {
  assert.match(gridHlHtml, /<title>FinancIA · post-grid-headline<\/title>/);
});

test('post-grid-headline: reglas CSS del preset', () => {
  assert.match(gridHlHtml, /^\.post-grid-headline\s*\{/m);
  assert.match(gridHlHtml, /^\.post-grid-headline::before\s*\{/m);
  assert.match(gridHlHtml, /^\.post-grid-tag\s*\{/m);
  assert.match(gridHlHtml, /^\.post-grid-headline-text\s*\{/m);
  assert.match(gridHlHtml, /^\.post-grid-foot\s*\{/m);
});

test('post-grid-headline: data-slot placeholders presentes', () => {
  for (const slot of ['tag', 'headline_pre', 'headline_em', 'headline_post', 'post_num']) {
    assert.match(gridHlHtml, new RegExp(`data-slot="${slot}"`));
  }
});

test('post-grid-headline: handle hardcodeado', () => {
  assert.match(gridHlHtml, /@financia\.chile/);
  assert.doesNotMatch(gridHlHtml, /data-brand="handle"/);
});

test('post-grid-headline: one-offs reescalados', () => {
  assert.match(gridHlHtml, /\.post-grid-headline-text\s*\{[\s\S]*?font-size:\s*130px/);
  assert.match(gridHlHtml, /\.post-grid-headline\s*\{[\s\S]*?background-size:\s*108px 108px/);
});

/* ─────────── post-grid-dark ─────────── */

test('post-grid-dark: doctype y título', () => {
  assert.match(gridDkHtml, /<title>FinancIA · post-grid-dark<\/title>/);
});

test('post-grid-dark: reglas CSS del preset', () => {
  assert.match(gridDkHtml, /^\.post-grid-dark\s*\{/m);
  assert.match(gridDkHtml, /^\.post-grid-dark-tag\s*\{/m);
  assert.match(gridDkHtml, /^\.post-grid-dark-stat\s*\{/m);
  assert.match(gridDkHtml, /^\.post-grid-dark-context\s*\{/m);
  assert.match(gridDkHtml, /^\.post-grid-dark-foot\s*\{/m);
  assert.match(gridDkHtml, /^\.brand-pixelmark\s*\{/m);
});

test('post-grid-dark: data-slot placeholders presentes', () => {
  for (const slot of ['tag', 'stat_pre', 'stat_highlight', 'context', 'source']) {
    assert.match(gridDkHtml, new RegExp(`data-slot="${slot}"`));
  }
});

test('post-grid-dark: handle hardcodeado', () => {
  assert.match(gridDkHtml, /@financia\.chile/);
  assert.doesNotMatch(gridDkHtml, /data-brand="handle"/);
});

test('post-grid-dark: one-offs reescalados', () => {
  assert.match(gridDkHtml, /\.post-grid-dark-stat\s*\{[\s\S]*?font-size:\s*260px/);
  assert.match(gridDkHtml, /\.post-grid-dark-context\s*\{[\s\S]*?font-size:\s*40px/);
  assert.match(gridDkHtml, /\.post-grid-dark\s*\{[\s\S]*?background-size:\s*108px 108px/);
});

/* ─────────── post-list ─────────── */

test('post-list: doctype y título', () => {
  assert.match(listHtml, /<title>FinancIA · post-list<\/title>/);
});

test('post-list: reglas CSS del preset', () => {
  assert.match(listHtml, /^\.post-list\s*\{/m);
  assert.match(listHtml, /^\.post-list-tag\s*\{/m);
  assert.match(listHtml, /^\.post-list-title\s*\{/m);
  assert.match(listHtml, /^\.post-list-items\s*\{/m);
  assert.match(listHtml, /^\.post-list-item\s*\{/m);
  assert.match(listHtml, /^\.post-list-num\s*\{/m);
  assert.match(listHtml, /^\.post-list-foot\s*\{/m);
});

test('post-list: 5 slots de items + tag + title + foot_label', () => {
  for (const slot of ['tag', 'title', 'item_1', 'item_2', 'item_3', 'item_4', 'item_5', 'foot_label']) {
    assert.match(listHtml, new RegExp(`data-slot="${slot}"`));
  }
});

test('post-list: handle hardcodeado', () => {
  assert.match(listHtml, /@financia\.chile/);
  assert.doesNotMatch(listHtml, /data-brand="handle"/);
});

test('post-list: one-offs reescalados', () => {
  assert.match(listHtml, /\.post-list-num\s*\{[\s\S]*?font-size:\s*32px/);
  assert.match(listHtml, /\.post-list-num\s*\{[\s\S]*?width:\s*64px/);
  assert.match(listHtml, /\.post-list-item\s*\{[\s\S]*?grid-template-columns:\s*76px 1fr/);
});

/* ─────────── post-quote ─────────── */

test('post-quote: doctype y título', () => {
  assert.match(quoteHtml, /<title>FinancIA · post-quote<\/title>/);
});

test('post-quote: reglas CSS del preset', () => {
  assert.match(quoteHtml, /^\.post-quote\s*\{/m);
  assert.match(quoteHtml, /^\.post-quote-mark\s*\{/m);
  assert.match(quoteHtml, /^\.post-quote-text\s*\{/m);
  assert.match(quoteHtml, /^\.post-quote-author\s*\{/m);
  assert.match(quoteHtml, /^\.brand-pixelmark\s*\{/m);
});

test('post-quote: data-slot placeholders presentes', () => {
  for (const slot of ['mark', 'text', 'author']) {
    assert.match(quoteHtml, new RegExp(`data-slot="${slot}"`));
  }
});

test('post-quote: handle hardcodeado', () => {
  assert.match(quoteHtml, /@financia\.chile/);
  assert.doesNotMatch(quoteHtml, /data-brand="handle"/);
});

test('post-quote: one-offs reescalados', () => {
  assert.match(quoteHtml, /\.post-quote-mark\s*\{[\s\S]*?font-size:\s*280px/);
  assert.match(quoteHtml, /\.post-quote-text\s*\{[\s\S]*?font-size:\s*72px/);
  assert.match(quoteHtml, /\.post-quote\s*\{[\s\S]*?background-size:\s*88px 88px/);
});

test('post-quote: incluye override forest (color blanco)', () => {
  // .post-quote { color: var(--white); }  (línea ~761 del manual)
  assert.match(quoteHtml, /\.post-quote\s*\{[^}]*color:\s*var\(--white\)/);
});

/* ─────────── post-checklist ─────────── */

test('post-checklist: doctype y título', () => {
  assert.match(checklistHtml, /<title>FinancIA · post-checklist<\/title>/);
});

test('post-checklist: reglas CSS del preset', () => {
  assert.match(checklistHtml, /^\.post-checklist\s*\{/m);
  assert.match(checklistHtml, /^\.post-checklist-tag\s*\{/m);
  assert.match(checklistHtml, /^\.post-checklist-title\s*\{/m);
  assert.match(checklistHtml, /^\.post-checklist-items\s*\{/m);
  assert.match(checklistHtml, /^\.post-checklist-item\s*\{/m);
  assert.match(checklistHtml, /^\.checkbox\s*\{/m);
  assert.match(checklistHtml, /^\.checkbox\.checked\s*\{/m);
  assert.match(checklistHtml, /^\.post-checklist-foot\s*\{/m);
});

test('post-checklist: 5 items + tag + title + foot_label', () => {
  for (const slot of ['tag', 'title', 'item_1', 'item_2', 'item_3', 'item_4', 'item_5', 'foot_label']) {
    assert.match(checklistHtml, new RegExp(`data-slot="${slot}"`));
  }
});

test('post-checklist: handle hardcodeado', () => {
  assert.match(checklistHtml, /@financia\.chile/);
  assert.doesNotMatch(checklistHtml, /data-brand="handle"/);
});

test('post-checklist: one-offs reescalados', () => {
  assert.match(checklistHtml, /\.post-checklist-title\s*\{[\s\S]*?font-size:\s*88px/);
  assert.match(checklistHtml, /\.post-checklist-item\s*\{[\s\S]*?font-size:\s*40px/);
  assert.match(checklistHtml, /\.checkbox\s*\{[\s\S]*?width:\s*60px/);
});

/* ─────────── post-announcement ─────────── */

test('post-announcement: doctype y título', () => {
  assert.match(announceHtml, /<title>FinancIA · post-announcement<\/title>/);
});

test('post-announcement: reglas CSS del preset', () => {
  assert.match(announceHtml, /^\.post-announcement\s*\{/m);
  assert.match(announceHtml, /^\.post-announcement::after\s*\{/m);
  assert.match(announceHtml, /^\.post-announcement-tag\s*\{/m);
  assert.match(announceHtml, /^\.post-announcement-title\s*\{/m);
  assert.match(announceHtml, /^\.post-announcement-cta\s*\{/m);
  assert.match(announceHtml, /^\.post-announcement-handle\s*\{/m);
  assert.match(announceHtml, /^\.brand-pixelmark\s*\{/m);
});

test('post-announcement: data-slot placeholders presentes', () => {
  for (const slot of ['tag', 'title_pre', 'title_em_1', 'title_em_2', 'cta']) {
    assert.match(announceHtml, new RegExp(`data-slot="${slot}"`));
  }
});

test('post-announcement: handle hardcodeado', () => {
  assert.match(announceHtml, /@financia\.chile/);
  assert.doesNotMatch(announceHtml, /data-brand="handle"/);
});

test('post-announcement: one-offs reescalados', () => {
  assert.match(announceHtml, /\.post-announcement\s*\{[\s\S]*?background-size:\s*108px 108px/);
  assert.match(announceHtml, /\.post-announcement-tag\s*\{[\s\S]*?padding:\s*16px 32px/);
});

/* ─────────── post-outro ─────────── */

test('post-outro: doctype y título', () => {
  assert.match(outroHtml, /<title>FinancIA · post-outro<\/title>/);
});

test('post-outro: reglas CSS del preset', () => {
  assert.match(outroHtml, /^\.post-outro\s*\{/m);
  assert.match(outroHtml, /^\.post-outro::before\s*\{/m);
  assert.match(outroHtml, /^\.post-outro-meta\s*\{/m);
  assert.match(outroHtml, /^\.post-outro-stack\s*\{/m);
  assert.match(outroHtml, /^\.post-outro-handle\s*\{/m);
  assert.match(outroHtml, /^\.post-outro-tagline\s*\{/m);
  assert.match(outroHtml, /^\.post-outro-cta\s*\{/m);
  assert.match(outroHtml, /^\.brand-wordmark\s*\{/m);
});

test('post-outro: data-slot placeholders presentes', () => {
  for (const slot of ['meta_left', 'meta_right', 'tagline', 'cta']) {
    assert.match(outroHtml, new RegExp(`data-slot="${slot}"`));
  }
});

test('post-outro: handle hardcodeado y wordmark presente', () => {
  assert.match(outroHtml, /@financia\.chile/);
  assert.doesNotMatch(outroHtml, /data-brand="handle"/);
  assert.match(outroHtml, /class="brand-wordmark on-dark"/);
});

test('post-outro: viewport 1080×1080', () => {
  assert.match(outroHtml, /width:\s*1080px/);
  assert.match(outroHtml, /height:\s*1080px/);
});
