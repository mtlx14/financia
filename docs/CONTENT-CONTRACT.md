# Content Contract · FinancIA Design System

> Este documento es el **contrato de integración** entre el design system de FinancIA y el sistema que genera y publica los posts en Instagram. Está pensado para el equipo de backend que va a consumir los templates.

**Versión del design system:** `v1.0.0` (a taggear cuando cierre Fase 2)

**Repo:** https://github.com/mtlx14/financia

---

## TL;DR · cómo funciona en 4 pasos

```
[su pipeline de contenido]
        ↓ produce un JSON que matchea presets.json
[fillSlots(template.html, json.slots)]
        ↓
[Puppeteer: HTML → PNG 2160×2160 (deviceScaleFactor 2)]
        ↓ upload
[CDN público (Cloudinary u otro)]
        ↓ URL
[Graph API: container → publish]
        ↓
🟢 Post en @financia.chile
```

---

## Lo que reciben

Al clonar el repo en el tag `v1.0.0`:

```
financia/
├── templates/                ← uno por preset (13 archivos)
│   ├── post-tip.html
│   ├── post-data.html
│   ├── post-quote.html
│   ├── post-carousel.html
│   ├── post-compare.html
│   ├── post-edu.html
│   ├── post-question.html
│   ├── post-grid-headline.html
│   ├── post-grid-dark.html
│   ├── post-list.html
│   ├── post-checklist.html
│   ├── post-announcement.html
│   └── post-outro.html
├── tokens.json               ← todos los tokens del design system
├── presets.json              ← schema machine-readable de slots por preset
├── assets/brand/             ← logos PNG/SVG, avatares de IG
└── docs/
    ├── CONTENT-CONTRACT.md   ← este archivo
    ├── CLOUDINARY-SETUP.md   ← referencia para el upload
    └── INSTAGRAM-SETUP.md    ← referencia para Graph API
```

Cada `templates/post-X.html` es **autónomo**: trae sus tokens CSS inlined, las fuentes (Fontshare CDN), y los placeholders `data-slot="…"`. Renderizan en cualquier Puppeteer sin dependencias adicionales.

El `handle` (`@financia.chile`) ya viene **hardcodeado** en los templates — no es un slot. Si cambia, se re-taggea el design system.

---

## Estructura del JSON que producen

Cada post se describe con un JSON que valida contra `presets.json`. El campo `variant` es opcional — si se omite, se aplican los defaults declarados por el preset.

### Single post

```json
{
  "preset": "post-tip",
  "variant": { "theme": "ink", "layout": "left" },
  "slots": {
    "tag": "TIP DEL DÍA",
    "headline": "Ahorra el 20%",
    "headline_em": "antes de gastarlo.",
    "pagination": "01 / 01"
  },
  "caption": "Una regla simple para empezar a ahorrar sin pensarlo dos veces.\n\nEl truco: automatizá la transferencia el mismo día que recibís tu sueldo.",
  "hashtags": ["#educacionfinanciera", "#ahorro", "#financiapersonal"],
  "schedule_at": "2026-05-08T10:00:00-04:00"
}
```

### Carrusel (múltiples slides)

```json
{
  "preset": "carousel",
  "slides": [
    { "preset": "post-carousel",
      "variant": { "theme": "ink" },
      "slots": {
        "num": "// 001", "swipe": "desliza →",
        "headline_pre": "Cómo invertir ", "headline_highlight": "$100", "headline_post": " al mes.",
        "dots": "<span class='is-active'></span><span></span><span></span><span></span>"
      } },
    { "preset": "post-data",
      "slots": {
        "tag": "// PASO 1", "num": "20", "num_unit": "%",
        "context": "Ese es el porcentaje mínimo a destinar a inversión.",
        "source": "FUENTE · BCH 2025"
      } },
    { "preset": "post-list",
      "slots": {
        "tag": "// EN 5 PASOS", "title": "¿Cómo empezar?",
        "item_1": "Calcula gastos", "item_2": "Abre cuenta", "item_3": "Automatiza",
        "item_4": "Diversifica", "item_5": "No tocar nada",
        "foot_label": "GUÍA · 005"
      } },
    { "preset": "post-outro",
      "slots": {
        "meta_left": "// FIN", "meta_right": "2026",
        "tagline": "Educación financiera · Chile", "cta": "Sígueme →"
      } }
  ],
  "caption": "Hilo: primeros pasos para invertir desde cero…",
  "hashtags": ["#inversion", "#chile"]
}
```

**Convención:** cuando un carrusel termina, el último slide debe ser `post-outro` para presencia de marca.

### Reglas de captions y hashtags

- `caption`: máx 2200 caracteres (límite de IG). Saltos de línea con `\n`.
- `hashtags`: array. El sistema los concatena al final del caption con espacio. Máx 30 por post (límite IG).
- `schedule_at`: ISO 8601 con timezone. Si está omitido, publica inmediatamente.

---

## Los 13 presets

**Fuente única de verdad:** `presets.json` describe machine-readable cada preset con sus slots y variants. La tabla siguiente es resumen humano — para nombres exactos, types y ejemplos de cada slot, leer `presets.json`.

| Preset | Para qué | # slots | Notas |
|---|---|---:|---|
| `post-tip` | Tip rápido | 4 | Headline grande con `<em>` opcional (`headline_em`) |
| `post-carousel` | Portada de carrusel | 6 | Headline en 3 partes: `headline_pre` + `headline_highlight` + `headline_post` |
| `post-compare` | Comparativa | 9 | Dos paneles flat: `bad_label/amount/desc`, `good_label/amount/desc`, `vs`, `header`, `foot_tag` |
| `post-data` | Stat / dato | 5 | `num` + `num_unit` (sup) + `context` + `source` + `tag` |
| `post-edu` | Concepto + icono | 4 | `icon_svg` recibe HTML (path SVG raw) — no string |
| `post-question` | Engagement | 3 | Símbolo gigante + pregunta + CTA |
| `post-grid-headline` | Headline + grid | 5 | Headline en 3 partes con `<em>` central |
| `post-grid-dark` | Stat dark | 5 | `stat_pre` + `stat_highlight` (color brand) |
| `post-list` | Lista numerada | 8 | 5 items fijos: `item_1`...`item_5` |
| `post-quote` | Cita | 3 | `mark` (`"`) + `text` + `author` |
| `post-checklist` | Checklist | 8 | 5 items fijos: el back genera el HTML del item entero (`<div class="checkbox">...</div><span>...</span>`) |
| `post-announcement` | Anuncio | 5 | Pill con dot CSS + título de 3 líneas |
| `post-outro` | Cierre / brand | 4 | Wordmark + handle hardcoded; slots: `meta_left/right`, `tagline`, `cta` |

### Reglas globales sobre slots

- **Todos los slots son `string`** salvo `post-edu.icon_svg` que es `html` (path SVG raw, sin escapar).
- **Todos son required** en v1.0.0. No hay slots opcionales — si un preset tiene slot, el back lo llena.
- **`handle` (`@financia.chile`)** está hardcoded en cada template, no es slot.
- **Slots con HTML en el default** (ej. `post-carousel.dots`): el back puede pasar HTML raw; el renderer no escapa esos slots. La marca de cuáles aceptan HTML está en `presets.json` con `type: "html"`.

---

## Variantes

Cada preset declara axes (`theme`, `layout`) con valores cerrados. La IA elige un valor por axis (no inventa) o usa el default.

Ejemplo de `post-tip` en `presets.json`:

```json
"variants": {
  "theme":  { "values": ["brand", "ink", "cream"], "default": "brand" },
  "layout": { "values": ["left", "center"],         "default": "left" }
}
```

En el JSON del back: `"variant": { "theme": "ink", "layout": "left" }`. El campo es opcional — si se omite, se aplican defaults.

### Cómo se aplican al template

Son clases CSS en el root del `.ig-post`. El template viene con las clases default; el renderer del back las swappea antes del screenshot:

```html
<!-- Default -->
<div class="ig-post post-tip post-tip--theme-brand post-tip--layout-left">

<!-- Con variant theme=ink -->
<div class="ig-post post-tip post-tip--theme-ink post-tip--layout-left">
```

### Estado en v1.0.0 — implementación parcial

Solo `post-tip` tiene CSS de variantes implementado. Los otros 12 presets declaran el schema en `presets.json` (para que el back pueda validar/probar) pero **todas sus variantes alternativas son no-ops visuales** — renderizan idéntico al default. Se completarán en `v1.x.0` (minor, compatible).

Para cada preset, el set de axes/values declarado está en `presets.json[preset].variants`. Las combinaciones que ya pintan distinto:

| Preset | Variantes con CSS implementado |
|---|---|
| `post-tip` | `theme`: brand, ink, cream · `layout`: left, center |
| Otros 12 | (declaradas en schema, no implementadas en CSS · v1.x) |

---

## Cómo decidir preset + variant

**Patrón recomendado: la IA elige todo.** Una sola llamada al LLM con el menú de presets/variants como contexto; el modelo devuelve el JSON `{preset, variant, slots, caption, hashtags}`. El back valida contra `presets.json` y renderiza.

### Por qué este patrón

- El back no inventa diseño — solo valida y renderiza.
- La IA tiene contexto del propósito de cada preset y elige el que mejor matchea el contenido.
- `presets.json` es el contrato — si se suman presets/variantes en `v1.x.0`, el menú se actualiza solo regenerando el system prompt.

### System prompt sugerido

El back arma el prompt programáticamente leyendo `presets.json`. Boilerplate:

```
Sos editor de contenido para @financia.chile (educación financiera, español Chile).

PRESETS DISPONIBLES (elegí UNO por post):
- post-tip: Tip rápido. Headline grande con énfasis opcional.
- post-carousel: Portada de carrusel. Headline con palabra resaltada en brand.
- post-compare: Comparativa lado-a-lado (bad vs good).
- post-data: Dato impactante. Número gigante + contexto + fuente.
- post-edu: Concepto + icono. Pregunta-respuesta corta.
- post-question: Engagement. Símbolo gigante + pregunta + CTA.
- post-grid-headline: Headline grande sobre fondo cream con grid.
- post-grid-dark: Stat oscuro. Card oscura con stat resaltado en brand.
- post-list: 5 pasos numerados.
- post-quote: Cita de autoridad financiera.
- post-checklist: Checklist (5 items, marcables como done o pending).
- post-announcement: Anuncio. Pill destacado + título de 3 líneas + CTA.
- post-outro: Cierre / presencia de marca. Para cerrar carruseles.

VARIANTES POR PRESET (elegí o usá default):
- post-tip:        theme=brand|ink|cream      layout=left|center
- post-carousel:   theme=ink|brand            layout=headline-block|headline-stack
- post-compare:    theme=cream|ink            layout=side-by-side|stacked
- post-data:       theme=bone|ink|cream       layout=num-top|num-center
- post-edu:        theme=cream|ink|brand      layout=icon-top|icon-side
- post-question:   theme=brand-pale|ink       layout=symbol-top|symbol-center
- post-grid-headline: theme=cream|ink         layout=left|center
- post-grid-dark:  theme=ink                  layout=left|center
- post-list:       theme=bone|cream|ink       layout=numbered|bullet
- post-quote:      theme=brand                layout=mark-top|mark-side
- post-checklist:  theme=cream|ink            layout=default|dense
- post-announcement: theme=ink|brand          layout=left|center
- post-outro:      theme=ink|brand|cream      layout=stacked|split

REGLAS:
- Carruseles SIEMPRE cierran con post-outro.
- Carruseles entre 2 y 10 slides.
- Caption máx 2200 chars; hashtags máx 30.
- Para slots de cada preset, mirá `presets.json` (te paso ese JSON aparte).
- No incluyas el handle (@financia.chile) en ningún slot — viene hardcoded.
- No repitas el mismo `theme` en 3 posts consecutivos del feed (rotación visual).

DEVOLVÉ JSON exacto con shape:
{
  "preset": "...",
  "variant": { "theme": "...", "layout": "..." },
  "slots":   { ... slot strings ... },
  "caption": "...",
  "hashtags": ["#..."]
}
(omitir "variant" usa los defaults del preset)
```

### Validación post-LLM

El JSON devuelto por la IA puede tener errores (slot faltante, variant inválido). El back valida ANTES de renderizar:

```js
function validate(payload, presetsJson) {
  const def = presetsJson[payload.preset];
  if (!def) throw new Error(`preset ${payload.preset} no existe`);

  // Slots requeridos
  for (const name of Object.keys(def.slots)) {
    if (!payload.slots?.[name]) throw new Error(`falta slot ${name}`);
  }

  // Variantes válidas
  for (const [axis, value] of Object.entries(payload.variant ?? {})) {
    const spec = def.variants[axis];
    if (!spec) throw new Error(`variant axis ${axis} no existe en ${payload.preset}`);
    if (!spec.values.includes(value)) {
      throw new Error(`variant ${axis}=${value} no está en [${spec.values.join(',')}]`);
    }
  }
}
```

Si falla: re-prompt al LLM con el error o caer al default. El back decide el flujo de retry.

### Alternativas (no recomendadas, solo si la opción A no aplica)

- **Pipeline humano:** una persona o sheet decide preset/variant. Predecible, no escala.
- **Híbrido:** humano define idea + tono, LLM elige preset, algoritmo elige variant con reglas de rotación. Más complejo de mantener.

---

## Render pipeline

**Resumen de los 4 pasos:**

1. **Llenar el template** — abrir `templates/post-X.html`, reemplazar los `data-slot="key"` con los valores del JSON.
2. **Render a PNG** — Puppeteer (o equivalente) abre el HTML, espera fuentes, screenshot 1080×1080 con `deviceScaleFactor: 2`.
3. **Upload al CDN** — el PNG va a una URL pública HTTPS (Cloudinary u otro).
4. **Publicar con Graph API** — crear container con `image_url` + `caption`, después publish. Carruseles encadenan child-containers.

Detalle de cada paso abajo.

### 1. Llenar el template

Dos pasos: aplicar variantes (swap de clases en el root) y llenar slots (reemplazar inner text de cada `data-slot`).

```js
import fs      from 'node:fs/promises';
import presets from './presets.json' with { type: 'json' };

async function fillTemplate({ preset, variant = {}, slots }) {
  let html = await fs.readFile(`templates/${preset}.html`, 'utf8');

  // 1. Variantes: swap clases default por las elegidas.
  for (const [axis, value] of Object.entries(variant)) {
    const def = presets[preset].variants[axis].default;
    html = html.replaceAll(
      `${preset}--${axis}-${def}`,
      `${preset}--${axis}-${value}`,
    );
  }

  // 2. Slots: reemplazar inner text de cada data-slot.
  //    Para slots con type "html" (ej. post-edu.icon_svg) NO escapar.
  for (const [name, value] of Object.entries(slots)) {
    const slotType = presets[preset].slots[name]?.type ?? 'string';
    const safe = slotType === 'html' ? value : escapeHtml(value);
    html = html.replace(
      new RegExp(`(data-slot="${name}"[^>]*>)[^<]*`),
      `$1${safe}`,
    );
  }

  return html;
}
```

### 2. Render con Puppeteer

```js
import puppeteer from 'puppeteer';

async function renderPost(html) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0' }); // espera fuentes
  const png = await page.screenshot({ type: 'png', omitBackground: false });
  await browser.close();
  return png;  // Buffer
}
```

**Notas:**
- `deviceScaleFactor: 2` produce 2160×2160 (calidad para IG)
- `waitUntil: 'networkidle0'` asegura que las fuentes Fontshare carguen antes del screenshot
- Stories: viewport 1080×1920
- Carrusel: render slide por slide, cada uno produce un PNG

### 3. Upload al CDN

Graph API requiere URL pública HTTPS. Detalle en `docs/CLOUDINARY-SETUP.md`.

### 4. Publicar con Graph API

Detalle en `docs/INSTAGRAM-SETUP.md`. Resumen del flujo:

```
Single post:
  POST /{ig-user-id}/media       { image_url, caption } → creation_id
  POST /{ig-user-id}/media_publish { creation_id }       → published

Carrusel:
  Por cada slide: POST /media { image_url, is_carousel_item: true } → child_id
  POST /media { media_type: "CAROUSEL", children: [child_ids], caption } → creation_id
  POST /media_publish { creation_id }
```

---

## Validación

Antes de renderizar/publicar, validar el JSON contra `presets.json`:

- **`preset`** debe existir en la lista de los 13.
- **`slots`** debe contener todas las keys que el preset declara (todos son required en v1.0.0).
- **Tipos**: la mayoría es `string`. Solo `post-edu.icon_svg` es `html` (path SVG raw).
- **`variant`** (opcional): cada axis debe matchear `presets.json[preset].variants[axis].values`. Si falta un axis, se usa su default.
- **Carrusel**: al menos 2 slides, máximo 10 (límite IG). Recomendado cerrar con `post-outro`.

Recomendado: librería como Ajv para validar contra el JSON Schema de `presets.json`.

---

## Versionado

El design system sigue **semver**:
- **Patch** (`v1.0.x`): bugs visuales, ajustes menores. No rompen contratos.
- **Minor** (`v1.x.0`): nuevos presets, nuevos slots opcionales. Compatibles hacia atrás.
- **Major** (`v2.0.0`): renombre de slots, presets eliminados, cambios incompatibles.

Fijar la versión en su lock (`package.json`, submodule, lo que usen) y actualizar a propósito.

---

## Contacto / dudas

- Issues técnicos del design system: GitHub issues en el repo
- Cambios al contrato: requiere alineación con quien mantiene el design system antes de implementar
- Cuenta IG `@financia.chile`: Business/Creator vinculada a página de FB (setup en `docs/INSTAGRAM-SETUP.md`)
