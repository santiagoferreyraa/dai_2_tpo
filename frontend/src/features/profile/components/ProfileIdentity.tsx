import { useState } from 'react'
import { Link } from 'react-router'

import { updateMyProfile } from '@/features/auth/data/userRepository'
import { roleLabel } from '@/features/auth/roles'
import { applyFullName, useSession } from '@/features/auth/session'
import { displayNameOf } from '@/lib/displayName'

/**
 * Lo que dice la cabecera del perfil: los cuatro datos del usuario, o el campo para editarlos.
 *
 * **Vive aparte de la figura que lo contiene** porque son dos cosas distintas: la silueta con el
 * redondel es de escritorio y la dibuja `ProfileHeader`; esto es lo que va escrito adentro, y es
 * lo mismo en el celular, donde por ahora va en una tarjeta común.
 *
 * **No pide nada al backend para mostrarse.** Los cuatro datos ya están en la sesión: el correo
 * y el rol viajan en el token, y el nombre lo trae `hydrateFullName` apenas se entra. Pedirlo de
 * nuevo acá sería una segunda llamada para traer lo mismo, y encima dejaría a esta pantalla
 * mostrando un cartel de error cuando el resto de la aplicación sigue andando.
 *
 * **Los cuatro se reparten el ancho en columnas iguales**, igual que la ficha del auto de la
 * portada. Es lo que los mantiene separados en un monitor grande sin escribir a mano la
 * separación: la columna mide un cuarto de lo que haya.
 */

interface ProfileIdentityProps {
  /** Si está abierto el campo para editar el nombre. Lo maneja quien dibuja el botón. */
  editing: boolean
  onDone: () => void
}

export default function ProfileIdentity({ editing, onDone }: ProfileIdentityProps) {
  const session = useSession()

  if (session === null) {
    return (
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <p className="text-text text-sm font-semibold">
          Todavía no iniciaste sesión. Con una cuenta podés reservar un conector.
        </p>
        <Link
          to="/login"
          className="brand-fill text-on-primary rounded-xl px-4 py-2 text-sm font-semibold"
        >
          Iniciar sesión
        </Link>
      </div>
    )
  }

  if (editing) return <NameForm current={session.fullName ?? ''} onDone={onDone} />

  const fields = [
    { label: 'Nombre', value: displayNameOf(session) },
    { label: 'Correo', value: session.email },
    /*
      El auto no existe todavía como dato del sistema: no hay entidad, ni endpoint, ni pantalla
      para elegirlo. La columna se dibuja igual y vacía, porque el lugar ya está decidido y el
      dato no. Ver `home/vehicle.ts`.
    */
    { label: 'Auto', value: '—' },
    { label: 'Rol', value: roleLabel(session.role) },
  ]

  return (
    <dl className="grid w-full grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-4">
      {fields.map((field) => (
        <div key={field.label} className="min-w-0">
          <dt className="text-text-muted text-[10px] font-medium tracking-wide uppercase">
            {field.label}
          </dt>
          {/*
            El valor se corta con puntos suspensivos y no se parte en dos renglones: un correo
            largo haría crecer la barra, y la barra tiene el alto del redondel.
          */}
          <dd className="text-text truncate text-sm leading-tight font-extrabold tracking-tight">
            {field.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * El formulario de edición, que ocupa la barra entera mientras dura.
 *
 * **Reemplaza a los cuatro datos en vez de convertir uno en campo.** De los cuatro, el único
 * que se puede cambiar es el nombre —el correo identifica la cuenta y viaja en el token, el rol
 * es una decisión administrativa y el auto no existe—, así que dejarlos al lado de un campo
 * editable invita a tocarlos. Mostrando solo lo que se puede cambiar, la pregunta no aparece.
 *
 * **Lo guardado se escribe en la sesión**, no en un estado de esta pantalla: el nombre lo leen
 * también la ficha de la franja de arriba y el saludo de la portada, y sin eso seguirían
 * mostrando el anterior hasta recargar.
 */
function NameForm({ current, onDone }: { current: string; onDone: () => void }) {
  const [value, setValue] = useState(current)
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    setSaving(true)

    try {
      const profile = await updateMyProfile(value.trim())
      applyFullName(profile.fullName)
      onDone()
    } catch (cause: unknown) {
      setSaving(false)
      setFailure(cause instanceof Error ? cause.message : 'No se pudo guardar el nombre')
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex w-full items-end gap-3">
      <label className="min-w-0 flex-1">
        <span className="text-text-muted text-[10px] font-medium tracking-wide uppercase">
          Nombre
        </span>
        {/*
          `autoFocus` acá no es un atajo de teclado más: al abrirse, este campo es lo único que
          hay para hacer en la barra, y quien tocó el lápiz ya dijo que quiere escribir.
        */}
        <input
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={120}
          className="text-text border-border/70 focus:border-primary w-full border-b bg-transparent text-sm font-extrabold tracking-tight outline-none"
        />
      </label>

      {failure !== null && (
        <p className="text-danger min-w-0 flex-1 truncate text-xs" role="alert">
          {failure}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || value.trim() === ''}
        className="brand-fill text-on-primary shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
      >
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
      <button
        type="button"
        onClick={onDone}
        className="text-text-muted hover:text-text shrink-0 cursor-pointer text-xs font-semibold"
      >
        Cancelar
      </button>
    </form>
  )
}
