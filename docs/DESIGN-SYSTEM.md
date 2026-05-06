# Design System — Finanzas IG

> Documento canónico del design system. La fuente de verdad técnica es `manual-marca.html`; este documento resume y explica los tokens para uso humano y para el extractor.

> **Estado:** Fase 1 cerrada. Tema único: verde esmeralda. Variables `--brand-*` (no más `--lime`).

---

## Filosofía: sistema cerrado con presets

Este design system funciona como un **sistema cerrado**. La regla central:

> **La IA no inventa valores. Elige presets.**

Hay dos tipos de "vocabulario" disponibles:

1. **Tokens** (capas 1 y 2): la paleta abierta — colores, tamaños tipográficos, pesos, tracking, espaciados, radios. Cualquier composición libre debe usar exclusivamente tokens.
2. **Presets** (capa 4: clases `.post-*`): recetas cerradas con identidad propia. Cada preset puede contener valores únicos (one-offs) que le dan su carácter visual — el `120px` de `.post-data-num`, el `140px` de `.post-question-symbol`, etc. Esos one-offs **no se exponen como tokens** porque pertenecen al preset, no al sistema.

### ¿Cómo aparecen los one-offs en el HTML?

Marcados con un comentario `/* one-off */` al lado del valor crudo:

```css
.post-data-num {
  font-size: 120px;      /* one-off */
  font-weight: var(--weight-black);
  letter-spacing: var(--track-tightest);
}
```

Esto es informativo. Le dice al extractor (y a un humano que lea el archivo): "este valor pertenece al preset, no es parte de la escala general".

### Implicancia para la generación de posts

La IA **no recibe** un menú de tamaños tipográficos sueltos para componer. Recibe:

- **Lista de presets aprobados**: `post-tip`, `post-quote`, `post-data`, `post-grid-headline`, `post-grid-dark`, `post-announcement`, `post-edu`, `post-question`, `post-list`, `post-checklist`, `post-compare`, `post-carousel`, `post-outro`.
- **Slots de cada preset**: la IA solo elige qué texto/dato va en cada slot.
- **Color tokens** (`--brand-*`, neutros).

Si más adelante se necesita un layout nuevo, se crea **manualmente** como un preset nuevo (puede tener sus propios one-offs), y se suma al menú aprobado.

### Reglas duras

1. **La IA no compone layouts libres.** Tiene un menú cerrado de presets aprobados. Si quiere un "post con número grande" → elige `post-data`. No improvisa.
2. **Crear un preset nuevo es decisión humana.** Si hace falta un layout que no existe, lo diseña una persona: elige sus one-offs de forma intencional, lo agrega al menú. La IA usa presets, no los inventa.
3. **One-off que aparece en 2+ presets se promueve a token.** Si dos presets distintos terminan usando el mismo valor (ej: `32px`), eso ya no es one-off — es un patrón. Se mueve a `:root` como token (`--text-3xl: 32px`) y los presets pasan a usar la variable.

### ¿Qué NO es inconsistencia?

| Situación | Veredicto |
|---|---|
| `post-data` usa `120px`, `post-question` usa `140px` | ✅ OK — componentes distintos, cada uno con su firma |
| Un `post-data` cualquiera siempre tiene `120px` | ✅ Consistente — la firma se respeta |
| Un nuevo `post-data` con `110px` | ❌ Rompe la firma del preset |
| Layout libre improvisado con `115px` | ❌ La IA no debería estar improvisando layouts |

---

## 1. Tipografía

| Token | Valor | Uso |
|---|---|---|
| `--font-display` | `'Satoshi', sans-serif` | Display, títulos, cuerpo |
| `--font-mono` | `'JetBrains Mono', monospace` | Etiquetas, metadatos, code |

**Pesos disponibles:** Satoshi 300 / 400 / 500 / 700 / 900 · JetBrains Mono 400 / 500
**Carga:** Fontshare — `https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&f[]=jetbrains-mono@400,500&display=swap`

### Escala observada (referencia)
- Hero display: `clamp(60px, 12vw, 180px)` — para posts congelar a px fijo
- Section title: `clamp(40px, 6vw, 80px)`
- Stat number: `32px`
- Body / desc: `18px`
- Label mono: `10–12px` con `letter-spacing: 0.08–0.1em` uppercase
- Tracking de displays: `-0.02em` a `-0.04em`

---

## 2. Color

### Semánticos (siempre presentes)
| Token | Hex | Uso |
|---|---|---|
| `--positive` | `#3DAA47` | Validación, métricas a favor |
| `--negative` | `#E84C3D` | Alertas, métricas en contra |
| `--warning` | `#F5B400` | Advertencias |

### Paleta principal · verde esmeralda

| Slot | Valor | Rol |
|---|---|---|
| `--brand` | `#00E664` | Acento principal |
| `--brand-bright` | `#2EEB80` | Acento brillante / hover |
| `--brand-deep` | `#00B850` | Acento profundo / pressed |
| `--brand-soft` | `#A7F3D0` | Tinte suave |
| `--brand-pale` | `#D1FAE5` | Tinte muy claro / fondos |
| `--brand-rgb` | `0, 230, 100` | Mismo acento en `r,g,b` para overlays con alpha |
| `--on-brand` | `#FFFFFF` | Color de texto sobre `--brand` |

**Neutros:**

| Slot | Valor | Rol |
|---|---|---|
| `--ink` | `#0C1410` | Negro / texto principal |
| `--charcoal` | `#1A2620` | Gris muy oscuro |
| `--graphite` | `#3D4A43` | Gris medio-oscuro |
| `--stone` | `#7A8580` | Gris medio |
| `--mist` | `#C8D2CC` | Gris claro |
| `--bone` | `#ECF0EB` | Beige claro / fondos suaves |
| `--cream` | `#F5F7F2` | Fondo principal |
| `--white` | `#FFFFFF` | Blanco puro |

---

## 3. Forma

| Token / valor | Uso |
|---|---|
| `border-radius: 6px` | Cards medianas |
| `border-radius: 8px` | Botones, badges |
| `border-radius: 50%` | Dots, avatars |

(El sistema actual no tiene radios tokenizados — pendiente extraer a `--radius-sm/md/full` durante Fase 1.)

---

## 4. Patrones / fondos

Reutilizables como `class="..."`:

| Clase | Descripción |
|---|---|
| `.pattern-grid-light` | Cuadrícula sobre cream, líneas oscuras 1px @ 0.05 |
| `.pattern-grid-dark` | Cuadrícula sobre ink, líneas en color de marca 1px @ 0.05 |
| `.pattern-grid-faded` | Cuadrícula con máscara radial (fade hacia los bordes) |
| `.pattern-dots` | Patrón de puntos radial |
| `.pattern-lines` | Líneas horizontales |

Todas las cuadrículas: líneas de **1px** con opacidad **0.05** sobre el color base. Espaciados: 32 / 40 / 60 px según contexto.

---

## 5. Menú de presets

Estos son los 13 presets aprobados. La IA elige uno por nombre y rellena sus slots — no improvisa layouts.

Todos los presets están dimensionados para Instagram **1080×1080** (feed cuadrado). Variantes verticales/story se pueden derivar manualmente más adelante.

### `post-tip` — Tip rápido
Card sobre fondo brand. Tag pequeño + headline grande con énfasis opcional.

| Slot | Tipo | Notas |
|---|---|---|
| `tag` | string | Mono uppercase, ej: `"● TIP DEL DÍA"` |
| `headline` | string | Texto principal |
| `headline_em` | string · opcional | Segunda línea en italic light, ej: `"antes de gastarlo."` |
| `handle` | string | `"@tu_cuenta"` |
| `pagination` | string | ej: `"01 / 01"` |

### `post-carousel` — Portada de carrusel
Card oscura para slide 1 de un carrusel. Headline con palabra destacada en el color de marca.

| Slot | Tipo | Notas |
|---|---|---|
| `num` | string | ej: `"// 001"` |
| `swipe` | string | ej: `"desliza →"` |
| `headline` | string | Texto |
| `headline_highlight` | string | Palabra/frase resaltada con bg brand |
| `handle` | string | |
| `dots_count` | int | Cantidad total de slides (default 6) |

### `post-compare` — Comparativa lado a lado
Dos paneles con números enfrentados. Pensado para "antes/después", "con/sin", "esto/aquello".

| Slot | Tipo | Notas |
|---|---|---|
| `header` | string | Pregunta o premisa central |
| `bad.label` | string | ej: `"En la cuenta"` |
| `bad.amount` | string | ej: `"$1.8M"` |
| `bad.desc` | string | Texto explicativo corto |
| `good.label` | string | ej: `"Invertido al 8%"` |
| `good.amount` | string | ej: `"$7.4M"` |
| `good.desc` | string | |
| `foot` | string | ej: `"@tu_cuenta · educa · invierte"` |

### `post-data` — Dato impactante
Número gigante (`120px`) protagonista con contexto debajo.

| Slot | Tipo | Notas |
|---|---|---|
| `tag` | string | ej: `"// DATO INCÓMODO"` |
| `number` | string | ej: `"73"` |
| `unit` | string · opcional | ej: `"%"` (renderiza como sup) |
| `context` | string | Frase explicativa |
| `source` | string | ej: `"FUENTE · ESTUDIO 2025"` |
| `handle` | string | |

### `post-edu` — Concepto + icono
Card con icono SVG, título de pregunta y cuerpo explicativo.

| Slot | Tipo | Notas |
|---|---|---|
| `icon` | svg path data | Path del SVG (24×24 viewBox) |
| `title` | string | ej: `"¿Qué es el interés compuesto?"` |
| `body` | string | Explicación 1-2 líneas |
| `concept` | string | ej: `"CONCEPTO · 01"` |
| `handle` | string | |

### `post-question` — Pregunta de engagement
Símbolo `?` enorme con la pregunta debajo. Pide respuesta en comentarios.

| Slot | Tipo | Notas |
|---|---|---|
| `text` | string | Pregunta abierta |
| `cta` | string | ej: `"// RESPONDE EN COMENTARIOS"` |
| `handle` | string | |

### `post-grid-headline` — Headline sobre cuadrícula
Headline grande sobre fondo cream con cuadrícula y glow en una esquina.

| Slot | Tipo | Notas |
|---|---|---|
| `tag` | string | ej: `"// EDUCACIÓN FINANCIERA"` |
| `headline` | string | Línea principal |
| `headline_em` | string · opcional | Palabra en italic light entre la headline |
| `post_num` | string | ej: `"POST 042"` |
| `handle` | string | |

### `post-grid-dark` — Stat oscuro
Card oscura con stat grande y palabra destacada en color de marca.

| Slot | Tipo | Notas |
|---|---|---|
| `tag` | string | ej: `"DATO 2026"` (precedido de un dot) |
| `stat_prefix` | string · opcional | ej: `"$"` |
| `stat_highlight` | string | ej: `"427K"` (en color brand) |
| `context` | string | Texto explicativo |
| `source` | string | ej: `"FUENTE · CÁLCULO 8% ANUAL"` |
| `handle` | string | |

### `post-list` — Lista numerada de pasos
Pasos numerados con badge brand. 3 a 5 items.

| Slot | Tipo | Notas |
|---|---|---|
| `tag` | string | ej: `"// EN 5 PASOS"` |
| `title` | string | Título de la guía |
| `items` | string[] | 3-5 pasos, uno por línea |
| `guide_num` | string | ej: `"GUÍA · 005"` |
| `handle` | string | |

### `post-quote` — Frase / cita
Comilla grande, frase central, autor abajo. Sobre fondo brand con cuadrícula.

| Slot | Tipo | Notas |
|---|---|---|
| `text` | string | Frase completa |
| `author` | string | ej: `"— WARREN BUFFETT"` |
| `handle` | string | |

### `post-checklist` — Checklist
Lista de items con checkboxes (algunos check, otros no).

| Slot | Tipo | Notas |
|---|---|---|
| `tag` | string | ej: `"// ANTES DE INVERTIR"` |
| `title` | string | ej: `"¿Estás listo?"` |
| `items` | `{text, checked}[]` | 5 items con flag de check |
| `code` | string | ej: `"CHECKLIST · 03"` |
| `handle` | string | |

### `post-announcement` — Anuncio / lanzamiento
Card oscura con tag amarilla destacada y título con palabras en brand.

| Slot | Tipo | Notas |
|---|---|---|
| `tag` | string | ej: `"★ NUEVO"` (sobre fondo brand) |
| `title_lines` | string[] | Líneas del título; las marcadas con prefijo `~` van en color brand |
| `cta` | string | ej: `"INSCRÍBETE → "` |
| `handle` | string | |

---

### `post-outro` — Slide final / presencia de marca
Slide de cierre para carruseles y stories. Wordmark grande + handle + tagline + CTA. No lleva contenido editorial — es solo marca. Fondo oscuro con el grid sutil.

| Slot | Tipo | Notas |
|---|---|---|
| `handle` | string | inyectado desde `BRAND.handle` (no editorial) |
| `tagline` | string | ej: `"Educación financiera · Chile"` |
| `cta` | string | ej: `"Sígueme →"` |

**Regla:** este preset usa el wordmark, así que no lleva pixelmark en esquina (regla "nunca juntos").

---

### Schema JSON propuesto para `presets.json`

```json
{
  "post-tip": {
    "format": "1080x1080",
    "slots": {
      "tag": "string",
      "headline": "string",
      "headline_em": "string?",
      "handle": "string",
      "pagination": "string"
    }
  },
  "post-data": {
    "format": "1080x1080",
    "slots": {
      "tag": "string",
      "number": "string",
      "unit": "string?",
      "context": "string",
      "source": "string",
      "handle": "string"
    }
  }
  // ... etc
}
```

---

## 6. Schema de salida del extractor

`tokens.json` tendrá esta forma (propuesta):

```json
{
  "fonts": {
    "display": { "family": "Satoshi", "weights": [300,400,500,700,900], "url": "..." },
    "mono":    { "family": "JetBrains Mono", "weights": [400,500], "url": "..." }
  },
  "colors": {
    "semantic": { "positive": "#3DAA47", "negative": "#E84C3D", "warning": "#F5B400" },
    "brand":    { "base": "#...", "bright": "#...", "deep": "#...", "soft": "#...", "pale": "#...", "rgb": "r,g,b", "on": "#..." },
    "neutral":  { "ink": "#...", "charcoal": "#...", "graphite": "#...", "stone": "#...", "mist": "#...", "bone": "#...", "cream": "#...", "white": "#FFFFFF" }
  },
  "radii":   { "sm": "6px", "md": "8px", "full": "50%" },
  "patterns": ["grid-light","grid-dark","grid-faded","dots","lines"]
}
```
