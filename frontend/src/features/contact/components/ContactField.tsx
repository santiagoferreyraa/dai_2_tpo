import { useId, type ReactNode } from 'react'

/**
 * Un campo del formulario de contacto: rótulo, control y error.
 *
 * **Es un envoltorio y no un input.** Recibe el control como hijo en vez de dibujarlo, porque el
 * formulario tiene dos clases —una línea de texto y un área de varias— y lo que comparten es todo
 * lo de alrededor: el rótulo arriba, el subrayado, el mensaje de error abajo. Meter el `<input>`
 * acá adentro obligaría a un prop "tipo" que después hay que ir ampliando.
 *
 * El precio de esa decisión es que hay que pasarle al hijo el `id` y los atributos de
 * accesibilidad, y por eso `children` es una función: es la forma de entregárselos sin que quien
 * lo use tenga que inventar identificadores ni acordarse de conectar el error.
 *
 * **El rótulo se ve, no es un placeholder.** Un placeholder desaparece apenas se escribe la
 * primera letra, así que quien vuelve a revisar el formulario ya no sabe qué iba en cada casilla.
 * Además es la misma forma que usan las tarjetas de la home —rótulo chico y apagado arriba, el
 * contenido abajo—, así que el formulario se lee como parte de lo mismo.
 */
interface ContactFieldProps {
  label: string
  error?: string
  /** Texto de ayuda permanente, debajo del control. El error lo reemplaza mientras exista. */
  hint?: string
  children: (props: {
    id: string
    'aria-invalid': boolean
    'aria-describedby': string | undefined
    className: string
  }) => ReactNode
}

/**
 * El aspecto del control: solo una línea abajo.
 *
 * `bg-transparent` a propósito: el formulario ya está sobre vidrio, y darle fondo propio a cada
 * campo apilaría dos capas translúcidas y ensuciaría el que hay detrás.
 */
const CONTROL =
  'border-border/70 focus:border-primary text-text placeholder:text-text-muted/70 w-full border-0 border-b bg-transparent px-0 py-2.5 text-sm transition-colors outline-none'

export default function ContactField({ label, error, hint, children }: ContactFieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error ?? hint

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-text-muted text-xs font-medium">
        {label}
      </label>

      {children({
        id,
        'aria-invalid': error !== undefined,
        /*
          Se conecta el mensaje aunque sea solo una ayuda, no únicamente cuando hay error: un
          lector de pantalla tiene que anunciar el límite de caracteres ANTES de que el usuario
          se pase, no después.
        */
        'aria-describedby': message === undefined ? undefined : messageId,
        className: `${CONTROL} ${error !== undefined ? 'border-danger' : ''}`,
      })}

      {message !== undefined && (
        <p
          id={messageId}
          /*
            `role="alert"` solo en el error. Puesto siempre, el lector interrumpiría para leer el
            texto de ayuda apenas aparece la pantalla, que es justo lo que no hay que hacer.
          */
          role={error !== undefined ? 'alert' : undefined}
          className={`text-xs ${error !== undefined ? 'text-danger' : 'text-text-muted'}`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
