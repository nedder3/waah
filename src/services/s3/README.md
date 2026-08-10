# Servicio S3 (almacenamiento de objetos)

Este módulo emula **Amazon S3**: guardar archivos (objetos) dentro de buckets.

## Qué hace
- `createBucket(nombre)` — crea un bucket (como una "carpeta raíz" en la nube).
- `putObject(bucket, clave, cuerpo)` — guarda texto en una clave (ruta).
- `getObject(bucket, clave)` — lee lo que guardaste.
- `listObjects(bucket, prefijo?)` — lista objetos; `prefijo` filtra por ruta.
- `deleteObject` / `deleteBucket` — borran.

## Analogía junior
Un **bucket** es un disco; una **clave** es la ruta del archivo (`fotos/logo.png`);
el **cuerpo** es el contenido. No hay carpetas de verdad: la "carpeta" es parte
del nombre.

## Dónde vive la lógica
`src/services/s3/s3.js` (clase `S3Service`). La vista que lo muestra está en
`src/ui/s3-view.js`. No toques `s3.js` para aprender: usá la UI o los ejercicios
en `docs/exercises/s3.*`.
