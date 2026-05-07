# Proyecto · FinancIA — Sistema de generación automatizada de posts IG

> **Marca:** FinancIA (educación financiera). El nombre lleva la "IA" final destacada en `--brand` (verde esmeralda) — ver `assets/brand/` y `docs/BRAND-KIT.md` para wordmarks, pixel marks y avatares de IG. Reglas duras del kit: pixel mark y wordmark **nunca juntos**; el pixel mark conserva siempre las 3 opacidades (22% / 55% / 100%).


> Documento para futuras sesiones de Claude. Resume el contexto, las decisiones y las convenciones acordadas. Si trabajas en este proyecto, **lee esto primero**.

---

## Objetivo del proyecto

Mantener el **design system de FinancIA** y entregárselo al equipo de backend en un formato consumible. El proyecto cubre:

1. `manual-marca.html` como fuente única de verdad (tokens, packs, presets).
2. Un extractor (Fase 2) que produce `tokens.json`, `presets.json` y `templates/post-*.html` separados.
3. Documentación del contrato JSON (`docs/CONTENT-CONTRACT.md`) que el back debe cumplir.

**Lo que NO hacemos acá:** render con Puppeteer, upload a Cloudinary, publicación con Graph API. Eso lo arma el equipo de backend a partir de los artefactos que entregamos.

**Estado actual:** Fase 1 cerrada (design system + tema único forest + 13 presets + kit de marca). Fase 2 (extractor + handoff) pendiente.

Ver `PLAN.md` para el tracker detallado y `docs/DESIGN-SYSTEM.md` para la doc del sistema.

---

## Filosofía: closed system + presets

**Regla central:** la IA no inventa valores, elige presets.

Hay dos tipos de "vocabulario":

- **Tokens** (capas 1–2 en `:root`): paleta abierta de colores, tamaños, pesos, tracking, espaciados, radios. Para composición libre.
- **Presets** (capa 4: clases `.post-*`): recetas cerradas con identidad propia. Cada preset puede tener valores únicos (one-offs) que le dan su firma — el `120px` de `.post-data-num`, el `140px` de `.post-question-symbol`, etc. Los one-offs no se exponen como tokens.

### 3 reglas duras

1. **La IA no compone layouts libres.** Tiene un menú cerrado de presets. Si quiere un "post con número grande" → elige `post-data`.
2. **Crear un preset nuevo es decisión humana.** La IA usa presets, no los inventa.
3. **One-off que aparece en 2+ presets se promueve a token.** Si dos presets distintos terminan usando el mismo valor, eso es un patrón → se mueve a `:root`.

---

## Arquitectura del HTML (el design system)

El archivo `manual-marca.html` está estructurado en **secciones marcadas** para que un extractor (futuro `tokenExtractor.js`) las parsee:

```
DESIGN TOKENS:START                   ← marcador
  :root {
    /* CAPA 1 · PRIMITIVOS */
       fonts, text-*, weight-*, track-*, radii, space-*,
       shadows, ease/dur, paleta brand + neutros, pixelmark sizes
    /* CAPA 2 · SEMÁNTICOS */
       --type-*, --weight-* con rol, --track-* con rol,
       --surface-*, --text-* con rol, --space-card-*
  }
DESIGN TOKENS:END

PACKS:START                           ← marcador
  .type-display, .type-headline-lg, .type-headline,
  .type-stat, .type-body, .type-body-sm, .type-body-emphasis,
  .type-label-mono, .type-label-mono-sm
  .surface-card, .surface-soft, .surface-dark, .surface-brand
  .stack-sm/md/lg, .elevate-sm/md/lg/glow
  .brand-pixelmark, .brand-wordmark, .post-corner-mark
PACKS:END

.post-* { ... }                          ← componentes (presets)
```

### Las 4 capas

| Capa | Qué es | Dónde vive |
|---|---|---|
| 1 · Primitivos | Valores crudos (text-base: 18px, weight-bold: 700) | `:root` dentro de TOKENS |
| 2 · Semánticos | Aliases con intención (--type-body: var(--text-base)) | `:root` dentro de TOKENS |
| 3 · Packs | Clases reutilizables (.type-headline, .surface-card) | Bloque PACKS |
| 4 · Componentes | Presets cerrados (.post-tip, .post-data, etc.) | Después de PACKS |

---

## Convenciones de naming

- **Familias tipográficas:** `--font-display`, `--font-mono` (existían antes; mantener)
- **Tamaños:** `--text-*` (primitivo), `--type-*` (semántico con rol)
- **Pesos:** `--weight-*` (mismo prefijo para primitivo y semántico, diferenciados por nombre: `--weight-bold` vs `--weight-emphasis`)
- **Tracking:** `--track-*` (igual al anterior: `--track-tight` primitivo, `--track-display` semántico)
- **Color marca:** `--brand`, `--brand-bright`, `--brand-deep`, `--brand-soft`, `--brand-pale`, `--brand-rgb`, `--on-brand`. (Renombrados desde `--lime-*` cuando se cerró Fase 1 y se eligió forest como tema único.)
- **Neutros:** `--ink`, `--charcoal`, `--graphite`, `--stone`, `--mist`, `--bone`, `--cream`, `--white`
- **Superficies semánticas:** `--surface-base/soft/dark/brand`
- **Texto semántico:** `--text-default/muted/subtle/on-dark/on-brand`

### Marcado de one-offs

Los valores que no son tokens y son específicos de un componente se anotan con un comentario:

```css
.post-data-num {
  font-size: 120px;      /* one-off */
  font-weight: var(--weight-black);
}
```

Esto es informativo. Le dice al extractor (y a humanos): "este valor pertenece al preset, no es parte de la escala general".

---

## Tema

**Verde esmeralda · único tema.** No hay variantes — Fase 1 cerrada, tema lime descartado, atributo `data-theme` y dev panel eliminados. Todos los tokens viven en `:root`.

---

## Los 13 presets aprobados

```
post-tip          post-carousel    post-compare      post-data
post-edu          post-question    post-grid-headline  post-grid-dark
post-list         post-quote       post-checklist    post-announcement
post-outro
```

`post-outro` es el slide final de cierre/presencia de marca: wordmark grande + handle + tagline + CTA. Para usar al cerrar carruseles y stories.

Todos a 1080×1080 (feed cuadrado). Sus slots están documentados en `docs/DESIGN-SYSTEM.md`.

Para crear un preset nuevo:
1. Diseñarlo manualmente como CSS + HTML markup.
2. Definir sus slots (qué textos/datos recibe).
3. Documentarlo en `docs/DESIGN-SYSTEM.md` con tabla de slots.
4. Sumarlo al menú aprobado.

---

## Stack técnico

**Lado nuestro (Fase 2 · extractor):**
- **Node.js** moderno, ESM
- **PostCSS** para parsear las CSS vars con confianza
- Sin Puppeteer / Cloudinary / Graph API: no son necesarios acá.

**Lado del back (informativo, ellos eligen su stack):**
- Puppeteer (o equivalente) para render HTML → PNG (deviceScaleFactor 2)
- Cloudinary como CDN sugerido (ver `docs/CLOUDINARY-SETUP.md`)
- Graph API para publicación (ver `docs/INSTAGRAM-SETUP.md`)

---

## Convenciones de trabajo con el usuario

- **Idioma:** español, conversacional pero técnico.
- **Confirmación previa:** antes de cambios visuales o refactors grandes, mostrar el plan/mapeo y esperar confirmación.
- **Avance incremental:** preferir batches pequeños con verificación entre cada uno (el usuario abre el navegador y confirma).
- **No tocar one-offs** salvo que el usuario lo pida.
- **No avanzar de fase** sin que el usuario diga explícitamente que se cierra la actual.
- **Tema único cerrado** (verde esmeralda). No reintroducir variantes de tema.
- **Memoria entre fases:** este `CLAUDE.md`, `PLAN.md`, y `docs/*` capturan todo. Releer antes de actuar.

---

## Archivos clave

| Archivo | Rol |
|---|---|
| `manual-marca.html` | Fuente de verdad del design system (única) |
| `PLAN.md` | Tracker de fases y pases |
| `CLAUDE.md` | Este archivo — contexto para futuras sesiones |
| `assets/brand/` | Kit de marca FinancIA (svg, png-marks, avatars-instagram) |
| `docs/BRAND-KIT.md` | Inventario y reglas del kit de marca |
| `docs/DESIGN-SYSTEM.md` | Doc canónica de tokens, capas, presets, slots |
| `docs/CLOUDINARY-SETUP.md` | Setup del CDN (referencia para el back) |
| `docs/INSTAGRAM-SETUP.md` | Setup de Graph API (referencia para el back) |
| `docs/CONTENT-CONTRACT.md` | *(pendiente · Fase 2)* contrato JSON que el back debe cumplir |
| `tokens.json`, `presets.json`, `templates/` | *(pendiente · Fase 2)* artefactos generados por el extractor |

---

## Próximos pasos (cuando se retome)

1. ~~Cerrar Fase 1~~ ✓ Cerrada (tema único forest, variables `--brand-*`, 13 presets, kit integrado).
2. Empezar Fase 2:
   - `src/tokenExtractor.js` → `tokens.json`
   - Splitter de presets → `templates/post-*.html` con `data-slot="…"`
   - `presets.json` (schema machine-readable)
   - `docs/CONTENT-CONTRACT.md` (contrato para el back)
3. Tag `v1.0.0` cuando Fase 2 cierre, y handoff al back.

**No empezar con código sin confirmación explícita del usuario.**
