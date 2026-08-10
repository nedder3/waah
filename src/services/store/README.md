# Servicio Store (base de datos DynamoDB-like)

Este módulo emula **Amazon DynamoDB**: una base de datos NoSQL de tablas con
una *clave de partición*.

## Qué hace
- `createTable(nombre, campoClave)` — define una tabla y cuál campo es la clave.
- `putItem(tabla, item)` — guarda un item; el item DEBE tener el campo clave.
- `getItem(tabla, valorClave)` — lee un item por su clave.
- `query(tabla, prefijo?)` — lista items ordenados por clave.

## Analogía junior
En una tabla de "usuarios" con clave `id`, cada item es `{id:"1", nombre:"Ana"}`.
Para buscar a Ana das `getItem('usuarios','1')`. No hay SQL: solo clave-valor.

## Dónde vive la lógica
`src/services/store/store.js` (clase `StoreService`). Vista en
`src/ui/store-view.js`. Ejercicios en `docs/exercises/store.*`.
