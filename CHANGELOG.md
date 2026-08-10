# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Conventional Commits](https://www.conventionalcommits.org/).

## [Unreleased]

### Added
- Scaffold del proyecto: `package.json` (ES modules, Vitest), `server.mjs` para dev.
- `src/core/registry.js` y `src/core/storage.js` (registro de servicios + persistencia localStorage), con tests.
- `src/services/s3/` — emulación de S3 en memoria, con tests.
- `src/services/store/` — store de objetos, con tests.
- `src/ui/app.js` — capa de interfaz.
- Set de documentación canónica: README (Standard Readme), CONTRIBUTING, CODE-DOCUMENTATION (JSDoc/TSDoc).
- Configuración de graphify watch para grafo automático y enrutamiento OmniRoute en el perfil Cy.
