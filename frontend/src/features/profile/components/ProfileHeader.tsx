import { useEffect, useRef, useState } from 'react'

import { useSession } from '@/features/auth/session'
import { EditIcon } from '@/features/navigation/icons'

import { editAnchor, HEADER_HEIGHT, HEADER_SHAPE, headerOutlinePath } from '../headerShape'
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
 * avatar de una lista para elegir, y esos avatares todavía no están. Dibujado vacío, el lugar ya
 * está tomado y la figura no cambia de forma cuando lleguen.
 *
 * El porqué de que sea un `path` y no dos cajas está en `headerShape.ts`.
 *
 * **En el celular esta figura no aparece.** Ahí va la misma información en una tarjeta común: un
 * redondel más una barra al lado no entran en el ancho de un teléfono sin que el correo quede en
 * cuatro renglones.
 */
export default function ProfileHeader() {
  const session = useSession()
  const [editing, setEditing] = useState(false)

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

  const { avatarRadius, barHeight, slant } = HEADER_SHAPE
  const outline = width > 0 ? headerOutlinePath(width) : ''

  /*
    El lápiz, colgado de la esquina de abajo a la derecha. Se dibuja acá y no adentro de
    `ProfileIdentity` porque su lugar lo decide la FIGURA: va centrado sobre el punto más
    saliente de esa esquina, así que queda mitad adentro del vidrio y mitad afuera. El punto lo
    calcula `editAnchor`, que lo saca del mismo contorno que se dibuja.

    **Es la esquina y no el medio del costado.** Ahí el botón se apoya sobre el vértice de la
    diagonal, que es el remate de la figura, en vez de partir el borde derecho por la mitad.

    Mientras se edita no está: ahí la barra tiene sus propios botones de guardar y cancelar, y
    un lápiz al lado no abre nada que no esté ya abierto.
  */
  const editButton = session !== null && !editing && (
    <button
      type="button"
      onClick={() => setEditing(true)}
      aria-label="Editar el perfil"
      className="text-on-brand brand-fill flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full"
    >
      <EditIcon className="h-4.5 w-4.5" />
    </button>
  )

  return (
    <>
      {/*
        **No llega hasta el borde derecho, y ese tope es la medida.** Los cuatro datos son cortos
        —un nombre, un correo, dos palabras— y estirados sobre un monitor ancho quedaban a medio
        metro unos de otros, con más vidrio vacío que texto en el medio. Con el ancho acotado, la
        barra termina donde termina lo que dice.

        Es un MÁXIMO y no una fracción: en un monitor ancho corta a poco menos de la mitad, y en
        una pantalla más chica la barra usa lo que haya en vez de encogerse hasta cortar el
        correo. La figura se redibuja sola con lo que mida, porque el ancho se mide.
      */}
      <header
        ref={shellRef}
        style={{ height: HEADER_HEIGHT }}
        className="relative hidden w-full max-w-[58rem] shrink-0 md:block"
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
              style={{ clipPath: `path('${outline}')` }}
            />
            <svg
              className="absolute inset-0"
              width={width}
              height={HEADER_HEIGHT}
              aria-hidden="true"
            >
              <path className="profile-shape__outline" d={outline} fill="none" strokeWidth={1} />
            </svg>
          </div>
        )}

        {/*
          Lo escrito, por encima de la figura. Va contra la barra —que es más baja que la
          figura— y no contra el alto entero, o el texto quedaría corrido hacia abajo respecto
          del borde recto de arriba.

          Los dos rellenos salen de las medidas de la silueta: a la izquierda el diámetro del
          redondel más aire, a la derecha lo que ocupan la diagonal y el lápiz. Si la figura
          cambia, el texto se corre con ella en vez de quedar montado sobre una curva.
        */}
        <div
          className="relative flex items-center"
          style={{
            height: barHeight,
            paddingLeft: avatarRadius * 2 + 20,
            paddingRight: slant + 24,
          }}
        >
          <ProfileIdentity editing={editing} onDone={() => setEditing(false)} />
        </div>

        {/* Centrado sobre la esquina de abajo a la derecha del contorno. Ver `editAnchor`. */}
        {width > 0 && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: editAnchor(width).x, top: editAnchor(width).y }}
          >
            {editButton}
          </div>
        )}
      </header>

      {/* La misma información en el celular, sin la figura. */}
      <section className="glass-panel flex items-center gap-4 rounded-3xl p-5 md:hidden">
        <ProfileIdentity editing={editing} onDone={() => setEditing(false)} />
        {editButton}
      </section>
    </>
  )
}
