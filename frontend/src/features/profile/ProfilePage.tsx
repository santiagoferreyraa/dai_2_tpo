import { Link } from 'react-router'

import { displayNameFrom, useNavSession } from '@/features/navigation/useNavSession'

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
 * reemplaza entero: no hay nada acá que valga la pena conservar salvo la ruta.
 */
export default function ProfilePage() {
  const session = useNavSession()

  return (
    <section className="mx-auto w-full max-w-2xl px-6 pt-10 pb-32 md:pb-16">
      <h1 className="text-text text-2xl font-semibold">Perfil</h1>

      {session === null ? (
        <>
          <p className="text-text-muted mt-2 text-sm">
            Todavía no iniciaste sesión. Con una cuenta podés guardar tus tarjetas y reservar un
            conector.
          </p>
          {/* `/login` la trae ECO-36. Ver el comentario de `ProfilePill.tsx`. */}
          <Link
            to="/login"
            className="bg-primary text-background mt-6 inline-flex rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Iniciar sesión
          </Link>
        </>
      ) : (
        <dl className="border-border bg-surface mt-6 flex flex-col gap-3 rounded-xl border px-4 py-4">
          <div className="flex items-center justify-between">
            <dt className="text-text-muted text-sm">Nombre</dt>
            <dd className="text-text text-sm font-medium">{displayNameFrom(session.email)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-text-muted text-sm">Correo</dt>
            <dd className="text-text text-sm font-medium">{session.email}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-text-muted text-sm">Rol</dt>
            <dd className="text-text text-sm font-medium">{session.role}</dd>
          </div>
        </dl>
      )}
    </section>
  )
}
