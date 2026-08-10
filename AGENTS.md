# Proyecto WAHH — We Have AWS At Home

Prototipo client-side que simula servicios de AWS en el navegador. Fork conceptual de `floci` (emulador local de AWS, repo `nedder3/floci`, upstream `floci-io/floci`), pero **reimplementado en JS puro**, no se copia el código Java de floci.

## Contexto
- **Destino:** repo `nedder3/waah` (vacío, se puebla aquí).
- **Deploy:** GitHub Pages. Todo client-side, sin backend ni base de datos.
- **Persistencia:** solo `localStorage` o JSON en memoria. Nada de servidores.
- **Objetivo:** prototipo de viabilidad. Si funciona, se migra al stack pertinente (backend real).

## Stack
- JS vanilla o framework ligero (definir al iniciar). Sin build pesado si se puede.
- Sin frameworks de backend. Sin Docker (a diferencia de floci, que es Java/Maven/Docker).

## Estructura en el vault
- `src/` — código fuente del prototipo.
- `diagramas/` — diagramas de flujo/mecanismo (Cy los genera, mermaid/canvas).
- `docs/` — notas de diseño.

## Convenciones de commit y código (Cy)
- **Commits conversacionales con scope:** `feat(waah): ...`, `fix(waah): ...`, `chore: ...`, `test(waah): ...`, `docs(waah): ...`.
- **Código:** principios SOLID, FIRST. TDD obligatorio (tests antes de declarar hecho; verificar con `hermes verify`).
- El perfil default inicializa git + remote + commit inicial de setup; Cy hace los commits de código.
- TDD: tests antes de declarar hecho. Verificar con `hermes verify`.
- Diagramas en `diagramas/` (mermaid/canvas), regla de mecanismo-no-caja, sin wikilinks sueltos.
- Graphify: `/graphify .` para mapear el repo (output en `graphify-out/`, excluido del grafo).
- No asumir sintaxis de floci (Java); waah es JS client-side.

## Qué NO hacer
- No meter backend, Docker ni BD. Es prototipo client-side.
- No copiar código de floci (licencia MIT, pero el stack es distinto).
