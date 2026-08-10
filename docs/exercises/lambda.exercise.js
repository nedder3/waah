// Ejercicios de Lambda — completá y verificá con lambda.test.js.

export function ej1_crearFuncion(lambda) {
  // REEMPLAZÁ ESTO: creá función "procesar" con runtime "node18".
  lambda.createFunction('procesar', 'node18');
}

export function ej2_invocar(lambda) {
  // REEMPLAZÁ ESTO: invocá "procesar" con input {pedido: 42} y devolvé
  // el requestId del registro (fijate en el resultado de invoke).
  const res = lambda.invoke('procesar', { pedido: 42 });
  return res.requestId;
}

export function ej3_historial(lambda) {
  // REEMPLAZÁ ESTO: invocá 3 veces y devolvé la cantidad de invocaciones.
  lambda.invoke('procesar', { n: 1 });
  lambda.invoke('procesar', { n: 2 });
  lambda.invoke('procesar', { n: 3 });
  return lambda.invocationsOf('procesar').length;
}
