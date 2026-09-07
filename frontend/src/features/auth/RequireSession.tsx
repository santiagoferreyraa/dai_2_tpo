import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'

import { useSession } from './session'
import type { Role } from './types'

interface RequireSessionProps {
  /** Si se indica, además de sesión hace falta uno de estos roles. */
  roles?: Role[]
  children: ReactNode
}

/**
 * Guard de las rutas privadas: sin sesión manda al login, y con el rol equivocado avisa.
 *
 * <p><b>Esto es experiencia de usuario, no seguridad, y conviene tenerlo clarísimo para la
 * defensa.</b> Cualquiera puede saltear este componente tocando el estado del navegador. Lo
 * que protege de verdad son los `@PreAuthorize` del backend, que corren en el servidor y
 * responden 403 aunque el front diga que sí. Este guard existe para que el usuario vea una
 * pantalla de login en vez de una aplicación donde cada botón falla sin explicación.
 */
export default function RequireSession({ roles, children }: RequireSessionProps) {
  const session = useSession()
  const location = useLocation()

  if (session === null) {
    /*
     * Se guarda a dónde quería ir para que el login lo devuelva ahí. `replace` evita que el
     * botón de atrás lo traiga de vuelta a una ruta que ya sabemos que va a rebotar.
     */
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles !== undefined && !roles.includes(session.role)) {
    /*
     * Con sesión pero sin el rol no se redirige al login: mandarlo a autenticarse a alguien
     * que ya está autenticado es un lazo que no lleva a ninguna parte. Se le dice que esa
     * pantalla no es para él.
     */
    return (
      <section className="flex h-full flex-col items-center justify-center gap-2 p-8">
        <h1 className="text-lg font-semibold">Esta sección no es para tu cuenta</h1>
        <p className="text-text-muted max-w-sm text-center text-sm">
          Entraste como <span className="font-medium">{session.email}</span>. Para administrar
          estaciones hace falta una cuenta de operador.
        </p>
      </section>
    )
  }

  return children
}
