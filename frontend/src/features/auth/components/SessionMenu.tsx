import { Link, useNavigate } from 'react-router'

import { clearSession, useSession } from '../session'

/** Cómo se lee cada rol en pantalla. El enum viaja en inglés técnico; el usuario no. */
const ROLE_LABEL = {
  CONDUCTOR: 'Conductor',
  CPO: 'Operador',
  ADMIN: 'Administrador',
} as const

/**
 * El estado de la sesión en la cabecera: quién está y cómo salir.
 *
 * Vive en la feature Auth y no en `App.tsx` para que el layout raíz no tenga que saber nada de
 * sesiones: allá se monta una línea. Es la misma regla que hace que las pantallas no se
 * declaren en el archivo de rutas compartido.
 */
export default function SessionMenu() {
  const session = useSession()
  const navigate = useNavigate()

  if (session === null) {
    return (
      <Link className="text-text-muted hover:text-text text-sm font-medium" to="/login">
        Iniciar sesión
      </Link>
    )
  }

  function handleLogout() {
    clearSession()
    // Al salir se vuelve a la home: quedarse en una ruta privada dispararía el guard.
    void navigate('/', { replace: true })
  }

  return (
    <div className="flex items-center gap-4">
      {/*
        La única entrada a la pantalla de medios de pago, y por eso está en la cabecera y no
        enterrada en un menú: sin una tarjeta vigente el conductor no puede reservar ni cargar
        (RF02), así que tiene que poder llegar desde cualquier pantalla en la que se entere.

        Solo para conductores. Las tarjetas son suyas: al operador y al administrador la ruta
        les rebota en el guard, y ofrecerles un enlace a una pantalla que no pueden abrir sería
        prometer algo que no está.
      */}
      {session.role === 'CONDUCTOR' && (
        <Link className="text-text-muted hover:text-text text-sm font-medium" to="/payment-methods">
          Mis tarjetas
        </Link>
      )}

      <span className="text-text-muted hidden text-sm sm:inline">
        {session.email} · {ROLE_LABEL[session.role]}
      </span>
      <button
        className="border-border hover:bg-background rounded-lg border px-3 py-1.5 text-sm font-medium"
        type="button"
        onClick={handleLogout}
      >
        Salir
      </button>
    </div>
  )
}
