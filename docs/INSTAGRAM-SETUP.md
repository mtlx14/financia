# Instagram Graph API — Setup

Para publicar automatizado en Instagram NO se puede usar una cuenta personal. Se necesita el flujo oficial de Meta.

## Requisitos previos

1. **Cuenta de Instagram tipo Business o Creator**
   - Si tu cuenta es personal, convertirla: Configuración → Cuenta → Cambiar a cuenta profesional.
2. **Página de Facebook** vinculada a la cuenta de Instagram
   - Crear en https://www.facebook.com/pages/create
   - En la página: Configuración → Instagram → Conectar cuenta
3. **App en Meta for Developers**
   - https://developers.facebook.com/apps → Crear app tipo **Business**
   - Agregar producto **Instagram Graph API**

## Tokens necesarios

1. **User Access Token** (corto plazo, 1 hora) — desde Graph API Explorer
2. **Long-Lived Access Token** (60 días) — intercambiar el corto por uno largo:
   ```
   GET https://graph.facebook.com/v19.0/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id=APP_ID
     &client_secret=APP_SECRET
     &fb_exchange_token=SHORT_LIVED_TOKEN
   ```
3. **Instagram Business Account ID** — obtener desde:
   ```
   GET https://graph.facebook.com/v19.0/PAGE_ID?fields=instagram_business_account
   ```

## Permisos requeridos (scopes)

- `instagram_basic`
- `instagram_content_publish`
- `pages_show_list`
- `pages_read_engagement`

## Flujo de publicación (referencia)

```
1. POST /{ig-user-id}/media
   body: { image_url, caption } → devuelve creation_id
2. POST /{ig-user-id}/media_publish
   body: { creation_id } → publica
```

Para carruseles: crear un container por slide con `is_carousel_item=true`, luego un container `media_type=CAROUSEL` con los `children`, y publicar.

## Variables de entorno

```env
META_APP_ID=
META_APP_SECRET=
IG_ACCESS_TOKEN=          # long-lived
IG_BUSINESS_ACCOUNT_ID=
```

## Estado

- [ ] Cuenta IG convertida a Business/Creator
- [ ] Página de FB creada y vinculada
- [ ] App en Meta for Developers creada
- [ ] Long-lived token obtenido
- [ ] IG Business Account ID identificado
- [ ] Test manual de publicación exitoso (vía curl o Graph Explorer)

## Notas / gotchas

- El long-lived token expira a los 60 días. Si se publica al menos una vez en ese rango, se renueva solo. Si no, hay que regenerar manualmente.
- Modo desarrollo de la app: solo permite publicar en cuentas roles (admin/dev/tester). Para producción hay que pasar **App Review** con Meta.
- Límite: 50 publicaciones por cuenta IG en 24h.
