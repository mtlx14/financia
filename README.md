# FinancIA · Design System & Generador de posts IG

Sistema de marca y plantillas de posts para Instagram de **@financia.chile** (educación financiera).

## Estructura

| Archivo / carpeta | Rol |
|---|---|
| `manual-marca.html` | Fuente única de verdad. Tokens, packs y los 13 presets de post. |
| `assets/brand/` | Kit de marca (SVGs, pixel marks, avatares 1080×1080). |
| `docs/DESIGN-SYSTEM.md` | Doc canónica del sistema (capas, tokens, presets, slots). |
| `docs/BRAND-KIT.md` | Inventario y reglas del kit. |
| `docs/CLOUDINARY-SETUP.md` | Setup del CDN. |
| `docs/INSTAGRAM-SETUP.md` | Setup de Graph API. |
| `PLAN.md` | Tracker de fases (Fase 1 cerrada). |
| `CLAUDE.md` | Contexto del proyecto para futuras sesiones. |

## Estado

- **Fase 1 · Design System:** ✅ cerrada. Tema único (verde esmeralda), tokens y 13 presets.
- **Fase 2 · Extractor:** pendiente — `src/tokenExtractor.js` produce `tokens.json` + `presets.json` + `templates/*.html` para que el back consuma el contrato.
- **Fase 3–5 · Render / Cloudinary / Graph API:** lo hace el equipo de back.

## Marca

- Nombre: **FinancIA** (la "IA" final destacada en `--brand`)
- Color: `#00E664` (verde esmeralda)
- Reglas duras: pixel mark y wordmark **nunca juntos**; pixel mark conserva las 3 opacidades (22% / 55% / 100%)

Más detalle en `docs/DESIGN-SYSTEM.md`.
