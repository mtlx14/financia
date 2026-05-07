# Plan — FinancIA · Design System & Templates

Documento maestro de progreso. Marcar `[x]` lo completado, dejar `[ ]` lo pendiente.

> **Alcance del proyecto:** Fases 1 + 2 (design system + extractor). Render, upload a CDN y publicación en Graph API quedan del lado del **equipo de backend** — ver sección "Handoff al backend" más abajo. Los docs `CLOUDINARY-SETUP.md` e `INSTAGRAM-SETUP.md` se mantienen como referencia para ellos.

---

## Fase 0 — Decisiones previas

- [x] Confirmar tema final → **forest** (verde esmeralda) elegido. Tema único, ya no hay variantes.
- [x] Decidir división de responsabilidades → backend genera contenido + renderiza + publica; nosotros entregamos design system + extractor.
- [ ] Crear cuenta de Instagram Business/Creator vinculada a Página de Facebook (responsabilidad del back · ver `docs/INSTAGRAM-SETUP.md`)

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

## Fase 2 — Extractor + paquete entregable al backend

**Objetivo:** convertir `manual-marca.html` en artefactos consumibles. Cuando esto cierra, taggeamos `v1.0.0` y se lo pasamos al back.

**Decisiones tomadas** (ya en `docs/CONTENT-CONTRACT.md`):
- Sintaxis de placeholders: `data-slot="key"` (mismo patrón que ya usa el manual)
- `handle` hardcodeado en templates (no es slot del back). Si cambia, re-tag del DS.
- Convención: carruseles cierran con `post-outro`.

### Paso 2.1 — Setup del proyecto Node ✅

- [x] `package.json` ESM, scripts `extract` / `extract:tokens` / `extract:presets` / `test` / `validate`
- [x] Deps: `postcss`, `postcss-value-parser`, `cheerio`. Tests con `node:test` builtin (sin extra)
- [x] `.nvmrc` (Node 20+) y `engines` en package.json
- [x] `src/index.js` placeholder (orquestador) + `test/setup.test.js` con 3 tests de sanidad

**Output:** `npm install` corre, `npm test` verde (3/3), `npm run extract` imprime placeholder. Listo para Paso 2.2.

### Paso 2.2 — Token extractor (CSS → tokens.json) ✅

- [x] `src/extractTokens.js` — lee `manual-marca.html`, recorta entre los marcadores `DESIGN TOKENS:START/END`, parsea con PostCSS
- [x] Resuelve `var(--…)` recursivamente para los semánticos (Capa 2 → valores reales)
- [x] Agrupa el output por categoría: `typography`, `color`, `radius`, `space`, `shadow`, `motion`, `pixelmark`, `surface`, `text`
- [x] Coerce numérico para weights (300, 700) y opacidades (0.22)
- [x] 11 tests cubren todas las categorías + resolución de var() recursivo + tipos coercionados

**Output:** `tokens.json` (146 líneas, 9 categorías). Comando: `npm run extract:tokens`. Tests: `npm test` → 14/14 verde.

### Paso 2.3 — Splitter de presets · primer preset (`post-tip`) ✅

- [x] `src/extractPresets.js` con helpers reutilizables (`extractTokensCss`, `extractCssForRules`, `composeTemplate`, `buildPreset`, `writePreset`)
- [x] Markup hand-crafted con `data-slot="tag"`, `data-slot="headline"`, `data-slot="headline_em"`, `data-slot="pagination"`
- [x] Handle hardcodeado a `@financia.chile` (regla del contrato)
- [x] Reglas tag-key/tag-meta legacy filtradas (template usa un único slot `tag`)
- [x] Viewport 1080×1080 fijado en el body
- [x] 9 tests verifican estructura, fuentes, tokens, slots, handle, viewport, overrides 1080
- [x] **Source ahora es 1080-native** — los valores en `.post-tip*` del manual fueron reescritos a px calibrados para 1080 (one-offs marcados). El extractor copia tal cual; no hay overrides. Manual quedará "feo" (post grande en showcase) hasta el TODO de scale wrapper.
- [ ] Verificación visual con el usuario (abrir `templates/post-tip.html` en navegador)

**Output:** `templates/post-tip.html` (~280 líneas, autónomo). Comando: `npm run extract:presets`. Tests: 22/22 verde.

### Paso 2.4 — Splitter · resto de presets

- [ ] Extender el splitter para los 12 restantes:
  carousel, compare, data, edu, question, grid-headline, grid-dark, list, quote, checklist, announcement, outro
- [ ] Cada uno genera su `templates/post-X.html` autónomo
- [ ] Test: cada template renderiza sin errores y contiene los `data-slot` esperados

**Output:** `templates/` con 13 archivos.

### Paso 2.5 — `presets.json` (schema machine-readable)

- [ ] Estructura por preset:
  ```json
  {
    "post-tip": {
      "format": "1080x1080",
      "slots": {
        "tag":         { "type": "string", "required": true,  "example": "● TIP DEL DÍA" },
        "headline":    { "type": "string", "required": true },
        "headline_em": { "type": "string", "required": false },
        "pagination":  { "type": "string", "required": true,  "example": "01 / 01" }
      }
    }
  }
  ```
- [ ] Source de verdad: extraer slots del template generado (los `data-slot="X"`) cruzados con la tabla de tipos en `docs/CONTENT-CONTRACT.md`
- [ ] Validador: todo `data-slot` en un template tiene su entry en `presets.json`, y viceversa

**Output:** `presets.json` en la raíz.

### Paso 2.6 — Validación end-to-end

- [ ] Script `npm run validate` corre en CI:
  - Todos los tokens del HTML aparecen en `tokens.json`
  - Cada `.post-*` definido en el HTML tiene template + entry en `presets.json`
  - Cada `data-slot` en templates tiene entry en `presets.json`
  - JSONs son válidos contra su propio schema
- [ ] Test mínimo: render de cada template con datos de ejemplo (los `example` de `presets.json`) produce un PNG sin errores

**Output:** `npm run validate` verde.

### Paso 2.7 — Handoff

- [ ] README de la raíz actualizado con instrucciones de uso para el back
- [ ] Verificar que `docs/CONTENT-CONTRACT.md` matchee la realidad de los artefactos
- [ ] Tag `v1.0.0` y push
- [ ] Mensaje al equipo de back con el link al tag

**Output:** `v1.0.0` taggeado, repo listo para que el back clone.

---

## Handoff al backend

**Lo que el back recibe del repo (`v1.0.0`):**

| Artefacto | Para qué |
|---|---|
| `templates/post-*.html` (13 archivos) | Plantillas con `data-slot` placeholders, listas para rellenar y renderizar |
| `templates/_base.html` | Wrapper con tokens CSS y fuentes |
| `tokens.json` | Todos los tokens del design system, machine-readable |
| `presets.json` | Schema de slots por preset; el back valida su JSON contra esto |
| `assets/brand/` | Logos / pixelmarks / avatares listos para usar |
| `docs/CONTENT-CONTRACT.md` *(pendiente de escribir)* | Cómo armar el JSON: estructura, ejemplo por preset, reglas de caption/hashtags/schedule |

- [ ] Escribir `docs/CONTENT-CONTRACT.md` con el contrato JSON detallado
- [ ] Tag `v1.0.0` cuando todo lo de Fase 2 esté listo
- [ ] Reunión de handoff con el back

**Lo que el back hace de su lado** (informativo, no es tarea nuestra):

1. Genera el contenido textual → JSON que valida contra `presets.json`
2. Renderiza: Puppeteer (o lo que prefieran) sobre `templates/post-X.html` rellenando los `data-slot`. `deviceScaleFactor: 2` para 1080×1080
3. Sube el PNG resultante a su CDN (Cloudinary u otro · ver `docs/CLOUDINARY-SETUP.md`)
4. Publica con Graph API: container → publish (single post + carrusel + stories) · ver `docs/INSTAGRAM-SETUP.md`
5. Maneja errores, retries, schedule, rate limits

---

## Backlog / ideas

- **TODO · refactor del manual a 1080-native** (pospuesto por el usuario, hacer después de cerrar Fase 2):
  - Hoy el manual está tuneado visualmente para mostrar los posts en un grid pequeño (~400px). Por eso `--text-xl: 44px` se ve bien ahí pero chico en IG real.
  - Solución: subir los px values del source para que sean correctos a 1080, y agregar `transform: scale()` en `.posts-showcase` para que en el manual sigan luciendo chicos.
  - Mientras tanto, los templates inyectan overrides 1080-native via `PRESET_OVERRIDES_1080` en `src/extractPresets.js`. Cuando se rehaga el manual, esos overrides se mueven al manual y el bloque desaparece.
- Generación de variantes A/B (lado back)
- Pipeline desde Notion/Sheets como CMS (lado back)
- Versionado del design system con changelog (lado nuestro)
- Preview tool: cargar un JSON contra `templates/` y renderizar en el navegador antes de publicar (puede vivir acá o del lado back)
