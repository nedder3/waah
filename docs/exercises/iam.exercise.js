// Ejercicios de IAM — completá y verificá con iam.test.js.

export function ej1_usuarioYRol(iam) {
  // REEMPLAZÁ ESTO: creá usuario "ana" y rol "admin" con política Allow *.
  iam.createUser('ana');
  iam.createRole('admin');
  iam.putPolicy('admin', { statements: [{ effect: 'Allow', action: '*', resource: '*' }] });
}

export function ej2_adjuntar(iam) {
  // REEMPLAZÁ ESTO: attachá "admin" a "ana" y devolvé los roles de ana.
  iam.attachRole('ana', 'admin');
  return iam.rolesOf('ana');
}

export function ej3_separar(iam) {
  // REEMPLAZÁ ESTO: creá rol "lector" (Allow read) y attachalo a ana.
  // Devolvé la cantidad de roles de ana (debe ser 2).
  iam.createRole('lector');
  iam.putPolicy('lector', { statements: [{ effect: 'Allow', action: 'read', resource: '*' }] });
  iam.attachRole('ana', 'lector');
  return iam.rolesOf('ana').length;
}
