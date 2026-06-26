# Equipo de Trabajo — Variedades Dianery

Un equipo de **roles especializados** (skills) que Claude puede adoptar para trabajar este proyecto con más profundidad y consistencia. Cada rol es un `SKILL.md` en `.claude/skills/`. Se invocan con `/<slug>`.

## Cómo usar el equipo

1. **Siempre arranca con contexto:** `/variedades-dianery` carga la arquitectura, invariantes y trampas de despliegue del repo.
2. **Elige el rol según la tarea** (tabla abajo) o deja que `/orquestador-equipo` reparta el trabajo entre varios roles.
3. **Cierra verificando:** `/audit-connections` antes de dar algo por hecho (enlaces, URLs, admin↔tienda).

> Índice completo de roles: [`skills/README.md`](skills/README.md).

## Orquestación (cuándo entra cada quién)

```
Pides una feature
      │
      ▼
/orquestador-equipo  ── divide el problema y asigna ──┐
      │                                               │
      ▼                                               ▼
/planificador-proyectos (fases, alcance)     /product-manager (valor, prioridad)
      │
      ▼
/arquitecto-software → diseño    /especialista-ux → flujo y UI
      │                                  │
      ▼                                  ▼
/ingeniero-frontend  +  /ingeniero-backend  → implementación
      │
      ▼
/ingeniero-qa  +  /audit-connections → verificación
      │
      ▼
/ingeniero-devops → despliegue (Hostinger / GitHub Actions)
```

## Playbook — tareas comunes → roles

| Si vas a… | Invoca |
|-----------|--------|
| Tocar cualquier código del repo | `/variedades-dianery` (primero, siempre) |
| Cambiar catálogo, carrito, modal, responsive | `/ingeniero-frontend` |
| Tocar `api.php`, sincronización, persistencia | `/ingeniero-backend` |
| Mejorar conversión, layout, flujo de compra | `/especialista-ux` |
| Diseñar una feature grande end-to-end | `/orquestador-equipo` → roles |
| Desplegar / CI / caché / Hostinger | `/ingeniero-devops` |
| Revisar seguridad (XSS, datos expuestos, `api.php` abierto) | `/especialista-ciberseguridad` |
| Verificar enlaces/URLs/conexiones | `/audit-connections` |
| Planear roadmap o fases | `/planificador-proyectos` |
| Decidir entre enfoques técnicos | `/director-tecnico-ia` |

## Hacer crecer el equipo (meta-herramientas)

En [`evolution/`](evolution/):
- **`generador-agentes.md`** — crea un nuevo rol/skill cuando falte una especialidad.
- **`evaluador-agentes.md`** — revisa la calidad de un skill existente y lo mejora.
- **`optimizador-skills.md`** — depura y afina descripciones para que el routing acierte.

Base de conocimiento reutilizable en [`knowledge/`](knowledge/) y procesos en [`workflows/`](workflows/).

## Herramientas externas (en tu usuario)
- **Codex** (`~/.codex/skills/.system/`): `imagegen` (imágenes), `skill-creator`, `skill-installer`, `plugin-creator`, `openai-docs`.
- **Claude global** (`~/.claude/skills/`): `audit-connections` (también aquí en el proyecto).

> Estos skills viven en tu carpeta de usuario; este equipo en `.claude/` viaja **con el repo** (lo ven los colaboradores y futuras sesiones).
