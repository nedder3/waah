# Servicio Lambda (funciones serverless)

Este módulo emula **AWS Lambda**: funciones que corren ante un evento.

## Qué hace
- `createFunction(nombre, runtime)` — crea una función (p.ej. runtime `node18`).
- `invoke(nombre, input)` — la "ejecuta" con un input y devuelve un requestId.
- `invocationsOf(nombre)` — historial de invocaciones.

## Analogía junior
Lambda es "subí tu código, yo lo corro cuando me llaman". En WAHH la ejecución
está **simulada**: no corre JS real, solo registra el evento y te da un id.
Sirve para entender el ciclo crear → invocar → ver historial.

## Dónde vive la lógica
`src/services/lambda/lambda.js` (clase `LambdaService`). Vista en
`src/ui/lambda-view.js`. Ejercicios en `docs/exercises/lambda.*`.
