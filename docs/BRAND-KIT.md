# FinancIA · Kit de marca

## ¿Qué incluye?

```
kit/
├── avatars-instagram/    PNGs 1080×1080 listos para subir a IG
│   ├── A_ink-lime.png    ← recomendado (clásico)
│   ├── B_lime-ink.png    ← más vibrante
│   ├── C_cream-ink.png
│   ├── D_white-lime.png
│   ├── E_ink-white.png
│   └── F_lime-cream.png
│
├── svg/                  vectores escalables — para web, presentaciones
│   ├── pixelmark-lime.svg
│   ├── pixelmark-white.svg
│   ├── pixelmark-ink.svg
│   ├── pixelmark-cream.svg
│   ├── wordmark-highlight-light.svg   (sobre fondos claros)
│   ├── wordmark-highlight-dark.svg    (sobre fondos oscuros)
│   ├── wordmark-color-light.svg       (IA en lime, sin bloque)
│   └── wordmark-color-dark.svg
│
└── png-marks/            pixel mark con fondo transparente
    ├── pixelmark-lime-transparent.png
    ├── pixelmark-white-transparent.png
    └── pixelmark-ink-transparent.png
```

## Cómo usarlos

### Instagram
- **Foto de perfil:** sube cualquiera de `avatars-instagram/`. Son cuadrados 1080×1080 — IG aplica el recorte circular automáticamente. El padding ya está calculado para que los cuadros no se corten.

### Web / HTML
Para usar el SVG inline:
```html
<img src="svg/wordmark-highlight-light.svg" alt="FinancIA" height="48">
```

O directamente con el HTML/CSS del design system (más flexible — puedes cambiar tamaños y colores con variables CSS).

### Presentaciones / documentos
Usa los SVGs (escalan sin perder calidad) o los PNGs con fondo transparente para componer.

## Colores oficiales

```
Lime         #00E664   ← color de marca
Lime deep    #00B850   ← lime sobre fondos claros
Ink          #0C1410   ← negro de marca
Cream        #F5F7F2   ← fondo claro
```

## Reglas

- **Nunca** uses el wordmark y el pixel mark juntos en la misma composición.
- El pixel mark **son los cuadros** — el fondo (cuadrado, círculo, etc.) es libre.
- El pixel mark mantiene 3 niveles de opacidad (22%, 55%, 100%) para preservar el ritmo visual original.
- Tipografía: Satoshi (display) + JetBrains Mono (mono).
