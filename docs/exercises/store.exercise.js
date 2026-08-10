// Ejercicios de Store (DynamoDB) — completá y verificá con store.test.js.

export function ej1_crearTablaEInsertar(store) {
  // REEMPLAZÁ ESTO: creá tabla "usuarios" con keyField "id" e insertá {id:"1", nombre:"Ana"}.
  store.createTable('usuarios', 'id');
  store.putItem('usuarios', { id: '1', nombre: 'Ana' });
}

export function ej2_leerItem(store) {
  // REEMPLAZÁ ESTO: devolvé el nombre del item con id "1".
  return store.getItem('usuarios', '1').nombre;
}

export function ej3_insertarYListar(store) {
  // REEMPLAZÁ ESTO: insertá {id:"2", nombre:"Bob"} y {id:"3", nombre:"Cris"};
  // devolvé la cantidad de items en la tabla.
  store.putItem('usuarios', { id: '2', nombre: 'Bob' });
  store.putItem('usuarios', { id: '3', nombre: 'Cris' });
  return store.query('usuarios').length;
}
