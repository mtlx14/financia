# FinancIA · Design System & Generador de posts IG

Sistema de marca y plantillas de posts para Instagram de **@financia.chile** (educación financiera).

## Estado

- **Fase 1 · Design System:** ✅ cerrada — tema único (verde esmeralda), tokens y 13 presets.
- **Fase 2 · Extractor + entregables:** ✅ cerrada — `tokens.json`, `presets.json` y `templates/post-*.html` (13) listos para el back.
- **Render / CDN / Graph API:** lo hace el equipo de back. Ver `docs/CLOUDINARY-SETUP.md` y `docs/INSTAGRAM-SETUP.md`.

## Quick start (consumidor / back)

```bash
git clone https://github.com/mtlx14/financia.git
cd financia
git checkout v1.0.0     # tag estable
```

Lo que necesitan está en la raíz tras el clone:

| Artefacto | Para qué |
|---|---|
| `templates/post-*.html` (13) | Plantillas autónomas con `data-slot="…"`. Cada una trae tokens CSS inlined + Fontshare. Render con Puppeteer a 1080×1080 (`deviceScaleFactor: 2` para 2160×2160). |
| `tokens.json` | Todos los tokens del design system (color, tipografía, spacing, etc.) — machine-readable. |
| `presets.json` | Schema de slots por preset. Validan su JSON contra esto. |
| `assets/brand/` | Pixel marks, wordmarks, avatares de IG. |
| `docs/CONTENT-CONTRACT.md` | **Contrato de integración** — leer primero. |

El `handle` (`@financia.chile`) viene **hardcoded** en los templates (no es slot).

## Mantenimiento (este repo)

`manual-marca.html` es la fuente única de verdad. El extractor regenera todo:

```bash
npm install
npm run extract        # tokens.json + templates/ + presets.json
npm run validate       # extract + tests de coherencia (104 tests)
npm test               # solo tests
```

Scripts individuales:

```bash
npm run extract:tokens   # tokens.json
npm run extract:presets  # templates/post-*.html
npm run extract:json     # presets.json (a partir de templates/)
```

## Estructura del repo

| Archivo / carpeta | Rol |
|---|---|
| `manual-marca.html` | Fuente única de verdad — tokens, packs y los 13 presets. |
| `src/` | Extractor: `extractTokens.js`, `extractPresets.js`, `buildPresetsJson.js`, `index.js`. |
| `templates/` | Salida — un `post-X.html` autónomo por preset. **No editar a mano**, se regenera. |
| `tokens.json`, `presets.json` | Salida del extractor. **No editar a mano**. |
| `test/` | Tests con `node:test` (104, sin deps extra). |
| `assets/brand/` | Kit de marca (SVGs, pixel marks, avatares 1080×1080). |
| `docs/CONTENT-CONTRACT.md` | Contrato JSON con el back. |
| `docs/DESIGN-SYSTEM.md` | Doc canónica del sistema (capas, tokens, presets, slots). |
| `docs/BRAND-KIT.md` | Inventario y reglas del kit. |
| `docs/CLOUDINARY-SETUP.md`, `docs/INSTAGRAM-SETUP.md` | Referencia para el back. |
| `PLAN.md` | Tracker de fases (1 y 2 cerradas). |
| `CLAUDE.md` | Contexto del proyecto para futuras sesiones. |

## Marca

- Nombre: **FinancIA** (la "IA" final destacada en `--brand`)
- Color: `#00E664` (verde esmeralda)
- Reglas duras: pixel mark y wordmark **nunca juntos**; pixel mark conserva las 3 opacidades (22% / 55% / 100%)

Más detalle en `docs/DESIGN-SYSTEM.md`.

## Filosofía

**Closed system + presets.** La IA elige presets, no inventa valores. Crear un preset nuevo es decisión humana. Si un valor "one-off" aparece en 2+ presets, se promueve a token. Ver `CLAUDE.md`.
