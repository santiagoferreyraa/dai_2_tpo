import { Navigate } from 'react-router'

import { useMediaQuery } from '@/lib/useMediaQuery'

/**
 * La entrada al perfil, `/profile`.
 *
 * En escritorio lleva a la primera sección: la cabecera y el riel ya están a la vista, así que la
 * ruta no tiene nada propio que mostrar. Es `replace` para que el botón de atrás no rebote.
 *
 * En el celular no dibuja nada: ahí `/profile` es la lista de secciones, y la dibuja
 * `ProfileLayout`. Redirigir la salteaba.
 */
export default function ProfileIndex() {
  const wide = useMediaQuery('(min-width: 768px)')
  return wide ? <Navigate to="reservations" replace /> : null
}
