import { NavLink } from 'react-router'

import { PROFILE_SECTIONS } from '../sections'

/**
 * Las mismas secciones del perfil, en el celular: una cinta que se arrastra, arriba del
 * contenido.
 *
 * **No es el riel achicado.** Un riel vertical de íconos solos, al lado de una columna de
 * tarjetas del ancho de un teléfono, se come el poco ancho que hay y encima deja cinco dibujos
 * sin nombre justo donde no hay lugar para un rótulo al lado. Acostada, la cinta gasta alto —que
 * sobra, porque la pantalla scrollea— en vez de ancho, y cada sección puede decir su nombre.
 *
 * Se desborda a los costados con `-mx-5` a propósito: cortada contra el margen se lee como una
 * lista que se quedó sin lugar, y tocando los bordes se lee como una fila que sigue.
 */
export default function ProfileTabs() {
  return (
    <nav
      aria-label="Secciones del perfil"
      /*
        La barra de scroll se saca a mano porque no hay utilidad de Tailwind: una raya clara
        debajo de cinco fichas, en el medio de la pantalla, se lee como un elemento más.
      */
      className="-ml-5 flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 pl-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden"
    >
      {PROFILE_SECTIONS.map((section) => (
        <NavLink
          key={section.to}
          to={section.to}
          className={({ isActive }) =>
            `glass-panel flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'border-primary/60 text-primary' : 'text-text-muted'
            }`
          }
        >
          <section.Icon className="h-4.5 w-4.5" />
          {section.label}
        </NavLink>
      ))}
    </nav>
  )
}
