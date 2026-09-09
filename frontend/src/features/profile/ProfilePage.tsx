import { Link } from 'react-router'

import { displayNameFrom, useNavSession } from '@/features/navigation/useNavSession'
import ThemeToggle from '@/features/theme/ThemeToggle'

/**
 * Pantalla de perfil, en su versión mínima.
 *
 * **Es un destino, no una feature.** El perfil es la quinta sección de la navegación, así que
 * el ícono del celular y la ficha de escritorio tienen que llevar a algún lado; sin esto
 * llevaban a una ruta inexistente. Lo que hay acá es lo que se puede decir con lo que hay en
 * `main`: quién está.
 *
 * **La pantalla de verdad la trae ECO-36** —con los datos del perfil, el cambio de contraseña
 * y el cierre de sesión—, junto con `features/auth`. Cuando eso mergee, este archivo se
 * reemplaza entero: no hay nada acá que valga la pena conservar salvo la ruta y el interruptor
 * de tema.
 *
 * **El interruptor de tema está acá además de en la franja de arriba, y no es una repetición
 * ociosa:** esa franja es solo de escritorio, así que en el celular esta pantalla es el ÚNICO
 * lugar desde donde se puede cambiar el tema. Se llega tocando "Perfil", que es donde cualquiera
 * busca los ajustes.
 */
export default function ProfilePage() {
  const session = useNavSession()

  return (
    <div className="flex-1 overflow-y-auto">
      <section className="mx-auto w-full max-w-2xl px-6 pt-8 pb-36 md:pb-12">
        <h1 className="text-text text-3xl font-extrabold tracking-tight">Perfil</h1>

        {session === null ? (
          <>
            <p className="text-text-muted mt-2 text-sm">
              Todavía no iniciaste sesión. Con una cuenta podés guardar tus tarjetas y reservar un
              conector.
            </p>
            {/* `/login` la trae ECO-36. Ver el comentario de `ProfilePill.tsx`. */}
            <Link
              to="/login"
              className="bg-primary text-background hover:bg-primary-strong mt-6 inline-flex rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
            >
              Iniciar sesión
            </Link>
          </>
        ) : (
          <dl className="glass-panel mt-6 flex flex-col gap-3 rounded-2xl px-4 py-4">
            <div className="flex items-center justify-between">
              <dt className="text-text-muted text-sm">Nombre</dt>
              <dd className="text-text text-sm font-semibold">{displayNameFrom(session.email)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-muted text-sm">Correo</dt>
              <dd className="text-text text-sm font-semibold">{session.email}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-muted text-sm">Rol</dt>
              <dd className="text-text text-sm font-semibold">{session.role}</dd>
            </div>
          </dl>
        )}

        <h2 className="text-text mt-10 text-sm font-semibold">Apariencia</h2>
        <div className="glass-panel mt-3 flex items-center justify-between rounded-2xl px-4 py-3">
          <div>
            <p className="text-text text-sm font-medium">Tema claro</p>
            <p className="text-text-muted mt-0.5 text-xs">
              Se guarda en este dispositivo. La primera vez sigue al sistema.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>
    </div>
  )
}
