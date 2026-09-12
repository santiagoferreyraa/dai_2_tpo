import { Link, Outlet, useLocation } from 'react-router'

import { ArrowLeftIcon } from '@/features/navigation/icons'
import { useMediaQuery } from '@/lib/useMediaQuery'

import ProfileExit from './components/ProfileExit'
import ProfileHeader from './components/ProfileHeader'
import ProfileRail from './components/ProfileRail'
import ProfileSectionList from './components/ProfileSectionList'
import { PROFILE_SECTIONS } from './sections'

/**
 * El marco de todas las pantallas del perfil: la cabecera arriba, y debajo las secciones a un
 * lado y su tarjeta al otro.
 *
 * **La cabecera está afuera del `<Outlet />` a propósito.** Es la identidad de la pantalla, no
 * el contenido de una sección: quien entra a medios de pago sigue viendo de quién son. Adentro
 * de cada sección habría que repetirla cuatro veces y se redibujaría en cada navegación, que es
 * justo lo que se nota cuando algo que no cambió parpadea.
 *
 * **El alto de abajo está definido y eso no es un detalle de estilo.** La tarjeta de la sección
 * ocupa lo que sobra después de la cabecera, y para eso necesita contra qué medirse: si esta
 * columna midiera su contenido, una tarjeta vacía mediría cero.
 *
 * **En el celular la parte de abajo es una cosa o la otra, nunca las dos.** En `/profile` va la
 * lista de secciones; en una sección, su recuadro grande en lugar de la lista, con una flecha
 * para volver. Como cada sección es una ruta, volver con el botón de atrás del teléfono también
 * devuelve a la lista. Por eso se decide con `useMediaQuery` y no con clases: la sección se
 * dibuja una sola vez, en la forma que corresponde, en vez de montarse dos veces y esconder una.
 */

/** A partir de acá, riel y tarjeta lado a lado. Es el `md` de Tailwind, el de la navegación. */
const WIDE_QUERY = '(min-width: 768px)'

export default function ProfileLayout() {
  const wide = useMediaQuery(WIDE_QUERY)
  const { pathname } = useLocation()
  const atIndex = pathname.replace(/\/$/, '') === '/profile'

  return (
    /*
      El `px-6` y el `pt-6` son los mismos de la portada de escritorio, así que la cabecera
      arranca donde arranca el buscador de la franja de arriba y la pantalla se lee como una
      sola pieza.

      `pb-36` en el celular es el lugar de la barra de abajo, que flota sobre el contenido: sin
      eso, el último renglón termina debajo de ella y no hay forma de llegarle.

      **En el celular este contenedor es el que scrollea**, y la tarjeta de cada sección mide lo
      que mide su contenido: si no entra, crece la página.

      **En PC y tablet no scrollea nada de afuera.** La cabecera y el riel quedan quietos y la
      tarjeta de la sección ocupa exactamente el alto que sobra de la ventana; si su contenido no
      entra, scrollea adentro de la tarjeta. Así lo que identifica la pantalla no se va nunca de
      vista por leer una sección larga.

      El relleno de los costados no es solo aire: las tarjetas son de vidrio y su sombra se
      derrama unos píxeles por fuera del borde. Un contenedor que scrollea recorta contra su
      caja de relleno, así que sin esos veinticuatro píxeles la sombra quedaría cortada en una
      raya recta al costado de cada tarjeta.
    */
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 pt-6 pb-36 md:gap-5 md:overflow-hidden md:px-6 md:pt-6 md:pb-6">
      <ProfileHeader />

      {wide ? (
        <div className="flex min-h-0 flex-1 flex-row gap-5">
          {/* La columna de la navegación de la pantalla: el riel con el botón de salir debajo. */}
          <div className="flex shrink-0 flex-col items-start gap-3">
            <ProfileRail />
            <ProfileExit />
          </div>

          {/*
            `min-w-0` junto al `min-h-0`, y por el mismo motivo en el otro eje: un elemento flexible
            no se achica por debajo de su contenido salvo que se lo permitan. Sin esto, una sección
            con algo ancho adentro —la tira de avatares de editar el perfil, sin ir más lejos—
            ensancha esta columna, después el riel de al lado, y la pantalla entera termina con una
            barra de scroll horizontal en vez de que lo ancho scrollee adentro de lo suyo.

            La tarjeta de la sección —el `<article>` de `ProfileCard`— toma el alto entero de esta
            columna y scrollea adentro. Se le pide desde acá y no en `ProfileCard` porque en el
            celular esa misma tarjeta tiene que medir su contenido.
          */}
          <div className="min-h-0 min-w-0 flex-1 [&>article]:h-full [&>article]:overflow-y-auto">
            <Outlet />
          </div>
        </div>
      ) : atIndex ? (
        <ProfileSectionList />
      ) : (
        <MobileSection pathname={pathname} />
      )}
    </div>
  )
}

/**
 * Una sección abierta en el celular: la flecha para volver con el nombre al lado, y el recuadro
 * grande con el contenido.
 *
 * El recuadro es la misma `ProfileCard` que usa cada sección en escritorio, estirado a buena parte
 * del alto de la pantalla: reemplaza a la lista entera, y un recuadro chico en su lugar dejaría la
 * mitad de abajo vacía y se leería como algo que no terminó de cargar.
 */
function MobileSection({ pathname }: { pathname: string }) {
  const label =
    PROFILE_SECTIONS.find((section) => pathname.startsWith(section.to))?.label ??
    (pathname.startsWith('/profile/edit') ? 'Editar perfil' : 'Perfil')

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center gap-3">
        {/*
          Un enlace a `/profile` y no un "atrás" del historial: si se entró directo a la sección
          —desde la franja de la reserva, por ejemplo—, atrás sacaría del perfil en vez de mostrar
          la lista.
        */}
        <Link
          to="/profile"
          aria-label="Volver a los ajustes"
          className="glass-panel text-text flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        >
          <ArrowLeftIcon className="h-4.5 w-4.5" />
        </Link>
        <h2 className="text-text min-w-0 truncate text-xl font-extrabold tracking-tight uppercase">
          {label}
        </h2>
      </div>

      <div className="[&>article]:min-h-[60svh]">
        <Outlet />
      </div>
    </div>
  )
}
