# Generador de Agentes (skills de rol)

Proceso para **crear un nuevo rol** cuando el equipo no cubre una especialidad.

## Cuándo usarlo
Cuando una tarea recurrente no encaja en ningún `/<rol>` existente (ej. `/redactor-marketing`, `/especialista-seo`, `/contador`).

## Receta
1. **Nombra el rol** en kebab-case (`slug`): una especialidad, no una tarea puntual.
2. **Frontmatter** (lo más importante para el routing):
   ```markdown
   ---
   name: <slug>
   description: <UNA frase en presente: qué hace y CUÁNDO activarlo, con palabras que el usuario diría>
   ---
   ```
3. **Cuerpo** (modela sobre [`../skills/ingeniero-frontend/SKILL.md`](../skills/ingeniero-frontend/SKILL.md)): rol y objetivo · capacidades · conocimientos/herramientas · flujo de trabajo · instrucciones de operación · principios · ejemplo de activación.
4. **Guarda** en `.claude/skills/<slug>/SKILL.md`.
5. **Registra** en [`../skills/README.md`](../skills/README.md) y [`../equipo.md`](../equipo.md).
6. **Evalúa** con [`evaluador-agentes.md`](evaluador-agentes.md) antes de darlo por listo.

## Reglas
- Un rol = una especialidad clara. Si se solapa >70% con otro, extiende el existente.
- Cuerpo accionable, sin relleno genérico.
- Roles de dominio (atados al repo) → modela sobre [`../skills/variedades-dianery/SKILL.md`](../skills/variedades-dianery/SKILL.md): identidad, invariantes, trampas.
