# WAHH — We Have AWS At Home

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/richardlitt/standard-readme)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-2ea44f?style=flat-square)](https://nedder3.github.io/waah/)
[![tests](https://img.shields.io/badge/tests-vitest-15c213?style=flat-square)](https://vitest.dev/)

> Emulador client-side de servicios de AWS, ejecutado íntegramente en el navegador. "We have AWS at home": simula S3, un store de objetos y más, sin backend ni base de datos.

## Tabla de contenidos

- [Background](#background)
- [Instalación](#instalación)
- [Uso](#uso)
- [Arquitectura y diagramas](#arquitectura-y-diagramas)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

## Background

Inspirado en [`floci`](https://github.com/nedder3/floci) (emulador local de AWS, Java/Maven/Docker), pero **reimplementado en JS puro** como prototipo de viabilidad. El objetivo es validar la idea siendo 100% client-side: todo corre en el browser, la persistencia es `localStorage`/JSON en memoria, y el deploy es GitHub Pages sin build.

Decisiones de diseño:
- Sin backend, sin Docker, sin base de datos.
- Stack ligero: JS vanilla (ES modules) + Vitest para TDD.
- Si el prototipo demuestra valor, se migra al stack pertinente.

## Instalación

No requiere build. Para desarrollar en local:

```bash
git clone https://github.com/nedder3/waah.git
cd waah
npm install
npm run dev        # sirve con server.mjs (node)
```

Para ver el prototipo: abrir `index.html` (o el server de dev) en el navegador.

## Uso

```bash
npm test           # corre la suite (vitest run)
npm run verify     # hermes verify: valida TDD y convenciones
```

Ejemplo de uso de la API en memoria (ver `src/`):

```js
import { createBucket } from './src/services/s3/s3.js';
const bucket = createBucket('mi-bucket');
```

## Arquitectura y diagramas

Estructura actual (`src/`):
- `core/` — `registry.js` (registro de servicios), `storage.js` (persistencia localStorage).
- `services/s3/` — emulación de S3.
- `services/store/` — store de objetos.
- `ui/app.js` — capa de interfaz.

Los **diagramas de flujo/mecanismo** los genera Cy en [`diagramas/`](diagramas/) (mermaid `.mmd` / JSON Canvas de Obsidian). Una figura = una afirmación. Se ven en Obsidian o se renderizan desde el vault.

## Contribuir

Leer [CONTRIBUTING.md](CONTRIBUTING.md). Resumen:
- Commits conversacionales con scope: `feat(waah): ...`, `fix(waah): ...`, `docs(waah): ...`
- TDD obligatorio (Vitest), verificar con `npm run verify`.
- JSDoc/TSDoc en todo símbolo público (ver [`docs/CODE-DOCUMENTATION.md`](docs/CODE-DOCUMENTATION.md)).

## Licencia

[MIT](LICENSE) © nedder3
