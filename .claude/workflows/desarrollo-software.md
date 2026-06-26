# Workflow — Desarrollo de software (Variedades Dianery)

Flujo de extremo a extremo para una feature o fix en esta tienda **sin build** + PHP en Hostinger.

## 1. Contexto
- Invoca `/variedades-dianery` (arquitectura, invariantes, trampas).
- Si la tarea es grande: `/orquestador-equipo` para repartir; `/planificador-proyectos` para fases.

## 2. Diseño
- `/arquitecto-software` para estructura; `/especialista-ux` para flujo/UI.
- Decide la **fuente de datos**: ¿editable por el dueño? → va por `DianeryData` (+ `api.php`), nunca `siteConfig`.

## 3. Implementación
- **Frontend** (`/ingeniero-frontend`): nuevo componente → escribirlo, exponerlo en `window`, agregar su `<script>` en el **orden correcto** del HTML.
- **Backend/datos** (`/ingeniero-backend`): cambios en `dianery-data.js` / `api.php`; respeta `initialized`/`userSavedLocally`.
- Mantén español + COP; reutiliza iconos de `Icons.jsx`/`AdminIcons.jsx`.

## 4. Verificación (antes de "funciona")
- Compila JSX: Babel standalone en Node (ver tests previos) y `node --check` para JS plano.
- Lógica con datos: test con mock de `localStorage`/`fetch` en Node (ej. categorías 10/10, sync 10/10).
- `/audit-connections`: enlaces muertos, 404 de assets, conexión admin↔tienda, caché.

## 5. Despliegue
- `/ingeniero-devops`. Cache-busting `?v=__VER__` (lo sustituye el deploy por el SHA).
- **Vía normal:** push a `main` → GitHub Actions (curl FTP).
- **Si el FTP está baneado (530):** generar ZIP con **forward slashes** y subir por **File Manager** (no usa FTP). Verificar por HTTP (200) en `variedadesdianery.com`.
- `data.json` jamás se despliega.

## 6. Cierre
- Commit descriptivo (en español) + push. Actualiza `CLAUDE.md`/memoria si cambió una invariante.
- Si quedó deuda (flag, skip, ban temporal), anótalo.
