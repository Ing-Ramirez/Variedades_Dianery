---
name: afinar-pedido
description: Refina internamente el pedido del usuario ANTES de ejecutarlo — lo reformula en un spec preciso, detecta ambigüedades y supuestos, y define el criterio de éxito. Úsalo como paso 0 de cualquier tarea de código/config/deploy, especialmente cuando el pedido es corto o informal ("oculta esto", "no funciona", "mejóralo").
---

# Afinar el pedido (paso 0 — antes de planear)

El usuario suele pedir en español, corto e informal, a veces con una captura. Antes de enrutar o planear, **convierte el pedido en un spec claro**. Esto NO es pedir permiso ni alargar: es entender bien para no construir lo equivocado.

## Procedimiento (rápido, mental, 20–40s)

1. **Reformula** el pedido en 1–2 frases precisas: **objetivo · alcance · dónde (archivo/área) · criterio de éxito**.
   - Ej. "no funciona el botón ver tienda" → "El `<a>` 'Ver tienda' del admin debe abrir la tienda en producción; hoy apunta a un archivo inexistente. Hecho = clic abre `variedadesdianery.com` (HTTP 200)."
2. **Usa el contexto/captura** para inferir el QUÉ real. Señala el elemento concreto, no una interpretación amplia.
3. **Detecta vacíos y ambigüedad:** ¿hay más de una lectura razonable? ¿falta un dato que cambia el resultado?
4. **Decide:**
   - Si la decisión es **del usuario y cambia el resultado** (alcance, seguridad, algo difícil de revertir) → **una** pregunta concreta con `AskUserQuestion`.
   - Si hay un **default sensato** → asume, **declara el supuesto en una línea** y sigue. No sobre-preguntes.
5. **Fija el criterio de "hecho"** con evidencia (compila, test, HTTP 200, captura).
6. Recién entonces pasa a la Fase 1 (enrutar con skills) y Fase 2 (planear) del [protocolo](../../protocolo.md).

## Anti-patrones a evitar
- **Sobre-interpretar:** convertir "oculta esto" en un rediseño. Oculta exactamente lo señalado.
- **Sub-interpretar:** arreglar el síntoma sin entender la causa (ej. "no se ve el cambio" casi siempre fue **caché**, no el código).
- **Preguntar lo obvio:** si el repo o el contexto ya lo responden, no preguntes; asume y declara.
- **Asumir lo crítico:** no inventes alcance en algo irreversible o de seguridad — ahí sí pregunta.

## Salida del paso 0 (qué dejar visible)
Una línea de "Entiendo que…" con el spec reformulado (+ supuestos si los hay). Si preguntaste, espera la respuesta antes de planear. Esto mejora el pedido **internamente** y deja claro el blanco antes de gastar trabajo.
