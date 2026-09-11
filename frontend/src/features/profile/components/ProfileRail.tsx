import { NavLink } from 'react-router'

import { PROFILE_SECTIONS } from '../sections'

/**
 * El riel de secciones del perfil: escritorio y tablet.
 *
 * **Es fijo y son íconos, sin abrir ni cerrar.** Antes se agrandaba para mostrar los nombres y
 * se achicaba para devolverle ancho a la tarjeta. Eso se fue junto con el tirador: con la
 * cabecera del perfil arriba, la pantalla ya tiene una figura que manda, y un riel que además
 * cambia de tamaño le mueve el piso a la tarjeta grande cada vez que alguien lo toca. Cuatro
 * íconos en una columna angosta no necesitan negociar nada.
 *
 * **Sin rótulo a la vista, el nombre igual está**: en el atributo `title` para quien usa el
 * mouse y en un texto que solo leen los lectores de pantalla. Un ícono sin nombre accesible es
 * un enlace mudo.
 *
 * **La sección activa se marca encendiendo el ícono.** Es lo único que hay para encender: una
 * línea debajo de un ícono suelto mide lo que el ícono y se lee como un subrayado roto.
 */
export default function ProfileRail() {
  return (
    /*
      `hidden md:flex`: en el celular las secciones van en una cinta arriba del contenido. Ver
      `ProfileTabs`. `self-start` es lo que deja que el riel mida su contenido en vez de
      estirarse hasta el alto de la tarjeta.

      `rounded-full` sobre una columna de 64 píxeles da las puntas completamente redondeadas,
      que es lo que corresponde a una figura tan flaca: con un radio menor quedan cuatro
      esquinas insinuadas que no se leen.
    */
    <nav
      aria-label="Secciones del perfil"
      className="glass-panel hidden shrink-0 flex-col gap-0.5 self-start rounded-full p-2.5 md:flex"
    >
      {PROFILE_SECTIONS.map((section) => (
        <NavLink
          key={section.to}
          to={section.to}
          title={section.label}
          className={({ isActive }) =>
            `flex items-center justify-center rounded-full p-3 transition-colors duration-300 ${
              isActive ? 'text-primary' : 'text-text-muted hover:text-text'
            }`
          }
        >
          <section.Icon className="h-5 w-5 shrink-0" />
          <span className="sr-only">{section.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
