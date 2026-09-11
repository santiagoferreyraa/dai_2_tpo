import { Outlet } from 'react-router'

import ProfileExit from './components/ProfileExit'
import ProfileHeader from './components/ProfileHeader'
import ProfileRail from './components/ProfileRail'
import ProfileTabs from './components/ProfileTabs'

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
 * En el celular es al revés: todo crece con lo que tenga adentro y la pantalla scrollea entera.
 */
export default function ProfileLayout() {
  return (
    /*
      El `px-6` y el `pt-6` son los mismos de la portada de escritorio, así que la cabecera
      arranca donde arranca el buscador de la franja de arriba y la pantalla se lee como una
      sola pieza.

      `pb-36` en el celular es el lugar de la barra de abajo, que flota sobre el contenido: sin
      eso, la última tarjeta termina debajo de ella y no hay forma de llegarle.

      **Este contenedor es el que scrollea, en las dos resoluciones**, y por eso la tarjeta de
      cada sección mide lo que mide su contenido en vez de estirarse hasta abajo: si el
      contenido no entra, lo que crece y scrollea es la página, no un recuadro con barra propia.

      El relleno de los costados no es solo aire: las tarjetas son de vidrio y su sombra se
      derrama unos píxeles por fuera del borde. Un contenedor que scrollea recorta contra su
      caja de relleno, así que sin esos veinticuatro píxeles la sombra quedaría cortada en una
      raya recta al costado de cada tarjeta.
    */
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-6 pb-36 md:gap-5 md:px-6 md:pt-6 md:pb-10">
      <ProfileHeader />

      <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row md:gap-5">
        {/*
          La columna de la navegación de la pantalla. Cambia de eje con el ancho y por eso es un
          solo envoltorio y no dos: en escritorio es el riel con el botón de salir debajo, y en
          el celular la cinta de secciones con ese mismo botón al final del renglón.
        */}
        <div className="flex shrink-0 items-center gap-3 md:flex-col md:items-start">
          <ProfileRail />
          <ProfileTabs />
          <ProfileExit />
        </div>

        <div className="min-h-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
