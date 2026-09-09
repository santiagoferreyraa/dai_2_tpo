import { Link } from 'react-router'

import { BoltIcon } from './icons'
import { displayNameFrom, useNavSession } from './useNavSession'
import { PROFILE_SECTION } from './navSections'

/**
 * La ficha del usuario, a la derecha de la barra de escritorio.
 *
 * Son dos fichas del mismo tamaño y la misma forma, una por estado de sesión. Que midan igual
 * no es un detalle estético: la barra es una grilla de tres columnas y la del medio está
 * centrada contra las otras dos, así que una ficha que cambia de ancho al iniciar sesión
 * correría las cuatro secciones del centro.
 */

/** Cómo se lee cada rol en pantalla. El enum viaja en inglés técnico; el usuario no. */
const ROLE_LABEL = {
  CONDUCTOR: 'Conductor',
  CPO: 'Operador',
  ADMIN: 'Administrador',
} as const

/** La forma que comparten los dos estados: el rectángulo con borde y el cuadrado adentro. */
const SHELL =
  'border-border hover:border-primary/60 hover:bg-surface group flex items-center gap-2.5 rounded-xl border py-1.5 pr-4 pl-1.5 transition-colors'

export default function ProfilePill() {
  const session = useNavSession()

  if (session === null) {
    /*
      Sin sesión la ficha invita a entrar, y el cuadrado del rayo se apaga: en gris dice que
      todavía no hay nadie, sin cambiar de forma ni de tamaño.

      El destino es `/login`, que es una pantalla de la feature Auth (ECO-36) y **todavía no
      está en `main`**. El enlace se deja apuntando ahí igual: es la ruta correcta, y el día
      que auth mergee esto funciona sin tocar nada. Ver `useNavSession.ts`.
    */
    return (
      <Link to="/login" className={SHELL} aria-label="Iniciar sesión">
        <span className="bg-surface text-text-muted group-hover:text-primary flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
          <BoltIcon className="h-4 w-4" />
        </span>
        <span className="text-text text-sm font-medium">Iniciar sesión</span>
      </Link>
    )
  }

  return (
    <Link to={PROFILE_SECTION.to} className={SHELL} aria-label={`Perfil de ${session.email}`}>
      {/* El cuadrado del rayo: el único bloque de verde macizo de toda la barra. */}
      <span className="bg-primary text-background flex h-8 w-8 items-center justify-center rounded-lg">
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
