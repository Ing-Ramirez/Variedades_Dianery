# Variedades Dianery

Prototipo de tienda de variedades con **panel de administración**, construido como app React sin paso de compilación (React 18 + Babel Standalone desde CDN). Pensado para iterar rápido sobre el diseño y la gestión de catálogo.

Consta de dos partes que comparten una misma capa de datos:

- **Tienda** (`Variedades Dianery.html`) — escaparate público: encabezado, banner, catálogo de productos, bloque de cierre de campaña, footer y chat flotante.
- **Admin** (`admin/Admin.html`) — panel de gestión: resumen, productos, pedidos, clientes y configuración general.

## Cómo ejecutarlo

No hay build, ni `npm install`, ni bundler: el navegador compila el JSX en tiempo de carga. Pero **debe servirse por HTTP** (con `file://` no funciona, porque los `.jsx` se cargan por red).

Cualquier servidor estático sirve. Por ejemplo, con Node:

```bash
npx serve .
# o cualquier server estático apuntando a la raíz del proyecto
```

Luego abre en el navegador:

| Página | Ruta |
|--------|------|
| Tienda | `/Variedades Dianery.html` (o `/`) |
| Admin  | `/admin/Admin.html` |

## Capa de datos compartida

`dianery-data.js` es la **fuente de verdad** para la tienda y el admin. Expone `window.DianeryData` y **persiste el estado en `localStorage`** (clave `dianery_store_v1`), con datos de ejemplo (seed) la primera vez.

- El **admin escribe** (productos, pedidos, configuración…) y los cambios quedan guardados.
- La **tienda lee** y refleja los cambios al recargar; también reacciona en vivo vía el evento `dianery:change` / `storage`.

API principal: `getProducts`, `getOrders`, `getCustomers`, `getConfig`, `getMetrics`, `upsertProduct`, `deleteProduct`, `setOrderStatus`, `saveConfig`, `formatCOP`, `reset`.

## Estructura

```
.
├── Variedades Dianery.html   # Tienda (entrada)
├── dianery-data.js           # Capa de datos compartida (localStorage)
├── config.js                 # Config/textos de la tienda (window.siteConfig)
├── app.jsx                   # Ensambla la tienda + panel de Tweaks
├── tweaks-panel.jsx          # Controles de personalización en vivo (Tweaks)
├── styles.css / footer.css   # Estilos de la tienda
├── components/
│   ├── Icons.jsx             # SVGs (window.Ic)
│   ├── Top.jsx               # Header, Banner, Catálogo
│   └── Bottom.jsx            # Cierre de campaña, Footer, Chat flotante
├── admin/
│   ├── Admin.html            # Admin (entrada)
│   ├── admin.css             # Estilos del admin
│   ├── AdminIcons.jsx        # SVGs del admin (window.AdminIcons)
│   ├── Common.jsx            # Helpers: badges, stock, toast, useData
│   ├── AdminShell.jsx        # Top nav + router por hash, monta la app
│   ├── Dashboard.jsx         # Resumen (KPIs, ventas, stock bajo, pedidos)
│   ├── Products.jsx          # CRUD de productos (tabla + drawer)
│   ├── Orders.jsx            # Pedidos + cambio de estado en línea
│   ├── Customers.jsx         # Clientes
│   └── Settings.jsx          # Configuración general (se refleja en la tienda)
└── uploads/                  # Imágenes
```

## Arquitectura (resumen)

- **Sin sistema de módulos:** cada archivo expone sus piezas en `window` y los siguientes las consumen desde ahí. **El orden de los `<script>` en cada HTML es la cadena de dependencias** y es importante.
- **Tienda:** el contenido vive en `config.js` (`window.siteConfig`); los componentes solo presentan. El panel de *Tweaks* permite ajustar color de acento, esquinas, tono del footer y secciones visibles, aplicándolo vía variables CSS.
- **Admin:** router simple por `hash` en `AdminShell.jsx`; cada vista lee/escribe a través de `window.DianeryData` y re-renderiza con el hook `useData()` al cambiar los datos.

## Funcionalidad actual

- **Resumen:** KPIs (ventas, pedidos por atender, visitas, ticket promedio), gráfico de ventas por mes, alertas de stock bajo y últimos pedidos.
- **Productos:** crear, editar y eliminar; búsqueda y filtros (activos/inactivos/stock bajo); estado de visibilidad y control de stock.
- **Pedidos:** listado con filtros por estado y cambio de estado en línea (Nuevo → Preparando → Enviado → Entregado / Cancelado).
- **Clientes:** listado con búsqueda y métricas (pedidos, total gastado, antigüedad).
- **Configuración:** marca, banner, cierre de campaña, contacto, redes sociales y chat flotante — **los cambios se reflejan en la tienda**.

> Prototipo de front-end: los datos persisten solo en el navegador (`localStorage`). No hay backend ni pasarela de pago todavía.
