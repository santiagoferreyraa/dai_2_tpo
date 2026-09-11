import { useNavigate } from 'react-router'

import { clearSession, useSession } from '@/features/auth/session'
import ThemeToggle from '@/features/theme/ThemeToggle'

import ProfileCard from './components/ProfileCard'

/**
 * La sección "Configuración": una sola tarjeta con las preferencias.
 *
 * **El interruptor de tema está acá y no es una repetición ociosa.** La franja de arriba, que
 * también lo tiene, es solo de escritorio: en el celular esta pantalla es el ÚNICO lugar desde
 * donde se puede cambiar el tema.
 *
 * **Y cerrar sesión también.** Estaba en la tarjeta de datos, que dejó de existir cuando esos
 * datos se mudaron a la cabecera. Su lugar es este: es lo último de los ajustes en cualquier
 * aplicación, y en el celular esta sigue siendo la única pantalla desde la que se sale.
 */
export default function SettingsPage() {
  const session = useSession()
  const navigate = useNavigate()

  function handleLogout() {
    clearSession()
    /* Al salir se vuelve a la portada: quedarse en una ruta privada dispararía el guard. */
    void navigate('/', { replace: true })
  }

  return (
    <div className="grid md:h-full">
      <ProfileCard>
        <h2 className="text-text text-sm font-semibold">Apariencia</h2>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-text text-sm font-medium">Tema claro</p>
            <p className="text-text-muted mt-0.5 text-xs">
              Se guarda en este dispositivo. La primera vez sigue al sistema.
            </p>
          </div>
          <ThemeToggle />
        </div>

        {session !== null && (
          <>
            <h2 className="text-text mt-8 text-sm font-semibold">Sesión</h2>
            <button
              type="button"
              onClick={handleLogout}
              className="glass-panel text-text hover:border-danger/60 mt-4 cursor-pointer self-start rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              Cerrar sesión
            </button>
          </>
        )}
      </ProfileCard>
    </div>
  )
}
