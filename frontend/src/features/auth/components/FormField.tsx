interface FormFieldProps {
  id: string
  label: string
  type: 'text' | 'email' | 'password'
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  required?: boolean
  hint?: string
  /** Mensaje de validación del campo. Reemplaza a la pista mientras esté presente. */
  error?: string
}

/**
 * Un campo de formulario con su etiqueta.
 *
 * El `id` no es decorativo: enlaza la etiqueta con el campo, que es lo que hace que el lector
 * de pantalla anuncie "Contraseña" al llegar y que se pueda hacer clic en el texto para
 * enfocar. También es lo que necesita `autoComplete` para que el navegador ofrezca guardar la
 * credencial.
 *
 * El error va junto al campo y no en un cartel al pie del formulario, que es lo que espera
 * quien completa un registro: con tres campos y un solo mensaje arriba, adivinar cuál está mal
 * es trabajo del usuario. `aria-invalid` y `aria-describedby` son lo que hace que el lector de
 * pantalla lea el motivo al enfocar, en vez de anunciar un campo cualquiera.
 */
export default function FormField({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
  hint,
  error,
}: FormFieldProps) {
  const invalid = error !== undefined && error !== ''
  const messageId = `${id}-message`
  const showMessage = invalid || hint !== undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        className={`bg-background rounded-lg border px-3 py-2 text-sm outline-none ${
          invalid ? 'border-red-600 focus:border-red-600' : 'border-border focus:border-primary'
        }`}
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={invalid}
        aria-describedby={showMessage ? messageId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {showMessage && (
        <p
          className={invalid ? 'text-xs text-red-600' : 'text-text-muted text-xs'}
          id={messageId}
          role={invalid ? 'alert' : undefined}
        >
          {invalid ? error : hint}
        </p>
      )}
    </div>
  )
}
