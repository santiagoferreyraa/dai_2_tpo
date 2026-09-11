import { useEffect, useRef, useState } from 'react'

import { useProfile } from '../data/useProfile'
import { HEADER_HEIGHT, HEADER_SHAPE, headerOutlinePath } from '../headerShape'
import ProfileIdentity from './ProfileIdentity'

/**
 * La cabecera del perfil: el redondel del avatar a la izquierda y la barra de datos a la
 * derecha, en una sola figura.
 *
 * **Está arriba de todo y se ve en las cuatro secciones**, no adentro de una de ellas. Es lo que
 * la convierte en la identidad de la pantalla: quien entra a medios de pago sigue viendo de
 * quién son esos medios de pago.
 *
 * **El redondel queda vacío a propósito.** No es para una foto propia: lo que va ahí es un
 * avatar de una lista para elegir, y esos avatares todavía no están. Dibujado vacío, el lugar
 * ya está tomado y la figura no cambia de forma cuando lleguen.
 *
 * El porqué de que sea un `path` y no dos cajas está en `headerShape.ts`.
 *
 * **En el celular esta figura no aparece.** Ahí va la misma información en una tarjeta común:
 * un redondel de 124 píxeles más una barra al lado no entran en el ancho de un teléfono sin
 * que el correo quede en cuatro renglones.
 */
export default function ProfileHeader() {
  const { profile, loading, error, save } = useProfile()

  const shellRef = useRef<HTMLElement>(null)
  const [width, setWidth] = useState(0)

  /* Un `path` se escribe en píxeles, así que el ancho se mide. Ver `headerShape.ts`. */
  useEffect(() => {
    const shell = shellRef.current
    if (shell === null) return

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })
    observer.observe(shell)
    return () => observer.disconnect()
  }, [])

  const { avatarRadius, slant } = HEADER_SHAPE

  return (
    <>
      <header
        ref={shellRef}
        style={{ height: HEADER_HEIGHT }}
        className="relative hidden shrink-0 md:block"
      >
        {/*
          El vidrio y el contorno, los dos con la misma silueta. Mientras no se midió el ancho no
          se dibuja nada: es un solo cuadro, y es preferible a mostrar la figura del tamaño
          equivocado.
        */}
        {width > 0 && (
          <div className="profile-shape__shadow pointer-events-none absolute inset-0">
            <div
              className="profile-shape__glass h-full w-full"
              style={{ clipPath: `path('${headerOutlinePath(width)}')` }}
            />
            <svg
              className="absolute inset-0"
              width={width}
              height={HEADER_HEIGHT}
              aria-hidden="true"
            >
              <path
                className="profile-shape__outline"
                d={headerOutlinePath(width)}
                fill="none"
                strokeWidth={1}
              />
            </svg>
          </div>
        )}

        {/*
          Lo escrito, por encima de la figura. El relleno de la izquierda es el diámetro del
          redondel más aire, y el de la derecha es la diagonal más aire: los dos salen de las
          medidas de la silueta, así que si la figura cambia, el texto se corre con ella en vez
          de quedar montado sobre una curva.
        */}
        <div
          className="relative flex h-full items-center"
          style={{ paddingLeft: avatarRadius * 2 + 24, paddingRight: slant + 28 }}
        >
          <ProfileIdentity profile={profile} loading={loading} error={error} save={save} />
        </div>
      </header>

      {/* La misma información en el celular, sin la figura. */}
      <section className="glass-panel flex items-center rounded-3xl p-5 md:hidden">
        <ProfileIdentity profile={profile} loading={loading} error={error} save={save} />
      </section>
    </>
  )
}
