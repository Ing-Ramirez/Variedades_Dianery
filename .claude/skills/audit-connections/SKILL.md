---
name: audit-connections
description: Audita que TODOS los enlaces, botones, URLs y conexiones de datos de un sitio web funcionen de extremo a extremo. Úsalo al terminar una feature, antes de desplegar, o cuando el usuario reporte que "un enlace no funciona", "se desactiva en el admin pero sigue en la tienda", "no dirige a", "botón muerto", "el cambio no se refleja", o quiera verificar conexiones/URLs. Detecta enlaces muertos (href="#"), 404 de assets, desconexiones admin↔frontend, y problemas de caché/persistencia.
---

# Auditoría de enlaces y conexiones

Objetivo: ningún enlace muerto, ningún 404, y que **lo que se cambia en un panel/admin realmente se refleje donde el usuario final lo ve**. Trabaja en 4 capas. No declares "funciona" sin verificar con evidencia (curl/grep/lectura de código), nunca por suposición.

## Capa 1 — Enlaces y botones muertos (frontend)

Busca todo elemento interactivo y confirma que tenga comportamiento real.

```bash
# Anclas con href="#", vacío o javascript:void — sospechosos de enlace muerto
grep -rnE 'href="(#|)"|href="javascript:' --include=*.html --include=*.jsx --include=*.js --include=*.tsx .
# Botones sin onClick y anclas sin href
grep -rnE '<button(?![^>]*onClick)' --include=*.jsx --include=*.tsx .
```

Para cada coincidencia, confirma que exista UNA de estas: handler `onClick`/`onSubmit`, un `href` real, o un interceptor explícito que dé feedback (ej. toast "Próximamente"). Un `href="#"` solo es aceptable si un handler hace `preventDefault()` y reacciona. Lista cada hallazgo como ✅ (tiene comportamiento) o ❌ (muerto).

Checklist típico a recorrer: logo, ítems de nav (desktop y móvil), buscador, carrito, cards de producto, filtros/orden, paginación, CTAs, footer (columnas, contacto, redes, legales), chat flotante, modales (abrir/cerrar/acción), formularios (enviar/cancelar).

## Capa 2 — Resolución de URLs/assets (red)

Todo `src`/`href`/`import` local debe responder 200 en el entorno servido (un `.jsx`/`.js`/`.css` faltante rompe la app entera).

```bash
# Extrae rutas locales referenciadas en los HTML y pruébalas contra la URL base
BASE="https://tu-dominio.com"
for f in $(grep -rhoE '(src|href)="[^"]+"' *.html **/*.html | grep -oE '"[^"]+"' | tr -d '"' | grep -vE '^https?:|^#|^mailto:|^tel:'); do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/$f")
  [ "$code" = "200" ] && echo "✅ $f" || echo "❌ $f → $code"
done
```

Errores frecuentes:
- **Subcarpetas 404 tras deploy**: el subir por FTP/CI no creó los directorios (revisa que se suban carpetas, no archivos con `\` en el nombre).
- **Mismatch dev/prod**: un archivo se renombra al desplegar (ej. `index.html`) pero el código apunta al nombre viejo. Usa rutas que funcionen en ambos (ej. `../` en vez de `../Pagina.html`).
- **Mayúsculas**: servidores Linux distinguen `Top.jsx` de `top.jsx`.

## Capa 3 — Conexión de datos admin ↔ frontend (la más olvidada)

Síntoma clásico: *"lo desactivo/edito en el admin pero el cambio NO aparece en la tienda"*. Causa raíz casi siempre: **el admin escribe en una fuente de datos y el frontend lee de OTRA distinta.**

Procedimiento:
1. Localiza dónde **escribe** el admin (ej. `saveConfig`, API, store, `localStorage`).
2. Localiza dónde **lee** el frontend cada dato visible (banner, toggles de secciones, contacto, redes, precios, stock).
3. Confirma que sean **la MISMA fuente**. Si hay dos (ej. un `config.js` estático y un store dinámico), están desconectados.

```bash
# Ejemplo: ¿quién lee de la config estática vs. del store dinámico?
grep -rn "siteConfig\." --include=*.jsx .     # fuente estática
grep -rn "getConfig\|DianeryData\|store\." --include=*.jsx .   # fuente dinámica del admin
```

Para CADA campo editable en el admin, traza la cadena: **campo del form → guardado → lectura del componente → render**. Si el componente lee de una constante/archivo estático en vez del valor guardado, está desconectado. Verifica especialmente los **toggles de visibilidad** (mostrar/ocultar sección): que `enabled` del admin controle realmente el render (`if (!data.enabled) return null;`).

## Capa 4 — Persistencia y alcance (¿quién ve el cambio?)

Pregunta crítica: cuando el admin guarda, **¿dónde queda el dato y quién puede verlo?**

- **`localStorage`/`sessionStorage`**: el dato vive SOLO en el navegador de quien editó. **Otros visitantes/dispositivos NO lo ven.** Sirve para prototipo o para el panel del propio dueño, NO para publicar cambios a clientes.
- **Backend/BD/archivo en servidor**: el dato es compartido → todos los visitantes lo ven. Es lo necesario para un admin "real" que controla la tienda pública.
- **Baked-in/seed + redeploy**: los valores por defecto solo cambian al volver a desplegar.

Si el admin usa `localStorage` y el objetivo es que los clientes vean los cambios, **decláralo como limitación** y propon la solución (endpoint que lea/escriba un JSON en el servidor, o una BD). No asumas que "guardar en el admin" = "publicado para todos".

Verificación de caché (un cambio correcto puede no verse por caché de CDN/navegador):
```bash
curl -sI "$BASE/archivo.js" | grep -iE "cache-control|x-.*cache|age"   # ¿lo está cacheando?
curl -s "$BASE/archivo.js?v=$(date +%s)" | head    # cache-buster: ¿el contenido real ya es el nuevo?
```
Si el contenido en disco es correcto pero la URL plana sirve viejo → es caché: versiona los assets (`archivo.js?v=<hash>`) y/o ajusta cabeceras `Cache-Control`.

## Entregable

Reporta una tabla por capa con cada elemento como ✅/❌ y, para cada ❌, la causa raíz y el fix. Cierra con: "Verifié N enlaces, M assets, K conexiones de datos" con la evidencia (códigos HTTP, líneas de código), nunca un "debería funcionar".
