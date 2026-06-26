# Índice de Skills — Equipo de Trabajo (Variedades Dianery)

Registro maestro de los skills disponibles en este proyecto. Cada skill define un **rol profesional** que Claude puede adoptar, o una **herramienta** reutilizable.

- **Ubicación:** `.claude/skills/<slug>/SKILL.md` (una carpeta por skill).
- **Invocar:** escribe `/<slug>` en el chat (ej. `/ingeniero-frontend`).
- Este `README.md` es solo referencia (no es un `SKILL.md`, no se carga como skill).

> **Skill de dominio:** [`variedades-dianery`](variedades-dianery/SKILL.md) — arquitectura, invariantes y trampas de despliegue de ESTA tienda. Invócalo con `/variedades-dianery` antes de tocar código aquí.
> **Herramienta:** [`audit-connections`](audit-connections/SKILL.md) — audita enlaces, URLs y la conexión admin↔tienda (el caso "se desactiva en admin pero sigue en la tienda").

---

## Coordinación — el "equipo"
| slug | Cuándo usar |
|------|-------------|
| `orquestador-equipo` | Coordinar varios roles, dividir tareas, integrar resultados |
| `planificador-proyectos` | Estructurar el trabajo, fases, roadmap |
| `director-tecnico-ia` | Decisiones técnicas estratégicas, estándares |
| `product-manager` | Priorizar features, alcance, valor de negocio |

## Arquitectura
`arquitecto-software` · `arquitecto-sistemas` · `arquitecto-cloud`

## Desarrollo
`ingeniero-software` · `ingeniero-frontend` · `ingeniero-backend` · `ingeniero-fullstack` · `ingeniero-api` · `ingeniero-mobile`

## Datos & ML
`ingeniero-datos` · `analista-datos` · `cientifico-datos` · `ingeniero-machine-learning`

## Inteligencia Artificial
`especialista-inteligencia-artificial` · `ingeniero-modelos-ia` · `investigador-ia`

## Infraestructura & Calidad
`ingeniero-devops` · `ingeniero-cloud` · `ingeniero-plataforma` · `ingeniero-automatizacion` · `ingeniero-qa` · `ingeniero-testing-automatizado`

## Seguridad
`especialista-ciberseguridad` · `analista-seguridad` · `ingeniero-seguridad-aplicaciones`

## Análisis & Diseño
`analista-sistemas` · `analista-innovacion` · `especialista-ux` · `investigador-tecnologico`

---

## Más relevantes para ESTE proyecto (tienda sin build + PHP en Hostinger)
1. `/variedades-dianery` — siempre primero (contexto del repo).
2. `/ingeniero-frontend` — React sin bundler, componentes, responsive.
3. `/ingeniero-backend` — `api.php`, sincronización, persistencia.
4. `/especialista-ux` — catálogo, carrito, conversión.
5. `/ingeniero-devops` — despliegue Hostinger, CI/CD, caché.
6. `/audit-connections` — verificar que todo conecte de extremo a extremo.

## Meta-herramientas (`.claude/evolution/`)
Para hacer crecer el propio equipo: `generador-agentes`, `evaluador-agentes`, `optimizador-skills`. Ver [`../equipo.md`](../equipo.md).

## Skills externos en tu usuario (referencia)
- **Codex** (`~/.codex/skills/.system/`): `imagegen`, `openai-docs`, `plugin-creator`, `skill-creator`, `skill-installer`.
- **Claude (usuario, global):** `audit-connections` (también incluido aquí en el proyecto).
