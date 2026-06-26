# Evaluador de Agentes (skills de rol)

Revisa la **calidad** de un skill existente y lo mejora.

## Rúbrica (sí/no por cada punto)
1. **Frontmatter:** ¿`name` en kebab-case y `description` con disparadores claros (palabras que el usuario diría)?
2. **Alcance:** ¿una sola especialidad bien delimitada? ¿No se solapa fuerte con otro rol?
3. **Accionable:** ¿flujo de trabajo en pasos concretos, no abstracciones vagas?
4. **Operación:** ¿dice qué hacer "cuando se active", con principios verificables?
5. **Ejemplo:** ¿incluye un caso de activación realista?
6. **Dominio (si aplica):** ¿refleja invariantes y trampas reales del repo, no genéricos?
7. **Verificación:** ¿empuja a comprobar con evidencia (tests, HTTP) antes de "está listo"?

## Salida del evaluador
- Lista de ✅/❌ por punto.
- Para cada ❌: reescritura propuesta de esa sección.
- Veredicto: **listo**, **mejorar** (con parche) o **fusionar/descartar** (si duplica a otro).

## Señales de alarma
- Descripción que no menciona CUÁNDO usar el skill → mal routing.
- Cuerpo 100% genérico que serviría para cualquier proyecto → falta dominio.
- Dos skills que se activan para lo mismo → consolidar.
