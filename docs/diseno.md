# WAHH — Notas de diseño

Prototipo client-side que emula servicios de AWS en el navegador, deploy en
GitHub Pages, sin backend ni build.

## Principios
- **Sin build**: el navegador carga `src/` como ESM nativo. Lo que se testea es
  lo que se sirve.
- **Storage desacoplado**: los servicios NO tocan `localStorage` directamente.
  Reciben un `StorageAdapter` (en runtime `LocalStorageAdapter`, en tests
  `MemoryAdapter`).
- **Servicios puros**: toda la lógica vive en clases sin DOM; la UI es la única
  capa que manipula el DOM. Facilita TDD unitario.
- **Registry**: única fuente de verdad de qué servicios existen; la UI los
  enumera en lugar de hardcodear.

## Servicios planeados
1. S3-like (buckets + objetos) — **hecho**.
2. Store (Dynamo-like) — **hecho** (tablas con partition key, items JSON).
3. IAM-like.
4. Lambda-like.
5. EC2-like.

## Arquitectura de UI
- `app.js` es un **shell con tabs**: un tab por servicio registrado; cada servicio
  aporta su propia vista (`*-view.js`). El shell solo maneja el switch de tabs.
- `main.js` registra servicios (factory + namespace de storage) y sus vistas; no
  hay lógica de servicio en la UI.
- Cada vista es la única que toca el DOM de su servicio; los servicios siguen
  siendo clases puras y testeables sin navegador.

## TDD / verificación
- Tests con Vitest (`npx vitest run`).
- `hermes verify` como pasada de humo (detecta build/test/start y levanta el
  server estático).
- Commits `feat(waah): ...` solo cuando `hermes verify` es verde.
