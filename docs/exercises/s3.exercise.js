// Ejercicios de S3 — completá las funciones y verificalas con s3.test.js.
// Cada función trae una SOLUCIÓN DE EJEMPLO; borrala y escribila vos.
// La solución usa la API real de S3Service (ver src/services/s3/s3.js).

export function ej1_crearYSubir(s3) {
  // REEMPLAZÁ ESTO: creá bucket "fotos" y subí "logo.png" con body "mi logo".
  s3.createBucket('fotos');
  s3.putObject('fotos', 'logo.png', 'mi logo');
}

export function ej2_listarPrefijo(s3) {
  // REEMPLAZÁ ESTO: subí "2024/enero.png" y "2024/febrero.png",
  // devolvé los objetos que empiezan con "2024/" (usá listObjects(bucket, prefix)).
  s3.putObject('fotos', '2024/enero.png', 'a');
  s3.putObject('fotos', '2024/febrero.png', 'b');
  return s3.listObjects('fotos', '2024/');
}

export function ej3_borrarBucket(s3) {
  // REEMPLAZÁ ESTO: borrá el bucket y devolvé cuántos objetos quedan (debería ser 0).
  s3.deleteBucket('fotos');
  return s3.listObjects('fotos').length;
}
