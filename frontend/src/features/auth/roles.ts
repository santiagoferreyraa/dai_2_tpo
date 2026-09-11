import type { Role } from './types'

/**
 * Cómo se lee cada rol en pantalla.
 *
 * **El enum viaja en inglés técnico; el usuario no.** `CONDUCTOR`, `CPO` y `ADMIN` son el
 * contrato del JSON —ver `types.ts`—, y mostrarlos tal cual deja al usuario leyendo una sigla
 * interna: "CPO" no dice nada fuera del backend.
 *
 * Vive en la feature Auth y no en el componente que lo usa porque lo muestran dos pantallas de
 * features distintas —la ficha de la navegación y el perfil— y ya pasó lo que pasa cuando cada
 * una se escribe su tabla: una traducía y la otra no.
 */
const ROLE_LABEL: Record<Role, string> = {
  CONDUCTOR: 'Conductor',
  CPO: 'Operador',
  ADMIN: 'Administrador',
}

export function roleLabel(role: Role): string {
  return ROLE_LABEL[role]
}
