# Servicio EC2 (máquinas virtuales)

Este módulo emula **Amazon EC2**: servidores virtuales con ciclo de vida.

## Qué hace
- `launch(tipo)` — lanza una instancia y devuelve su id (`i-...`).
- `stop(id)` / `start(id)` — la parás / la volvés a arrancar.
- `terminate(id)` — la borrás (ya no existe).
- `describe(id)` — su estado actual (`running` / `stopped` / `null` si terminada).

## Analogía junior
Una instancia es una PC en la nube. `launch` la prende (arranca `running`),
`stop` la apagás, `start` la volvés a prender, `terminate` la tiras. Acá no hay
hardware: solo el estado guardado.

## Dónde vive la lógica
`src/services/ec2/ec2.js` (clase `Ec2Service`). Vista en `src/ui/ec2-view.js`.
Ejercicios en `docs/exercises/ec2.*`.
