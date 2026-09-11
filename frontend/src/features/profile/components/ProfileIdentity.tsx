import { useState } from 'react'
import { Link } from 'react-router'

import { useSession } from '@/features/auth/session'
import type { Role, UserProfile } from '@/features/auth/types'
import { EditIcon } from '@/features/navigation/icons'

/**
 * Lo que dice la cabecera del perfil: los cuatro datos del usuario y el botón de editar.
 *
 * **Vive aparte de la figura que lo contiene** porque son dos cosas distintas: la silueta con el
 * redondel es de escritorio y la dibuja `ProfileHeader`; esto es lo que va escrito adentro, y es
 * lo mismo en el celular, donde por ahora va en una tarjeta común. Cuando llegue la versión de
 * celular, lo que cambia es el envase.
 *
 * **Los cuatro datos se reparten el ancho en columnas iguales**, igual que la ficha del auto de
 * la portada. Es lo que los mantiene separados en un monitor grande sin escribir a mano la
 * separación: la columna mide un cuarto de lo que haya.
 */

/** Cómo se lee cada rol en pantalla. El enum viaja en inglés técnico; el usuario no. */
const ROLE_LABEL: Record<Role, string> = {
  CONDUCTOR: 'Conductor',
  CPO: 'Operador',
  ADMIN: 'Administrador',
}

interface ProfileIdentityProps {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  save: (fullName: string) => Promise<string | null>
}

export default function ProfileIdentity({ profile, loading, error, save }: ProfileIdentityProps) {
  const session = useSession()
  const [editing, setEditing] = useState(false)

  if (session === null) {
    return (
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
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

  /*
    Mientras carga se muestra lo que la sesión ya sabe —el correo y el rol viajan en el token—
    en vez de un cartel de "cargando" sobre toda la barra. Lo único que falta es el nombre, así
    que reemplazar los cuatro datos por un espera sería tapar tres que ya están.
  */
  if (error !== null) {
    return (
      <p className="text-danger w-full text-sm" role="alert">
        {error}
      </p>
    )
  }

  if (editing) {
    return (
      <NameForm current={profile?.fullName ?? ''} onDone={() => setEditing(false)} save={save} />
    )
  }

  const fields = [
    { label: 'Nombre', value: profile?.fullName ?? (loading ? '' : '—') },
    { label: 'Correo', value: profile?.email ?? session.email },
    /*
      El auto no existe todavía como dato del sistema: no hay entidad, ni endpoint, ni pantalla
      para elegirlo. La columna se dibuja igual y vacía, porque el lugar ya está decidido y el
      dato no. Ver `home/vehicle.ts`.
    */
    { label: 'Auto', value: '—' },
    { label: 'Rol', value: ROLE_LABEL[profile?.role ?? session.role] },
  ]

  return (
    <>
      <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-4">
        {fields.map((field) => (
          <div key={field.label} className="min-w-0">
            <dt className="text-text-muted text-[11px] font-medium tracking-wide uppercase">
              {field.label}
            </dt>
            {/*
              El valor se corta con puntos suspensivos y no se parte en dos renglones: un correo
              largo haría crecer la barra, y la barra tiene el alto del redondel.
            */}
            <dd className="text-text truncate text-base leading-tight font-extrabold tracking-tight">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>

      {/*
        Editar es un botón redondo y verde, no un renglón de texto: es la única acción de la
        barra, y el verde es con lo que la aplicación pide acción en el resto de la pantalla.
      */}
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Editar el perfil"
        className="brand-fill text-on-primary ml-4 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full"
      >
        <EditIcon className="h-5 w-5" />
      </button>
    </>
  )
}

/**
 * El formulario de edición, que ocupa la barra entera mientras dura.
 *
 * **Reemplaza a los cuatro datos en vez de convertir uno en campo.** De los cuatro, el único
 * que se puede cambiar es el nombre —el correo identifica la cuenta y viaja en el token, el rol
 * es una decisión administrativa y el auto no existe—, así que dejarlos al lado de un campo
 * editable invita a tocarlos. Mostrando solo lo que se puede cambiar, la pregunta no aparece.
 */
function NameForm({
  current,
  save,
  onDone,
}: {
  current: string
  save: (fullName: string) => Promise<string | null>
  onDone: () => void
}) {
  const [value, setValue] = useState(current)
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    setSaving(true)
    const message = await save(value.trim())
    setSaving(false)

    if (message === null) onDone()
    else setFailure(message)
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex w-full items-end gap-3">
      <label className="min-w-0 flex-1">
        <span className="text-text-muted text-[11px] font-medium tracking-wide uppercase">
          Nombre
        </span>
        {/*
          `autoFocus` acá no es un atajo de teclado más: al abrirse, este campo es lo único que
          hay para hacer en la barra, y quien tocó "editar" ya dijo que quiere escribir.
        */}
        <input
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={120}
          className="text-text border-border/70 focus:border-primary mt-1 w-full border-b bg-transparent text-base font-extrabold tracking-tight outline-none"
        />
      </label>

      <button
        type="submit"
        disabled={saving || value.trim() === ''}
        className="brand-fill text-on-primary shrink-0 cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
      >
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
      <button
        type="button"
        onClick={onDone}
        className="text-text-muted hover:text-text shrink-0 cursor-pointer px-2 py-2 text-sm font-semibold"
      >
        Cancelar
      </button>

      {failure !== null && (
        <p className="text-danger shrink-0 text-xs" role="alert">
          {failure}
        </p>
      )}
    </form>
  )
}
