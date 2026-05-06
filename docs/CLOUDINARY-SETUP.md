# Cloudinary — Setup

Cloudinary se usa como CDN público para que Instagram pueda consumir las imágenes renderizadas (la Graph API exige URL HTTPS pública, no acepta uploads directos).

## Por qué Cloudinary y no otra opción

| Opción | Pros | Contras |
|---|---|---|
| **Cloudinary** ✅ | Gratis hasta 25GB · setup en minutos · transformaciones on-the-fly | Vendor lock-in suave |
| AWS S3 + CloudFront | Más barato a escala · control total | Setup más largo (IAM, bucket policy, CDN) |
| Servidor propio + ngrok | Cero costo | Frágil, URLs efímeras |

## Pasos

1. Crear cuenta en https://cloudinary.com (plan free)
2. En el dashboard copiar:
   - `Cloud Name`
   - `API Key`
   - `API Secret`
3. Crear un *upload preset* (Settings → Upload → Add upload preset):
   - Modo: **Unsigned** (más simple) o **Signed** (más seguro, recomendado)
   - Folder: `instagram-posts/`
4. Guardar credenciales en `.env`:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=xxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxx
CLOUDINARY_UPLOAD_PRESET=ig_posts
```

## Notas

- Las URLs públicas tienen formato: `https://res.cloudinary.com/<cloud>/image/upload/v.../<folder>/<name>.png`
- Conviene borrar las imágenes después de publicarlas (usar tag + cron) para no inflar el plan.
- Cloudinary permite transformaciones — útil si más adelante queremos generar versiones con watermark, etc.

## Estado

- [ ] Cuenta creada
- [ ] Credenciales en `.env`
- [ ] Upload preset configurado
- [ ] Test de upload manual exitoso
