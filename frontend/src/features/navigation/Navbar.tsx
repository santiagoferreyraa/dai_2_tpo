import DesktopNav from './DesktopNav'
import MobileNav from './MobileNav'

/**
 * La navegación de la aplicación, en sus dos formas.
 *
 * Son **la misma navegación** —las cinco secciones salen de `navSections.tsx`— dibujada de dos
 * maneras: arriba y con texto en escritorio, flotando abajo y con íconos en el celular. Cada
 * una se esconde con `md:` desde su propio archivo; acá no hay ninguna decisión, solo el
 * lugar donde `App.tsx` monta una línea en vez de dos.
 */
export default function Navbar() {
  return (
    <>
      <DesktopNav />
      <MobileNav />
    </>
  )
}
