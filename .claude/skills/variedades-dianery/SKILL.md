---
name: variedades-dianery
description: Skill de dominio de "Variedades Dianery" — tienda de variedades en español como app React SIN paso de compilación (React 18 + Babel Standalone desde CDN) + backend PHP mínimo en Hostinger. Codifica arquitectura, invariantes y trampas de despliegue. Úsalo en cualquier feature, bug o cambio en este repositorio.
---

# Variedades Dianery — Skill de dominio

## Identidad del proyecto

Prototipo de tienda en español, **sin bundler**: React 18 + ReactDOM + Babel Standalone se cargan desde CDN y el navegador compila los `.jsx` (`type="text/babel"`) en tiempo de carga. **No hay `package.json`, npm, ni build.** Dos apps que comparten marca:
- **Tienda** — `index.html` (raíz; igual en dev y prod).
- **Admin** — `admin/Admin.html`.

Producción: **Hostinger** (PHP), dominio `variedadesdianery.com`. Repo: `github.com/Ing-Ramirez/Variedades_Dianery` (rama `main`).

## Invariantes no negociables

### 1. Globals, no imports — el orden de los `<script>` ES la cadena de dependencias
No hay sistema de módulos. Cada archivo cuelga sus exports de `window` (`Object.assign(window,{...})`) y los siguientes los destructuran. Añadir un componente = escribirlo, exponerlo en `window`, y agregar su `<script>` **en el orden correcto** del HTML. Orden tienda: `config.js → dianery-data.js → tweaks-panel.jsx → components/Icons.jsx → Top.jsx → Bottom.jsx → app.jsx`. Orden admin: `../dianery-data.js → AdminIcons → Common → vistas → AdminShell`.

### 2. Fuente de verdad de datos = `DianeryData` (+ backend), NO `siteConfig`
- `dianery-data.js → window.DianeryData`: productos, carrito, categorías y config. Persiste en `localStorage` (`dianery_store_v1`) **como cache** y sincroniza con el servidor vía `api.php`. La tienda lee de aquí mediante un **adaptador en `app.jsx`** (marca, banner, cierre, contacto, redes, chat). `siteConfig` (`config.js`) solo aporta lo estático aún no administrable (nav, columnas/legal del footer, imagen placeholder del banner).
- **Trampa histórica:** si la tienda lee de `siteConfig` en vez de `DianeryData`, los cambios del admin NO se reflejan. Todo dato editable debe trazar a `DianeryData.getConfig()`.

### 3. Backend de datos compartidos — `api.php`
`GET /api.php` devuelve `data.json`; `POST /api.php` lo sobrescribe (sin auth por decisión del dueño; escritura atómica, tope 25MB). `data.json` lo genera el servidor: **nunca se versiona ni se despliega** (`.gitignore`/`.dockerignore`; el deploy jamás lo toca). En `dianery-data.js`: al iniciar carga de localStorage y luego `syncFromServer()` (GET); cada `save()` posterior persiste con `saveToServer()` (POST). Flags `initialized` (no postear el seed inicial) y `userSavedLocally` (no pisar ediciones con un GET en vuelo). **El carrito NO se sincroniza** (local por usuario). Corre con PHP: en prod (Hostinger) y en el **Docker `php:apache` de dev** (paridad). Con un estático sin PHP (`npx serve`) cae al cache local.

### 4. Eventos reactivos
Cada mutación de catálogo dispara `dianery:change`; cada mutación de carrito dispara `dianery:cart`. La tienda re-renderiza ante ambos (hook `useStoreData` en `app.jsx`); el admin vía `useData()` (`Common.jsx`). Un `storage` listener en `dianery-data.js` recarga el estado entre pestañas.

### 5. Validación de productos centralizada
`DianeryData.validateProduct(p)` y `upsertProduct(p)` (valida y devuelve `{ok, errors, product}`) son el único camino para crear/editar. Imágenes: máx 5 por producto, data URLs reescalados a ≤1200px en el navegador (`readImageFile`), JPG/PNG/WEBP.

### 6. Categorías gestionadas
`state.categories` es la lista gestionable. `addCategory`/`deleteCategory` (bloquea si hay productos usándola). `getCategories(true)` = categorías con productos activos (para el filtro de la tienda); `getCategories()` = lista gestionada (para el admin). El form de producto usa la lista gestionada, no un array hardcodeado.

## Despliegue (Hostinger) — trampas ya resueltas, NO re-descubrir

1. **Cache-busting:** los assets en los HTML llevan `?v=__VER__`; el deploy reemplaza `__VER__` por el SHA del commit. `index.html` se sirve fresco (DYNAMIC en la CDN `hcdn`), así la versión nueva entra de inmediato. `.htaccess` pone `no-cache` para html/js/jsx/css. **Sin esto, la CDN sirve versiones viejas hasta 7 días.**
2. **FTP enjaulado (chroot) en `public_html`** → se sube a la raíz `/`, NO a `public_html/`.
3. **EPSV cuelga** la conexión (~30s/archivo) → `curl --disable-epsv --ftp-pasv` (baja a ~2s).
4. **Hostinger bloquea subir un archivo llamado `Dashboard.jsx`** (regla de seguridad, 550) → subir con nombre temporal y renombrar (RNFR/RNTO sí funciona).
5. **Anti-flood:** demasiadas conexiones FTP en poco tiempo → la cuenta se **banea** (530) por horas. Mitigar: pocas conexiones por deploy; ante ban, usar el **File Manager** (sube un ZIP, NO usa FTP).
6. **ZIP para File Manager:** crear con **forward slashes** (PowerShell 5.1 `Compress-Archive` mete backslashes → Hostinger extrae mal). Usar `ZipFileExtensions::CreateEntryFromFile` con rutas `/`.
7. El navegador del dueño puede **auto-traducir** la página (admin→administración, uploads→subidas en el File Manager/logs): es solo la etiqueta visual, los archivos reales están en inglés.

Deploy automático: push a `main` → GitHub Actions `.github/workflows/deploy.yml` (curl). Secrets `FTP_HOST/USER/PASS`. CI: `ci-dev`, `ci-prod`, `security-scan`, `nightly`.

## WhatsApp
Número configurable en Admin → Contacto (`DianeryData.getConfig().contact.whatsapp`, NO `siteConfig`). `whatsappOrderUrl()` / `whatsappProductUrl(p)` construyen `wa.me/<numero>?text=...` con `encodeURIComponent`.

## Convenciones
- Todo el contenido visible en **español**; moneda COP (`formatCOP`).
- Estilos: tienda en `styles.css`+`footer.css`; admin en `admin/admin.css`. Theming por CSS custom properties.
- Iconos SVG inline: tienda `components/Icons.jsx` (`window.Ic`), admin `admin/AdminIcons.jsx` (`window.AdminIcons`).
- Responsive: breakpoints 980 (tablet), 620 (teléfono), 420 (pequeño) en tienda; 920/600/400 en admin.
- Antes de decir "funciona": verificar con evidencia (HTTP 200, tests). Ver skill `/audit-connections` para auditar enlaces y conexiones admin↔tienda.
