# Protocolo obligatorio de trabajo — Variedades Dianery

> Este es el **modo de operar obligatorio** para cualquier pedido que toque código, configuración o despliegue en este repo. El orden NO es opcional: primero enrutar con el equipo, luego planear, luego desarrollar, y siempre cerrar registrando aprendizajes. Un hook lo recuerda en cada prompt; este archivo es la versión completa.

## Las 5 fases (en orden, siempre)

### 1. Cargar contexto y enrutar (verificar + asignar)
- Invoca **`/variedades-dianery`** (skill de dominio) antes de tocar nada: arquitectura, invariantes y trampas de despliegue.
- Identifica los **roles/skills** que la tarea requiere y asígnalos explícitamente (di cuáles y por qué). Para tareas con varias áreas, usa **`/orquestador-equipo`**.
- Revisa **`aprendizajes.md`** y la **memoria** por correcciones previas que apliquen. No repitas un error ya registrado.
- ¿Hace falta una herramienta que no existe? Crea un rol con `evolution/generador-agentes.md`.

### 2. Planear
- Plan corto y concreto: qué archivos, qué orden, qué riesgos, cómo se verificará.
- Define el criterio de "hecho" con **evidencia** (compila, test, HTTP 200), no "debería funcionar".

### 3. Desarrollar
- Respeta los invariantes del skill de dominio (DianeryData vs siteConfig, orden de `<script>`, `api.php`, validación, cache-busting).
- Sigue `knowledge/estandares-codigo.md` y `workflows/desarrollo-software.md`.

### 4. Verificar
- Compila JSX (Babel/Node), `node --check` para JS, tests con mocks, y **`/audit-connections`** para enlaces y la conexión admin↔tienda.
- Nada se declara terminado sin evidencia citada.

### 5. Registrar aprendizajes (cierre obligatorio)
- **Si hubo un error y el usuario lo corrigió** → escribe la lección en **`aprendizajes.md`** (qué pasó, por qué, cómo evitarlo).
- **Si aprendiste algo del sistema o de la forma de operar del usuario** → guárdalo en **memoria** (`feedback`/`user`), no solo aquí.
- Si cambió un invariante o una trampa de despliegue → actualiza `CLAUDE.md` y el skill `variedades-dianery`.

## Reglas de aprendizaje continuo
- Cada corrección del usuario es una señal: regístrala una sola vez, en el lugar correcto (memoria para lo durable/transversal; `aprendizajes.md` para lo técnico del repo).
- Antes de proponer algo, comprueba que no contradice un aprendizaje o preferencia ya guardada.
- Convierte fechas relativas a absolutas al guardar.
- No registres lo obvio ni lo que el repo ya documenta; registra lo **no evidente** que evita repetir el error.

## Qué NO hacer
- Empezar a codear sin haber enrutado con el equipo y planeado.
- Declarar "funciona" sin verificación.
- Repetir un error que ya está en `aprendizajes.md`.
- Dejar una corrección del usuario sin registrar.
