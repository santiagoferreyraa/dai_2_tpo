import type { ReactNode } from 'react'

/**
 * El recuadro de vidrio de las pantallas del perfil.
 *
 * **Es la tarjeta de la portada sin su anatomía adentro.** `home/HomeCard` encierra además un
 * encabezado con ícono y un pie de dos columnas, porque sus tres tarjetas comparten esa forma;
 * las del perfil todavía no comparten ninguna —una lleva una ficha de datos, otra el auto, otra
 * una lista— así que lo único común es el vidrio, el radio y el relleno. Cuando dos de estas
 * pidan el mismo encabezado, la que se promueve a `components/` es aquella, no esta.
 *
 * El alto mínimo es lo que sostiene la disposición mientras las tarjetas están vacías: sin él,
 * un recuadro sin contenido mide cero y la pantalla se lee rota en vez de pendiente.
 */
interface ProfileCardProps {
  children?: ReactNode
  className?: string
}

export default function ProfileCard({ children, className = '' }: ProfileCardProps) {
  return (
    <article className={`glass-panel flex min-h-44 flex-col rounded-3xl p-6 ${className}`}>
      {children}
    </article>
  )
}
