interface FormFieldProps {
  id: string
  label: string
  type: 'text' | 'email' | 'password'
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  required?: boolean
  hint?: string
}

/**
 * Un campo de formulario con su etiqueta.
 *
 * El `id` no es decorativo: enlaza la etiqueta con el campo, que es lo que hace que el lector
 * de pantalla anuncie "Contraseña" al llegar y que se pueda hacer clic en el texto para
 * enfocar. También es lo que necesita `autoComplete` para que el navegador ofrezca guardar la
 * credencial.
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
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        className="border-border bg-background focus:border-primary rounded-lg border px-3 py-2 text-sm outline-none"
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint !== undefined && <p className="text-text-muted text-xs">{hint}</p>}
    </div>
  )
}
