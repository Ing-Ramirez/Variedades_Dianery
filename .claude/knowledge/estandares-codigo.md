# Estándares de código — Variedades Dianery

Convenciones que todo rol del equipo debe respetar en este repo.

## Arquitectura (no romper)
- **Sin build:** nada de npm/bundler/import. Globals en `window`; el orden de `<script>` es la cadena de dependencias.
- **Datos editables → `DianeryData`** (+ `api.php`), nunca `siteConfig`. `siteConfig` solo para estático no administrable.
- **Validación de productos** solo por `validateProduct`/`upsertProduct`. Imágenes ≤5, ≤1200px, JPG/PNG/WEBP.
- **Carrito** es local por usuario; no se sincroniza al servidor.

## Estilo
- Contenido visible en **español**; moneda **COP** (`formatCOP`).
- CSS plano con custom properties; nada de frameworks. Tienda: `styles.css`+`footer.css`. Admin: `admin/admin.css`.
- Responsive: breakpoints tienda 980/620/420; admin 920/600/400.
- Iconos SVG inline reutilizables (`Ic`, `AdminIcons`) — no pegar SVG suelto.
- Imágenes de producto: `object-fit/background-size: contain` (no recortar).

## Calidad
- Reutiliza patrones existentes; no introduzcas dependencias nuevas.
- Cache-busting con `?v=__VER__` en assets nuevos referenciados en HTML.
- Antes de afirmar que algo funciona: **evidencia** (compila JSX, test con mock, HTTP 200). Ver [`../workflows/desarrollo-software.md`](../workflows/desarrollo-software.md).

## Git
- Commits en español, descriptivos del *por qué*. Cierra con `Co-Authored-By: Claude ...`.
- No commitear `data.json` ni secretos.

## Despliegue
- Reglas y trampas de Hostinger: ver skill [`/variedades-dianery`](../skills/variedades-dianery/SKILL.md) (chroot, EPSV, bloqueo `Dashboard.jsx`, anti-flood, ZIP forward-slash, caché CDN).
