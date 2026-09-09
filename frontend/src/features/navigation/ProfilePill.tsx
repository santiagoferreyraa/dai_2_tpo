import { Link } from 'react-router'

import { BoltIcon } from './icons'
import { PROFILE_SECTION } from './navSections'
import { displayNameFrom, useNavSession } from './useNavSession'

/**
 * La ficha del usuario, arriba a la derecha en escritorio y tablet.
 *
 * Son dos fichas de la misma forma y el mismo alto, una por estado de sesión. Que midan igual
 * de alto importa porque comparte la fila con el interruptor de tema: una ficha que crece al
 * iniciar sesión correría el interruptor de lugar y la franja daría un salto.
 *
 * **El cuadrado del rayo cambia de color con la sesión, y al revés de lo que parece.** Sin
 * sesión va en verde y con sesión en neutro: el verde es el color con el que la aplicación
 * pide acción, y la acción pendiente es justamente entrar. Una vez adentro no hay nada que
 * reclamar, así que el cuadrado se apaga y el verde queda libre para señalar en qué sección
 * estamos, que es lo único que sigue cambiando.
 *
 * El neutro es `bg-text` y no blanco fijo: en el tema oscuro `--color-text` ES casi blanco, que
 * es como se ve arriba, pero en el tema claro un cuadrado blanco sobre fondo blanco no se ve.
 * Atado al token, el cuadrado siempre contrasta contra su fondo.
 */

/** Cómo se lee cada rol en pantalla. El enum viaja en inglés técnico; el usuario no. */
const ROLE_LABEL = {
  CONDUCTOR: 'Conductor',
  CPO: 'Operador',
  ADMIN: 'Administrador',
} as const

/**
 * La forma que comparten los dos estados.
 *
 * Sin esquinas redondeadas, a propósito: es el único elemento anguloso de la barra y por eso
 * se lee como una ficha —algo con identidad— y no como un botón más.
 */
const SHELL =
  'glass-panel hover:border-primary/60 flex items-center gap-3 rounded-none py-1.5 pr-4 pl-1.5 transition-colors'

/** El cuadrado del rayo. También recto: sigue la forma de la ficha que lo contiene. */
const BOLT_SQUARE = 'text-background flex h-9 w-9 shrink-0 items-center justify-center'

export default function ProfilePill() {
  const session = useNavSession()

  if (session === null) {
    /*
      El destino es `/login`, que es una pantalla de la feature Auth (ECO-36) y **todavía no
      está en `main`**. El enlace se deja apuntando ahí igual: es la ruta correcta, y el día
      que auth mergee esto funciona sin tocar nada. Ver `useNavSession.ts`.
    */
    return (
      <Link to="/login" className={SHELL} aria-label="Iniciar sesión">
        <span className={`${BOLT_SQUARE} bg-primary`}>
          <BoltIcon className="h-4 w-4" />
        </span>
        <span className="text-text text-sm font-medium">Iniciar sesión</span>
      </Link>
    )
  }

  return (
    <Link to={PROFILE_SECTION.to} className={SHELL} aria-label={`Perfil de ${session.email}`}>
      <span className={`${BOLT_SQUARE} bg-text`}>
        <BoltIcon className="h-4 w-4" />
      </span>

      <span className="flex flex-col leading-tight">
        <span className="text-text text-sm font-medium">{displayNameFrom(session.email)}</span>
        {/*
          El rol debajo del nombre, en chico. Es lo que explica por qué dos cuentas ven
          pantallas distintas, y sin él un operador no tiene forma de saber con cuál entró.
        */}
        <span className="text-text-muted text-[11px]">{ROLE_LABEL[session.role]}</span>
      </span>
    </Link>
  )
}
