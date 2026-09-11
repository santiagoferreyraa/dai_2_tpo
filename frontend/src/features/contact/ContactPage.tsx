import { CONTACT_CHANNELS } from './contactDetails'
import ContactForm from './components/ContactForm'

/**
 * Pantalla de contacto.
 *
 * Una sola tarjeta centrada en la ventana, con dos columnas adentro: a la izquierda la
 * invitación y las formas de llegar a nosotros, a la derecha el formulario.
 *
 * **El reparto no es caprichoso: es lo que evita el hueco.** Con el formulario suelto de un lado
 * y solo un título del otro, la columna del título quedaba con media tarjeta vacía abajo. Los
 * datos de contacto ocupan justamente ese lugar, así que las dos columnas terminan midiendo
 * parecido y no queda aire de sobra en ninguna.
 *
 * **Los datos se muestran además del formulario, no en vez de.** Son el camino que no depende de
 * nada: quien no tenga un cliente de correo configurado —o simplemente prefiera escribir por su
 * cuenta— tiene la dirección a la vista. El formulario es la comodidad, no la única puerta.
 */
export default function ContactPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/*
        `min-h-full` junto con `items-center` es lo que centra la tarjeta en la ventana SIN
        romperse cuando no entra. Centrando contra una altura fija, un contenido más alto que la
        pantalla se desborda por arriba y esa parte queda inalcanzable, porque el scroll no llega
        a valores negativos. Con la altura mínima, el contenedor crece y el centrado se desactiva
        solo.

        `pb-36` en el celular es el lugar de la barra flotante de navegación.
      */}
      <div className="flex min-h-full items-center justify-center px-4 py-8 pb-36 md:px-8 md:pb-8">
        <div className="glass-panel w-full max-w-4xl rounded-3xl p-7 md:p-12">
          <div className="grid gap-10 md:grid-cols-2 md:gap-14">
            <section className="flex flex-col">
              {/*
                `leading-[1.1]` y no el `0.95` del título de la home. Allá las dos líneas no se
                estorban; acá la primera termina en "contarnos?" —con la cola de la p y la g
                bajando— y la segunda empieza con la T y la l de "Te leemos", que suben. Con el
                interlineado apretado las dos filas se tocan.
              */}
              <h1 className="text-text text-4xl leading-[1.1] font-extrabold tracking-tight text-balance md:text-5xl">
                ¿Algo para contarnos?
                <br />
                <span className="text-primary">Te leemos.</span>
              </h1>

              <p className="text-text-muted mt-5 text-sm leading-relaxed text-pretty">
                Un cargador que no responde, un cobro que no cierra, una estación que falta en el
                mapa. Escribinos y lo miramos.
              </p>

              {/*
                `md:mt-auto` empuja los datos al pie de la columna, a la altura del botón de
                enviar. Es lo que empareja las dos columnas: sin eso quedan pegados al párrafo y
                la mitad de abajo de la tarjeta se vacía.
              */}
              <dl className="mt-8 flex flex-col gap-4 md:mt-auto md:pt-10">
                {CONTACT_CHANNELS.map((channel) => (
                  <div key={channel.label} className="flex flex-col gap-0.5">
                    <dt className="text-text-muted text-xs font-medium">{channel.label}</dt>
                    <dd>
                      <a
                        href={channel.href}
                        className="text-text hover:text-primary text-sm font-semibold transition-colors"
                      >
                        {channel.value}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
