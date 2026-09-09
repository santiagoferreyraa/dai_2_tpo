/**
 * Pantalla de contacto.
 *
 * **Es deliberadamente chica.** La navegación tiene cinco secciones y esta es la única que no
 * tenía pantalla detrás: sin ella, el ítem de la barra llevaba a una ruta que no existe y en
 * la demo se veía como un error. Lo que hay acá alcanza para que el enlace signifique algo.
 *
 * **No hay formulario de contacto, y es a propósito:** un formulario promete que el mensaje
 * llega a alguien, y no hay endpoint que lo reciba. Mientras no exista, los datos de contacto
 * dicen la verdad y un formulario que no manda nada, no.
 */

interface ContactRow {
  label: string
  value: string
  href: string
}

const CONTACT_ROWS: ContactRow[] = [
  { label: 'Correo', value: 'soporte@ecopedia.com.ar', href: 'mailto:soporte@ecopedia.com.ar' },
  { label: 'Teléfono', value: '+54 11 5555-0100', href: 'tel:+541155550100' },
]

export default function ContactPage() {
  return (
    /*
      `pb-32` en el celular es el lugar de la barra flotante: sin eso, la última fila queda
      debajo de la navegación y no hay forma de scrollear más. En escritorio la barra está
      arriba y ocupa su propio alto, así que ese aire sobra.
    */
    <section className="mx-auto w-full max-w-2xl px-6 pt-10 pb-32 md:pb-16">
      <h1 className="text-text text-2xl font-semibold">Contacto</h1>
      <p className="text-text-muted mt-2 text-sm">
        ¿Un cargador que no responde, un cobro que no cierra? Escribinos y lo miramos.
      </p>

      <dl className="mt-8 flex flex-col gap-3">
        {CONTACT_ROWS.map((row) => (
          <div
            key={row.label}
            className="border-border bg-surface flex items-center justify-between rounded-xl border px-4 py-3"
          >
            <dt className="text-text-muted text-sm">{row.label}</dt>
            <dd>
              <a className="text-primary text-sm font-medium hover:underline" href={row.href}>
                {row.value}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
