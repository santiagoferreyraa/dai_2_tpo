import { CONTACT_CHANNELS } from './contactDetails'
import ContactForm from './components/ContactForm'

/**
 * Pantalla de contacto.
 *
 * Una sola tarjeta centrada en la ventana, con dos columnas adentro: a la izquierda la
 * invitación y el formulario, a la derecha las formas de llegar a nosotros. En el celular se
 * apila.
 *
 * La silueta de la tarjeta no es un rectángulo —tiene mordidas cóncavas en los costados— y eso
 * lo resuelve `.contact-panel` en `index.css`, no este archivo. Acá solo se pone la clase.
 *
 * **Los datos de contacto se muestran además del formulario, no en vez de.** Son el camino que no
 * depende de nada: quien no tenga un cliente de correo configurado —o simplemente prefiera
 * escribir por su cuenta— tiene la dirección a la vista. El formulario es la comodidad, no la
 * única puerta.
 */
export default function ContactPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/*
        `min-h-full` junto con `items-center` es lo que centra la tarjeta en la ventana SIN
        romperse cuando no entra. Centrando contra una altura fija, un contenido más alto que la
        pantalla se desborda por arriba y esa parte queda inalcanzable, porque el scroll no llega
        a valores negativos. Con la altura mínima, el contenedor crece y el centrado se
        desactiva solo.

        `pb-36` en el celular es el lugar de la barra flotante de navegación.
      */}
      <div className="flex min-h-full items-center justify-center px-4 py-8 pb-36 md:px-8 md:pb-8">
        <div className="contact-panel glass-panel w-full max-w-5xl p-7 md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:gap-20">
            <section>
              <h1 className="text-text text-4xl leading-[0.95] font-extrabold tracking-tight text-balance md:text-5xl">
                ¿Algo para contarnos?
                <br />
                <span className="text-primary">Te leemos.</span>
              </h1>

              <p className="text-text-muted mt-5 max-w-md text-sm leading-relaxed text-pretty">
                Un cargador que no responde, un cobro que no cierra, una estación que falta en el
                mapa. Escribinos y lo miramos.
              </p>

              <div className="mt-8">
                <ContactForm />
              </div>
            </section>

            <section className="flex flex-col lg:w-64">
              {/*
                La marca en grande y muy apagada ocupa el lugar que en el diseño de referencia
                tiene una ilustración. Es lo que hay: dibujar una ilustración propia es un trabajo
                aparte, y poner una prestada traería un problema de licencia por un adorno.

                `aria-hidden` porque no aporta nada que no diga el resto de la pantalla.
              */}
              <span
                aria-hidden="true"
                className="brand-mark bg-primary/15 hidden h-40 w-40 self-center lg:block"
              />

              <dl className="flex flex-col gap-4 lg:mt-auto">
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
          </div>
        </div>
      </div>
    </div>
  )
}
