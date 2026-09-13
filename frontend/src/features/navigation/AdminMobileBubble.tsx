import { NavLink, useLocation } from 'react-router'

import { useSession } from '@/features/auth/session'
import { KeyIcon } from './icons'

/**
 * Burbuja flotante para el acceso al Backoffice en vista móvil (`md:hidden`).
 *
 * Se muestra únicamente cuando el usuario autenticado posee rol `ADMIN`.
 * Se posiciona en la esquina superior derecha (`top-4 right-4`) con el ícono de llave.
 */
export default function AdminMobileBubble() {
  const session = useSession()
  const { pathname } = useLocation()

  if (session?.role !== 'ADMIN') return null

  const isActive = pathname.startsWith('/admin')

  return (
    <div className="fixed top-4 right-4 z-[1050] md:hidden">
      <NavLink
        to="/admin"
        aria-label="Acceder al Backoffice Administrador"
        className={`group flex h-12 w-12 items-center justify-center rounded-full border shadow-xl backdrop-blur-xl transition-all active:scale-95 ${
          isActive
            ? 'brand-fill border-primary text-on-primary shadow-primary/30'
            : 'border-border/80 bg-surface/90 text-primary hover:border-primary/50 hover:bg-surface'
        }`}
      >
        <KeyIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
      </NavLink>
    </div>
  )
}
