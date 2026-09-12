import { useSession } from '@/features/auth/session'
import { SteeringWheelIcon } from '@/features/navigation/icons'

import { avatarSrc, useAvatarId } from '../avatars'

interface ProfileAvatarProps {
  /** El diámetro en píxeles. Lo decide quien lo dibuja: la figura de la cabecera lo saca de
   *  `HEADER_SHAPE`, y las demás pantallas eligen el que les entra. */
  size: number
  className?: string
  /**
   * Clases para el SUPLENTE nada más.
   *
   * Existe porque el volante y una cara no necesitan lo mismo: la ficha de la franja de arriba le
   * pone al volante un círculo verde detrás para que se lea como un avatar y no como un ícono al
   * lado del nombre, y ese mismo verde detrás de un dibujo que ya trae su propio fondo redondo no
   * se vería nunca. Metido en `className` habría que acordarse de pasarlo solo a veces, que es
   * justo lo que este componente existe para evitar.
   */
  placeholderClassName?: string
}

/**
 * El avatar del usuario, redondo, del tamaño que le pidan.
 *
 * **Es un componente y no una etiqueta `<img>` suelta** porque el mismo redondel aparece en tres
 * lugares —la figura de la cabecera, la tarjeta del celular y la ficha de la franja de arriba— y
 * los tres tienen que decidir igual qué mostrar cuando todavía no se eligió ninguno. Repetido a
 * mano, el día que cambie el suplente cambia en dos de los tres.
 *
 * **El suplente es el volante, no una inicial ni una silueta gris.** Es lo que ya estaba en la
 * ficha de la franja antes de que existiera el catálogo, y dice lo mismo que decía: quién sos y
 * que manejás. Una letra sobre un color sería un avatar más, y el punto es justamente que se
 * distinga un avatar elegido de uno que falta elegir.
 *
 * **El dibujo llena el redondel y se recorta.** Las imágenes del catálogo ya vienen redondas y
 * cuadradas de lienzo, así que `object-cover` no tiene nada que recortar hoy; está igual porque
 * es lo que garantiza que una cara con otra proporción se centre en vez de deformarse.
 */
export default function ProfileAvatar({
  size,
  className = '',
  placeholderClassName = '',
}: ProfileAvatarProps) {
  const session = useSession()
  const avatarId = useAvatarId(session?.userId ?? null)

  /* Un tamaño en píxeles no puede ser una clase de Tailwind: la figura de la cabecera lo saca de
     una constante y las clases se compilan mirando el código fuente. */
  const box = { width: size, height: size }

  if (avatarId === null) {
    return (
      <span
        style={box}
        aria-hidden="true"
        className={`text-text-muted flex shrink-0 items-center justify-center rounded-full ${className} ${placeholderClassName}`}
      >
        {/* La mitad del diámetro: el ícono tiene que leerse igual en un redondel de 124 que en
            uno de 36, y un tamaño fijo se pierde en el grande y desborda el chico. */}
        <SteeringWheelIcon className="h-[50%] w-[50%]" />
      </span>
    )
  }

  return (
    <img
      src={avatarSrc(avatarId)}
      alt=""
      /* Decorativo: al lado siempre está el nombre escrito, así que describir el dibujo sería
         repetir en voz alta algo que no agrega nada. */
      aria-hidden="true"
      style={box}
      className={`shrink-0 rounded-full object-cover ${className}`}
    />
  )
}
