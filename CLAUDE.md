# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Prototipo de "Variedades Dianery" (tienda de variedades en español) construido como app React **sin paso de compilación**: React 18 + ReactDOM + Babel Standalone se cargan desde CDN y el navegador compila los `.jsx` (`type="text/babel"`) en tiempo de carga. Son dos apps independientes que comparten marca:

- **Tienda** — `Variedades Dianery.html`: escaparate público (header, banner, catálogo, cierre de campaña, footer, chat flotante).
- **Admin** — `admin/Admin.html`: panel de gestión (resumen, productos, pedidos, clientes, configuración).

No hay `package.json`, `npm`, bundler ni tests.

## Cómo ejecutarlo

**Debe servirse por HTTP** — con `file://` no funciona porque los `.jsx` se cargan por red:

```bash
npx serve .        # o cualquier servidor estático apuntando a la raíz
```

- Tienda: `/Variedades Dianery.html` (o `/`)
- Admin: `/admin/Admin.html`

## Arquitectura

### Globals, no imports
React pre-bundler: no hay sistema de módulos. Cada archivo cuelga sus exports de `window` (`Object.assign(window, {...})` o `window.X = ...`) y los siguientes los destructuran de vuelta. **El orden de los `<script>` en cada HTML es la cadena de dependencias** y es load-bearing. Añadir un componente = escribirlo, exponerlo en `window`, y agregar su `<script type="text/babel">` en el orden correcto del HTML.

Orden en `Variedades Dianery.html`: `config.js` → `tweaks-panel.jsx` → `components/Icons.jsx` → `components/Top.jsx` → `components/Bottom.jsx` → `app.jsx`.

Orden en `admin/Admin.html`: `../dianery-data.js` → `AdminIcons.jsx` → `Common.jsx` → vistas (`Dashboard`/`Products`/`Orders`/`Customers`/`Settings`) → `AdminShell.jsx` (monta en `#root`).

### Backend de datos compartidos (Hostinger PHP)
`api.php` (en la raíz) es el almacén central: `GET /api.php` devuelve `data.json`; `POST /api.php` lo sobrescribe (sin auth, decisión del dueño; escritura atómica con tope de 25MB). `data.json` lo genera el servidor — **no se versiona ni se despliega** (está en `.gitignore`/`.dockerignore`; el deploy nunca lo toca). `dianery-data.js` lo integra así: al iniciar carga de `localStorage` (instantáneo) y luego hace `syncFromServer()` (GET) para reemplazar con los datos del servidor; cada `save()` posterior persiste con `saveToServer()` (POST). Flags `initialized` (no postear durante el seed inicial) y `userSavedLocally` (no pisar ediciones con un GET en vuelo). El **carrito NO se sincroniza** (es local por usuario). Sin esto, cada dispositivo veía solo su propio `localStorage`. Nota: el backend solo corre en Hostinger (PHP); en Docker/`npx serve` no hay PHP y la app cae al cache local.

### Dos fuentes de datos
- **`dianery-data.js` → `window.DianeryData`**: fuente de verdad de **productos, carrito y configuración**, persistida en `localStorage` (cache) + servidor vía `api.php` (`dianery_store_v1` para la tienda/admin, `dianery_cart_v1` para el carrito; seed la primera vez). Lo consumen **tanto el admin como el catálogo de la tienda**. API: `getConfig/getProducts/getOrders/getCustomers/getMetrics/getCategories`, `saveConfig`, `validateProduct`, `upsertProduct` (valida y devuelve `{ok, errors, product}`), `deleteProduct`, `setOrderStatus`, carrito (`getCart/getCartDetailed/cartCount/cartTotal/addToCart/setCartQty/removeFromCart/clearCart/onCartChange`), WhatsApp (`getWhatsappNumber/buildOrderMessage/whatsappOrderUrl/whatsappProductUrl`), `reset`, `formatCOP`, `onChange`. Cada mutación de catálogo dispara `dianery:change`; cada mutación de carrito dispara `dianery:cart`. La tienda se re-renderiza ante ambos (hook `useStoreData` en `app.jsx`).
- **`config.js` → `window.siteConfig`**: copy **estático** de la tienda que aún no se administra (nav del header, textos del banner, columnas/legal del footer). El catálogo de productos **ya NO** sale de aquí. El número de WhatsApp configurable sale de `DianeryData.getConfig().contact.whatsapp` (Admin → Contacto), no de `siteConfig`.

Imágenes: cada producto admite hasta 5 (`product.images`, data URLs reescalados a ≤1200px en el navegador); la primera es la principal. Validación de formato (JPG/PNG/WEBP) y límite en `Products.jsx` (`readImageFile`/`ImageManager`).

### Admin: router por hash + re-render reactivo
`AdminShell.jsx` es un router simple por `window.location.hash` (`#dashboard`, `#productos`, …) que monta la vista activa. Las vistas se re-renderizan al cambiar los datos vía el hook `useData()` (`Common.jsx`), que escucha `dianery:change` y devuelve `DianeryData`. `Common.jsx` también provee helpers compartidos: `StatusBadge`, `StockCell`, `ORDER_STATUSES`, y un toast global (`useToast`/`Toast` + `window.adminToast(msg)`).

### El panel de Tweaks + protocolo EDITMODE (solo tienda)
`tweaks-panel.jsx` es un scaffold de herramienta de diseño para edición en vivo dentro de un editor host:

- `app.jsx` define `TWEAK_DEFAULTS` envuelto en un comentario literal `/*EDITMODE-BEGIN*/{ ... }/*EDITMODE-END*/`. El host reescribe el JSON **dentro de esa valla en disco** al cambiar un tweak — mantenlo como JSON válido y conserva los marcadores.
- `useTweaks(defaults)` devuelve `[values, setTweak]`. `setTweak` actualiza estado React, hace `postMessage` `__edit_mode_set_keys` a `window.parent`, y emite un evento `tweakchange`.
- `TweaksPanel` habla el protocolo del host (`__edit_mode_available`, `__activate_edit_mode`/`__deactivate_edit_mode`, `__edit_mode_dismissed`); registra su listener antes de anunciar disponibilidad — no reordenar.
- Los tweaks se aplican en `app.jsx` escribiendo CSS custom properties (`--accent`, `--footer-bg`, `--radius`, …) sobre `document.documentElement` en un `useEffect`, así el styling vive en `styles.css`/`footer.css` y el JS solo setea variables.

Reutiliza los controles `Tweak*` (`TweakColor`, `TweakSlider`, `TweakRadio`, `TweakToggle`, `TweakSelect`, `TweakText`, `TweakNumber`, `TweakButton`) en vez de inputs propios. Para colores, curar 3–4 opciones en vez de un picker libre. El banner `@ds-adherence-ignore` al inicio del archivo es intencional: ese archivo puede usar hex/px crudos.

### Estilos e iconos
- CSS plano: tienda en `styles.css` + `footer.css`; admin en `admin/admin.css`. El theming se maneja por CSS custom properties en `:root`/`documentElement`.
- Iconos como SVG inline: tienda en `components/Icons.jsx` (`window.Ic`), admin en `admin/AdminIcons.jsx` (`window.AdminIcons`). Un icono debe existir aquí antes de poder referenciarlo (p. ej. el footer filtra por `Ic[iconName]` existente).

## Convenciones
- Todo el contenido visible es en **español**; moneda en COP (formateada con `formatCOP` / `toLocaleString("es-CO")`).
- Estados de pedido (orden del flujo): Nuevo → Preparando → Enviado → Entregado / Cancelado.

## Equipo de trabajo (`.claude/`)
Este repo monta un **equipo de roles** (skills) para trabajar con más herramientas. Punto de entrada: [`.claude/equipo.md`](.claude/equipo.md); índice en [`.claude/skills/README.md`](.claude/skills/README.md). Invoca roles con `/<slug>`.
- **Empieza siempre con `/variedades-dianery`** (skill de dominio: arquitectura, invariantes, trampas de despliegue) y cierra con `/audit-connections`.
- Coordinación: `/orquestador-equipo`, `/planificador-proyectos`, `/director-tecnico-ia`, `/product-manager`. Más relevantes aquí: `/ingeniero-frontend`, `/ingeniero-backend`, `/especialista-ux`, `/ingeniero-devops`.
- Conocimiento y procesos: `.claude/knowledge/`, `.claude/workflows/`. Para hacer crecer el equipo: `.claude/evolution/`.
