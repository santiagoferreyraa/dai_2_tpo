import DesktopHome from './components/DesktopHome'
import MobileHome from './components/MobileHome'

/**
 * La pantalla de entrada.
 *
 * Es lo primero que ve alguien que llega sin saber qué es esto, así que su trabajo es uno solo:
 * decir qué resuelve la aplicación y mandar al mapa, que es donde empieza todo lo demás (RF07).
 *
 * **Son dos portadas distintas, no una que se acomoda.** En el celular arriba de todo va el
 * saludo y el buscador, porque quien abre la aplicación en la calle quiere encontrar dónde
 * cargar; en pantalla grande hay lugar para el argumento largo, y ahí el buscador sobra porque el
 * mapa está a un clic en el riel. Ninguna de las dos es la otra con las columnas apiladas, así
 * que se escriben aparte.
 *
 * **La elección la hace el CSS y no un `useMediaQuery`.** Las dos pueden convivir en el árbol
 * porque ninguna pide datos ni atrapa el foco: la que sobra queda con `display: none`, que
 * también la saca del alcance de los lectores de pantalla. Decidirlo en JavaScript agregaría un
 * primer cuadro con la portada equivocada, y ataría este archivo a un hook que otra rama está
 * mudando de lugar.
 */
export default function HomePage() {
  return (
    <div className="relative flex-1 overflow-y-auto">
      <div className="md:hidden">
        <MobileHome />
      </div>

      <div className="hidden md:block">
        <DesktopHome />
      </div>
    </div>
  )
}
