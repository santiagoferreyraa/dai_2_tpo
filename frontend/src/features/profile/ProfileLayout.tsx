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

      **El desborde es visible en escritorio y eso es lo que hace falta**, no un descuido. Las
      tarjetas son de vidrio y su sombra se derrama 32 píxeles por fuera del borde; adentro de
      un contenedor que recorta, esa sombra se corta contra el borde invisible y queda una raya
      recta al costado. En el celular sí recorta, porque ahí este contenedor es el que scrollea,
      y el `px-5` le deja a la sombra más lugar del que ocupa.
    */
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-6 pb-36 md:gap-5 md:overflow-visible md:px-6 md:pt-6 md:pb-10">
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
