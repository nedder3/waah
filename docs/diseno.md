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
3. IAM-like — **hecho** (usuarios, roles, policies, attach/detach).
4. Lambda-like — **hecho** (funciones + log de invocación simulado).
5. EC2-like — **hecho** (instancias con ciclo de vida running/stopped/terminated).

Todos los servicios son clases puras sobre `StorageAdapter` y se registran en
`main.js` con su vista. La UI es un shell con tabs.

## Arquitectura de UI
- **Feature-modules:** cada servicio vive en `src/services/<id>/` con su
  `index.js` que exporta `{ id, name, description, ServiceClass, render }`.
  `src/services/index.js` agrega `SERVICES = [s3, store, iam, lambda, ec2]`.
  Añadir un servicio = crear la carpeta + una línea en `SERVICES`; nada más.
- `main.js` recorre `SERVICES` y registra cada uno en el `ServiceRegistry`.
  No tiene imports por servicio ni llamadas `bind` repetidas.
- `app.js` es un **shell con tabs** que NO conoce servicios específicos: lee
  `registry.list()` para pintar un tab por servicio y `registry.create(id, adapter)`
  + `def.render` para montar la vista. El `ServiceRegistry` es la única fuente.
- **Helper de vista:** `src/ui/crud-view.js` (`renderCrudView`) renderiza la
  forma común (form + lista + delete + empty state) desde una config. Las 5
  vistas (`*-view.js`) son finas: llaman al helper para la lista principal y
  agregan el sub-panel específico (objetos S3, items Store, roles IAM,
  invocación Lambda, start/stop EC2) vía `rowActions` / `onChange` / `onReady`.
- Cada vista es la única que toca el DOM de su servicio; los servicios siguen
  siendo clases puras y testeables sin navegador.

## TDD / verificación
- Tests con Vitest (`npx vitest run`).
- `hermes verify` como pasada de humo (detecta build/test/start y levanta el
  server estático).
- Commits `feat(waah): ...` solo cuando `hermes verify` es verde.
