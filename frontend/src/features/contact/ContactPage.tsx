import { CONTACT_CHANNELS } from './contactDetails'
import ContactForm from './components/ContactForm'

/**
 * Pantalla de contacto.
 *
 * Dos columnas en pantalla ancha: a la izquierda el título y las formas de llegar a nosotros, a
 * la derecha el formulario sobre vidrio. En el celular se apila, con el formulario abajo.
 *
 * **Los datos de contacto se muestran además del formulario, no en vez de.** Son el camino que no
 * depende de nada: quien no tenga un cliente de correo configurado —o simplemente prefiera
 * escribir por su cuenta— tiene la dirección a la vista. El formulario es la comodidad, no la
 * única puerta.
 */
export default function ContactPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* `pb-36` en el celular es el lugar de la barra flotante de navegación. */}
      <div className="mx-auto w-full max-w-6xl px-5 pt-8 pb-36 md:px-8 md:pt-10 md:pb-10">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <section className="lg:sticky lg:top-24">
            <h1 className="text-text text-4xl leading-[0.95] font-extrabold tracking-tight text-balance md:text-5xl lg:text-6xl">
              ¿Algo para contarnos?
              <br />
              <span className="text-primary">Te leemos.</span>
            </h1>

            <p className="text-text-muted mt-6 max-w-md text-sm leading-relaxed text-pretty md:text-base">
              Un cargador que no responde, un cobro que no cierra, una estación que falta en el
              mapa. Escribinos y lo miramos.
            </p>

            {/*
              Los canales van abajo del todo en la columna, como en cualquier pie: lo primero que
              se lee es la invitación, y el dato concreto queda para quien decidió usarlo.
            */}
            <dl className="mt-10 flex flex-col gap-4 lg:mt-16">
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

          <div className="glass-panel rounded-3xl p-6 md:p-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
