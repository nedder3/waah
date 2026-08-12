# Tutorial WHAAH — aprendé AWS emulado

Este documento explica cada servicio de WHAAH: qué es en AWS real, qué emula la
maqueta y 2-3 ejercicios progresivos para practicar. Los ejercicios traen un
`*.test.js` stub en `docs/exercises/` que verifica tu solución con `npm run test`.

> Regla pedagógica: en `docs/exercises/<servicio>.exercise.js` hay funciones con
> una **solución de ejemplo** comentada como `// REEMPLAZÁ ESTO`. Para practicar,
> borrá la implementación y escribila vos; el `*.test.js` te dice si está bien.

---

## 1. S3-like  →  Amazon S3 (almacenamiento de objetos)

**En AWS real:** S3 guarda *objetos* dentro de *buckets*. Un objeto es un archivo
con una clave (ruta). Usás S3 para backups, sitios estáticos, datos de apps.
No es una carpeta de tu PC: es una API `PutObject` / `GetObject` / `ListObjects`.

**Qué emula WHAAH:** `S3Service` en `src/services/s3/`. Mismos conceptos:
`createBucket`, `putObject(bucket, key, body)`, `getObject`, `listObjects`,
`deleteObject`, `deleteBucket`. El "body" es texto (en AWS puede ser cualquier
bytes). La jerarquía de carpetas se simula con prefijos en la clave (`a/b/c.txt`).

**Ejercicios progresivos**
1. *Básico:* creá un bucket `fotos` y subí `logo.png` con el texto `"mi logo"`.
   Listá objetos y confirmá que aparece.
2. *Prefijos:* subí `2024/enero.png` y `2024/febrero.png`; listá solo los que
   empiezan con `2024/` usando el parámetro `prefix`.
3. *Limpieza:* borrá un bucket y confirmá que sus objetos desaparecen.

Stub: `docs/exercises/s3.test.js` (funciones en `s3.exercise.js`).

---

## 2. Store  →  Amazon DynamoDB (base de datos NoSQL)

**En AWS real:** DynamoDB es una base de datos NoSQL *clave-valor / documentos*.
Cada tabla tiene una **partition key** (clave de partición): debe existir en
cada item. Para leer un item, das la clave; para listar, escaneás.

**Qué emula WHAAH:** `StoreService` en `src/services/store/`. `createTable(name, keyField)`
define la clave de partición. `putItem(table, item)` exige que el item tenga
ese campo. `query(table, prefix)` lista items. Es DynamoDB en su forma más pura.

**Ejercicios progresivos**
1. *Tabla:* creá `usuarios` con partition key `id`; insertá `{id:"1", nombre:"Ana"}`.
2. *Lectura:* obtené el item `1` con `getItem` y verificá el nombre.
3. *Consulta:* insertá varios y listalos con `query`; confirmá el orden por clave.

Stub: `docs/exercises/store.test.js`.

---

## 3. IAM  →  AWS IAM (identidad y acceso)

**En AWS real:** IAM controla *quiénes* (usuarios) pueden hacer *qué* (roles +
policies). Un usuario se le "adjunta" un rol; el rol tiene un documento de
política con `statements: [{effect, action, resource}]`. Es el cerrojo de AWS.

**Qué emula WHAAH:** `IamService` en `src/services/iam/`. `createUser`,
`createRole`, `putPolicy(role, policy)`, `attachRole(user, role)`, `rolesOf(user)`.
Modelo simplificado pero fiel al concepto de "usuario → rol → permiso".

**Ejercicios progresivos**
1. *Usuario + rol:* creá usuario `ana` y rol `admin` con política `Allow *`.
2. *Adjuntar:* attachá `admin` a `ana` y confirmá `rolesOf('ana')` incluye `admin`.
3. *Separar:* creá `lector` (política `Allow read`) y adjuntalo; confirmá que
   `ana` ahora tiene dos roles.

Stub: `docs/exercises/iam.test.js`.

---

## 4. Lambda  →  AWS Lambda (funciones serverless)

**En AWS real:** Lambda corre código ante un evento, sin administrar servidores.
Subís una función (con un *runtime*, p.ej. `node18`); cuando la invocás, AWS
ejecuta tu código con un input y te devuelve un resultado + un `requestId`.

**Qué emula WHAAH:** `LambdaService` en `src/services/lambda/`. `createFunction(name, runtime)`
e `invoke(name, input)`. La invocación está **simulada** (no ejecuta JS real;
registra el evento y devuelve un `requestId`). Es suficiente para entender el
ciclo: crear → invocar → ver historial con `invocationsOf`.

**Ejercicios progresivos**
1. *Función:* creá `procesar` con runtime `node18`.
2. *Invocar:* invocala con `{pedido: 42}` y confirmá que `invocationsOf` tiene
   un registro con ese input.
3. *Historial:* invocala 3 veces y confirmá que `invocationsOf` devuelve 3
   registros.

Stub: `docs/exercises/lambda.test.js`.

---

## 5. EC2  →  Amazon EC2 (máquinas virtuales)

**En AWS real:** EC2 son servidores virtuales. Lanzás una instancia con un
*instance type* (p.ej. `t2.micro`); arranca en `running`, la podés `stop`,
`start` de nuevo, o `terminate` (se borra). Es tu "computadora en la nube".

**Qué emula WHAAH:** `Ec2Service` en `src/services/ec2/`. `launch(type)` devuelve
un id (`i-...`); `stop(id)`, `start(id)`, `terminate(id)`, `describe(id)`.
El estado vive en memoria/persistencia; no hay hardware real, pero el ciclo de
vida es idéntico.

**Ejercicios progresivos**
1. *Lanzar:* `launch('t2.micro')` y confirmá `describe(id).state === 'running'`.
2. *Parar/arrancar:* `stop` luego `start`; confirmá que vuelve a `running`.
3. *Terminar:* `terminate` y confirmá que `describe` devuelve `null`.

Stub: `docs/exercises/ec2.test.js`.

---

## Cómo verificar tus ejercicios

```bash
npm run test        # corre TODO, incluidos docs/exercises/*
```

Cada `*.test.js` de `docs/exercises/` importa las funciones de
`<servicio>.exercise.js` y comprueba el comportamiento pedido. Si pasa, tu
solución está bien. Si querés volver a la solución de ejemplo, restaurada con
`git checkout docs/exercises/`.
