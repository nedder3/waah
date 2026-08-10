# Contributing

Reglas para contribuir a este proyecto (aplica a Cy y a humanos).

## Commits

Formato [Conventional Commits](https://www.conventionalcommits.org/) con **scope** del proyecto:

```
feat(waah): agregar simulación de S3
fix(waah): corregir parseo de credenciales
docs(waah): actualizar README
test(waah): cubrir edge case de cola SQS
chore: actualizar dependencias
```

Tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `chore`.
`BREAKING CHANGE:` en el body para cambios mayores.

## TDD

Tests antes de declarar hecho. Verificar con `hermes verify`.

## Documentación de código

Todo símbolo público lleva docstring JSDoc/TSDoc. Ver [`docs/CODE-DOCUMENTATION.md`](docs/CODE-DOCUMENTATION.md).

## Diagramas

Cy genera los diagramas en `diagramas/` (mermaid/canvas). No son artefactos sueltos: viven en el vault.
