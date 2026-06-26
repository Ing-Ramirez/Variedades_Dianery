# Optimizador de Skills

Afina el **conjunto** de skills para que el equipo sea coherente y el routing acierte.

## Qué optimiza
1. **Descripciones (routing):** que cada `description` tenga disparadores únicos. Si dos compiten por la misma intención, diferéncialas o fusiónalas.
2. **Cobertura:** detecta huecos (tareas frecuentes sin rol) → encarga uno a [`generador-agentes.md`](generador-agentes.md).
3. **Solapamientos:** roles que hacen casi lo mismo → fusionar y dejar un alias en el README.
4. **Consistencia de formato:** todos siguen la misma estructura de secciones.
5. **Índice al día:** [`../skills/README.md`](../skills/README.md) y [`../equipo.md`](../equipo.md) reflejan los skills reales en disco.

## Proceso
1. Lista los skills en disco (`ls .claude/skills/*/`).
2. Para cada uno, extrae `name` + `description`; agrúpalos por dominio.
3. Marca duplicados, huecos y descripciones débiles.
4. Aplica: fusiona, crea, o reescribe descripciones.
5. Regenera el índice del README y valida que cada `[[link]]` exista.

## Métrica de éxito
Dado un pedido típico del usuario, ¿hay **un** rol obvio que se activa? Si dudas entre dos, el set aún no está optimizado.
