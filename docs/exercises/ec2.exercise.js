// Ejercicios de EC2 — completá y verificá con ec2.test.js.

export function ej1_lanzar(ec2) {
  // REEMPLAZÁ ESTO: lanzá una instancia "t2.micro" y devolvé su id.
  return ec2.launch('t2.micro');
}

export function ej2_pararArrancar(ec2, id) {
  // REEMPLAZÁ ESTO: parala y volvela a arrancar; devolvé el estado final.
  ec2.stop(id);
  ec2.start(id);
  return ec2.describe(id).state;
}

export function ej3_terminar(ec2, id) {
  // REEMPLAZÁ ESTO: terminá la instancia y devolvé el resultado de describe (null).
  ec2.terminate(id);
  return ec2.describe(id);
}
