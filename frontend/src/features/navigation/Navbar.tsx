import MobileNav from './MobileNav'
import SideRail from './SideRail'
import TopBar from './TopBar'

/**
 * La navegación de la aplicación, en sus dos formas.
 *
 * Son **la misma navegación** —las secciones salen de `navSections.tsx`— repartida distinto
 * según el tamaño de la pantalla:
 *
 * - En escritorio y tablet son dos piezas flotantes: el riel de íconos a la izquierda y la
 *   franja de arriba con la marca, el tema y el perfil. Separarlas deja el centro entero para
 *   el contenido.
 * - En el celular es una sola barra abajo, al alcance del pulgar, con las cinco secciones
 *   —perfil incluido— porque ahí no sobra lugar para una franja aparte.
 *
 * Cada pieza se esconde con `md:` desde su propio archivo; acá no hay ninguna decisión, solo el
 * lugar donde `App.tsx` monta una línea en vez de tres.
 */
export default function Navbar() {
  return (
    <>
      <TopBar />
      <SideRail />
      <MobileNav />
    </>
  )
}
