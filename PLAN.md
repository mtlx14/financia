# Plan — Sistema de generación automatizada de posts IG

Documento maestro de progreso. Marcar `[x]` lo completado, dejar `[ ]` lo pendiente.

---

## Fase 0 — Decisiones previas

- [x] Elegir hosting de imágenes → **Cloudinary** (ver `docs/CLOUDINARY-SETUP.md`)
- [x] Confirmar tema final → **forest** (verde esmeralda) elegido. Tema único, ya no hay variantes.
- [ ] Crear cuenta de Instagram Business/Creator vinculada a Página de Facebook (ver `docs/INSTAGRAM-SETUP.md`)
- [ ] Definir origen de contenidos de posts (JSON manual / CMS / LLM) → pendiente

---

## Fase 1 — Design System (en curso)

**Objetivo:** dejar `manual-marca.html` como única fuente de verdad, ordenado y listo para que un extractor lo parsee.

### Estructuración del HTML para extracción

- [x] Marcadores `/* DESIGN TOKENS:START */` y `:END` que delimitan la zona consumible
- [x] Sub-secciones comentadas dentro de `:root` (Tipografía / Semánticos / Constantes / Radii)
- [x] Tokens de **radii** agregados (`--radius-sm/md/lg/pill/full`)
- [x] Eliminado bloque duplicado de `[data-theme="forest"]`
- [x] Cada tema (`lime`, `forest`) declara la misma lista de slots, en el mismo orden, alineados visualmente
- [x] Overrides de componentes específicos por tema quedan **fuera** del bloque tokens

### Pendiente en Fase 1

- [x] **Pase 1** — Capa 1 (primitivos) y Capa 2 (semánticos) agregadas a `:root`
  - Text sizes (`--text-xxs`…`--text-display`)
  - Weights (`--weight-light`…`--weight-black`)
  - Tracking (`--track-tightest`…`--track-widest`)
  - Spacing (`--space-0`…`--space-25`, escala 4px)
  - Shadows (`--shadow-sm/md/lg/glow`)
  - Movimiento (`--ease-out`, `--dur-fast/base/slow`)
  - Semánticos: `--type-*`, `--weight-*` con rol, `--track-*` con rol, `--surface-*`, `--text-*`, `--space-card-*`
- [x] **Pase 2** — Capa 3: clases de packs entre marcadores `PACKS:START` / `PACKS:END`
  - Tipografía: `.type-display`, `.type-headline-lg`, `.type-headline`, `.type-stat`, `.type-body`, `.type-body-sm`, `.type-body-emphasis`, `.type-label-mono`, `.type-label-mono-sm`
  - Superficies: `.surface-card`, `.surface-soft`, `.surface-dark`, `.surface-brand`
  - Stack: `.stack-sm/md/lg`
  - Sombras: `.elevate-sm/md/lg/glow`
- [x] **Pase 3** — Refactorizar `.post-*` para que usen tokens
  - Batch A: `.post-tip`, `.post-carousel`, `.post-data`, `.post-quote`
  - Batch B: `.post-grid-headline`, `.post-grid-dark`, `.post-announcement`
  - Batch C: `.post-compare`, `.post-edu`, `.post-question`, `.post-list`
  - Batch D: `.post-type-card`, `.post-frame`, `.post-label`, `.post-checklist`, `.checkbox`
- [x] **Pase 4** — Filosofía "closed system + presets" adoptada
  - One-offs marcados con `/* one-off */` en el HTML (informativo)
  - Documentado en `docs/DESIGN-SYSTEM.md`: la IA elige presets, no inventa valores
- [x] **Pase 5** — Menú de los 12 presets documentado en `docs/DESIGN-SYSTEM.md` (cada uno con sus slots y ejemplos)
- [ ] **Pase 6** — Afinar estilos / tipografía (ajustes visuales finales antes de cerrar Fase 1)
- [x] **Pase 6.1** — Integración del kit de marca FinancIA
  - Assets copiados a `assets/brand/` (svg, png-marks, avatars-instagram) + `docs/BRAND-KIT.md`
  - Tokens `--pixelmark-opacity-low/mid/full` agregados a Capa 1
  - Packs `.brand-pixelmark` y `.brand-wordmark` agregados (CSS-only, sin SVG inline)
  - Nav y sección Logo del manual usan los nuevos componentes
  - Regla "wordmark + pixelmark nunca juntos" documentada en el manual
- [x] Tema único: forest. Eliminados bloques `[data-theme="lime"]` y `[data-theme="forest"]`, atributo `data-theme` del `<html>`, dev fab + panel + JS de switcher
- [x] Variables renombradas: `--lime*` → `--brand*`, `--on-lime` → `--on-brand`. Clases también: `.lime` → `.brand-accent`, `.badge-lime` → `.badge-brand`, `.logo-tile-lime` → `.logo-tile-brand`, `.sw-lime-*` → `.sw-brand-*`, `.pattern-gradient-lime` → `.pattern-gradient-brand`
- [ ] Actualizar `docs/DESIGN-SYSTEM.md` con la lista final de tokens

---

## Fase 2 — Extractor de tokens

- [ ] `src/tokenExtractor.js` — parsea CSS vars de `:root` con PostCSS
- [ ] Genera `tokens.json` con: colores, tipografía, radios, espaciados, sombras, semánticos
- [ ] Tests básicos contra el HTML de marca

---

## Fase 3 — Renderizador

- [ ] `src/renderer.js` — Puppeteer, viewport fijo, deviceScaleFactor 2
- [ ] `src/templates/_base.html` — inyecta tokens como CSS vars + fuentes Fontshare
- [ ] Template square 1080×1080 (ej: post-quote)
- [ ] Template vertical 1080×1350 (ej: post-tip)
- [ ] Template story 1080×1920
- [ ] Template carrusel multi-slide

---

## Fase 4 — Hosting + Publicación

- [ ] `src/uploader.js` — Cloudinary upload, devuelve URL pública
- [ ] `src/instagramPublisher.js` — Graph API (container → publish)
- [ ] Soporte single post + carrusel
- [ ] Manejo de errores y reintentos

---

## Fase 5 — Orquestación

- [ ] `src/index.js` — flujo end-to-end: contenido → render → upload → publish
- [ ] CLI o config para elegir formato/template
- [ ] `README.md` con setup completo

---

## Backlog / ideas

- Generación de variantes A/B
- Programación con cron
- Pipeline desde Notion/Sheets como CMS
