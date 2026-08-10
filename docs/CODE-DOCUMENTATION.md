# Documentación de código (JSDoc / TSDoc)

Estándar para documentar el código de este proyecto (JS client-side, sin overengineering).

## Regla mínima

Todo símbolo **público** (exportado, o parte de la API del prototipo) lleva docstring.
Símbolos internos/privados: comentario corto solo si la intención no es obvia.

## JSDoc (JavaScript vanilla)

```js
/**
 * Simula un bucket S3 en memoria.
 * @param {string} name - Nombre del bucket.
 * @returns {Bucket} Instancia del bucket.
 */
export function createBucket(name) {
  // ...
}
```

Tipos comunes: `@param {type} nombre - desc`, `@returns {type}`, `@typedef`, `@throws`, `@example`.

## TSDoc (si se migra a TypeScript)

Misma sintaxis que JSDoc pero estandarizado por [tsdoc.org](https://tsdoc.org/).
Permite que distintas tools extraigan la doc sin confundirse.

## Por qué

- IDE muestra tipos y ayuda sin leer el cuerpo.
- Graphify y otras tools parsean los docstrings para el grafo.
- Menos comentarios narrativos: el código tipo FIRST/SOLID se autodocumenta; el docstring aclara el *contrato*, no la implementación.
