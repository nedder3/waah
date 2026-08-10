# Servicio IAM (identidad y acceso)

Este módulo emula **AWS IAM**: el cerrojo que decide quién puede hacer qué.

## Qué hace
- `createUser(nombre)` — crea un usuario.
- `createRole(nombre)` — crea un rol (un "sombrero" de permisos).
- `putPolicy(rol, política)` — adjunta permisos al rol.
- `attachRole(usuario, rol)` — le ponés el rol al usuario.
- `rolesOf(usuario)` — qué roles tiene ese usuario.

## Analogía junior
Un **usuario** es una persona. Un **rol** es un cartel ("admin" = hace todo).
Le das el cartel al usuario con `attachRole`. Si el usuario tiene el rol,
"puede" hacer lo que diga la política. Acá la política no se ejecuta de verdad:
solo se guarda y se muestra.

## Dónde vive la lógica
`src/services/iam/iam.js` (clase `IamService`). Vista en `src/ui/iam-view.js`.
Ejercicios en `docs/exercises/iam.*`.
