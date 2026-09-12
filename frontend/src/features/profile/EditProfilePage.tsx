import { useState } from 'react'
import { useNavigate } from 'react-router'

import { updateMyPassword, updateMyProfile } from '@/features/auth/data/userRepository'
import { applyFullName, useSession } from '@/features/auth/session'
import { EyeIcon, EyeOffIcon } from '@/features/navigation/icons'
import {
  validateNewPassword,
  validatePasswordConfirmation,
  validateRequiredPassword,
} from '@/features/auth/validation'
import UnderlineField from '@/components/UnderlineField'
import { ApiError } from '@/lib/api'

import ProfileCard from './components/ProfileCard'

/**
 * La edición del perfil: ocupa la tarjeta grande, en lugar de la sección que se estaba mirando.
 *
 * **Es una ruta y no un estado de la cabecera.** El lápiz está arriba, en la barra de datos, y
 * el formulario sale abajo, en la tarjeta: son dos lugares distintos de la pantalla, así que
 * con un estado local habría que pasárselo entre componentes que no se conocen. Con una ruta,
 * el lápiz es un enlace, la tarjeta la elige el ruteo y de yapa funciona el botón de atrás.
 *
 * **No está en el riel.** Las cuatro secciones son lugares donde uno se queda; esto es un paso
 * que empieza en un botón y termina al guardar o al cancelar.
 *
 * **De los cuatro datos que se ven arriba, solo dos se pueden cambiar.** El correo identifica la
 * cuenta y viaja adentro del token; el rol es una decisión administrativa —si se aceptara acá,
 * cualquiera se promovería a administrador desde su propio perfil—. Los otros dos, el avatar y
 * el auto, todavía no existen en el sistema: no hay catálogo de avatares ni entidad de vehículo.
 * Se dibujan igual, apagados y diciendo por qué, porque el lugar ya está decidido y el dato no.
 */
export default function EditProfilePage() {
  const session = useSession()
  const navigate = useNavigate()

  /*
    El nombre arranca con el que está guardado, pero **el estado no se inicializa con él**: el
    valor inicial de `useState` se toma una sola vez, en el primer render, y para entonces la
    sesión puede no tener todavía el nombre real —lo trae `hydrateFullName` un instante después
    de entrar—. Inicializándolo así, quien llega rápido a esta pantalla se encontraba el campo
    vacío para siempre.

    Lo que se guarda acá es lo TIPEADO, y es `null` mientras nadie haya tocado el campo. Hasta
    entonces se muestra lo que diga la sesión, así que el nombre aparece solo en cuanto llega, y
    desde la primera tecla manda lo que escribió el usuario.
  */
  const [typedName, setTypedName] = useState<string | null>(null)
  const fullName = typedName ?? session?.fullName ?? ''
  const setFullName = setTypedName
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  /* Si la contraseña nueva se ve mientras se escribe. Ver el ojo. */
  const [revealed, setRevealed] = useState(false)

  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [failure, setFailure] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  /*
    La contraseña es opcional dentro de este formulario: quien entró a cambiarse el nombre no
    tiene por qué escribir tres campos más. Se valida y se manda solo si tocó alguno de los
    tres, y ahí sí los tres son obligatorios.
  */
  const changingPassword = currentPassword !== '' || newPassword !== '' || confirmation !== ''

  function validate(): boolean {
    const found: Record<string, string | undefined> = {
      fullName: fullName.trim() === '' ? 'Escribí tu nombre.' : undefined,
      currentPassword: changingPassword ? validateRequiredPassword(currentPassword) : undefined,
      newPassword: changingPassword ? validateNewPassword(newPassword) : undefined,
      confirmation: changingPassword
        ? validatePasswordConfirmation(newPassword, confirmation)
        : undefined,
    }

    setErrors(found)
    return Object.values(found).every((message) => message === undefined)
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    setFailure(null)
    if (!validate()) return

    setSaving(true)
    try {
      /*
        **La contraseña primero, y el orden no es indistinto.** La única de las dos llamadas que
        el backend puede rechazar por lo que escribió el usuario es esta —si la actual no
        coincide—, así que yendo primero un error deja todo como estaba. Al revés, el nombre ya
        habría quedado guardado y la pantalla mostraría un error después de haber cambiado algo,
        que es la peor combinación posible: no se sabe qué se guardó y qué no.
      */
      if (changingPassword) await updateMyPassword(currentPassword, newPassword)

      const profile = await updateMyProfile(fullName.trim())
      applyFullName(profile.fullName)

      void navigate('..', { relative: 'path' })
    } catch (cause: unknown) {
      /* El mensaje viene del backend —"La contraseña actual no es correcta"— y se muestra tal cual. */
      setFailure(cause instanceof ApiError ? cause.message : 'No se pudieron guardar los cambios')
      setSaving(false)
    }
  }

  if (session === null) {
    return (
      <ProfileCard>
        <p className="text-text-muted text-sm">Entrá a tu cuenta para editar tu perfil.</p>
      </ProfileCard>
    )
  }

  return (
    <ProfileCard>
      <h2 className="text-text text-lg font-extrabold tracking-tight">Editar perfil</h2>
      <p className="text-text-muted mt-1 text-sm">
        El correo y el rol no se editan: el primero identifica tu cuenta y el segundo lo asigna un
        administrador.
      </p>

      {/*
        **`autoComplete="off"` en el formulario entero, y no es una manía.** El navegador ve un
        campo de texto arriba y dos de contraseña abajo, decide que esto es un login y lo llena
        con la credencial guardada: el nombre aparecía pisado con un correo y la contraseña actual
        con una clave cualquiera, ya escrita y editable. En un formulario de perfil eso no ayuda,
        confunde: parece que la aplicación está mostrando la contraseña guardada.

        Que esté acá no alcanza —Chrome lo ignora seguido—, así que además cada campo lo repite y
        los dos de contraseña se declaran `new-password`, que es lo único que el navegador respeta
        para no ofrecer lo que tiene guardado.
      */}
      <form
        onSubmit={(event) => void handleSubmit(event)}
        autoComplete="off"
        className="mt-6 flex flex-col gap-5"
      >
        {/*
          El mismo relleno que el recuadro del alta de una tarjeta: los dos son un formulario
          adentro de la tarjeta de una sección. Ver `.glass-inset`.
        */}
        <fieldset className="glass-inset flex flex-col gap-5 rounded-3xl p-6">
          <legend className="sr-only">Datos de la cuenta</legend>

          <AvatarPicker />

          <UnderlineField label="Nombre" error={errors.fullName}>
            {(props) => (
              <input
                {...props}
                type="text"
                name="fullName"
                autoComplete="off"
                maxLength={120}
                placeholder="Como querés que te llamemos"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            )}
          </UnderlineField>

          {/*
            El auto, apagado. No hay entidad de vehículo en el sistema —ni endpoint, ni catálogo
            de modelos—, así que un campo que se pueda escribir prometería guardar algo que no
            tiene dónde guardarse. Ver `home/vehicle.ts`.
          */}
          <div className="opacity-60">
            <UnderlineField
              label="Auto"
              hint="Llega cuando el sistema tenga catálogo de vehículos."
            >
              {(props) => (
                <input
                  {...props}
                  type="text"
                  disabled
                  value=""
                  placeholder="Todavía no se puede elegir"
                />
              )}
            </UnderlineField>
          </div>
        </fieldset>

        <fieldset className="glass-inset flex flex-col gap-5 rounded-3xl p-6">
          {/*
            **El título va como `<h3>` y la `<legend>` queda solo para el lector de pantalla.**
            Una leyenda visible no es un renglón más adentro del recuadro: el navegador la dibuja
            MONTADA sobre el borde de arriba, abriéndole un hueco. Eso funciona con el borde
            cuadrado de siempre, pero sobre un panel redondeado y de vidrio el texto queda
            sobresaliendo y el borde cortado. Separando las dos cosas, el grupo sigue anunciándose
            como "Cambiar la contraseña" y el título se dibuja donde corresponde.
          */}
          <legend className="sr-only">Cambiar la contraseña</legend>
          <div>
            <h3 className="text-text text-sm font-semibold">Cambiar la contraseña</h3>
            <p className="text-text-muted mt-1 text-xs">
              Dejá los campos vacíos si no querés cambiarla.
            </p>
          </div>

          <UnderlineField label="Contraseña actual" error={errors.currentPassword}>
            {(props) => (
              <input
                {...props}
                type="password"
                autoComplete="new-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            )}
          </UnderlineField>
          {/*
            La nueva y su repetición, una al lado de la otra: son el mismo dato escrito dos veces,
            y separadas en dos renglones se leen como dos pedidos distintos. Debajo de `md` se
            apilan, porque dos campos de contraseña en media pantalla de teléfono no entran.
          */}
          <div className="grid gap-5 md:grid-cols-2">
            <UnderlineField
              label="Contraseña nueva"
              hint="Al menos 6 caracteres."
              error={errors.newPassword}
            >
              {(props) => (
                <div className="flex items-center gap-3">
                  <input
                    {...props}
                    type={revealed ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                  {/*
                    El ojo, tachado mientras la contraseña está oculta. Muestra solo este campo: el
                    de al lado es la comprobación, y verlo también convertiría el repetir en copiar.
                  */}
                  <button
                    type="button"
                    onClick={() => setRevealed(!revealed)}
                    aria-label={revealed ? 'Ocultar la contraseña' : 'Mostrar la contraseña'}
                    aria-pressed={revealed}
                    className="text-text-muted hover:text-text shrink-0 cursor-pointer transition-colors"
                  >
                    {revealed ? (
                      <EyeIcon className="h-4.5 w-4.5" />
                    ) : (
                      <EyeOffIcon className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              )}
            </UnderlineField>

            <UnderlineField label="Repetir la nueva" error={errors.confirmation}>
              {(props) => (
                <input
                  {...props}
                  type="password"
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                />
              )}
            </UnderlineField>
          </div>
        </fieldset>

        {failure !== null && (
          <p className="text-danger text-sm" role="alert">
            {failure}
          </p>
        )}

        <div className="flex items-center gap-3">
          {/*
            El botón cambia con el tema por partida doble: el relleno es el par de verdes de la
            marca —distinto en claro y en oscuro— y el texto es `text-on-brand`, oscuro sobre el
            verde encendido y blanco sobre el apagado. Un color fijo pierde en uno de los dos.
          */}
          <button
            type="submit"
            disabled={saving}
            className="brand-fill text-on-brand cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Aceptar cambios'}
          </button>
          <button
            type="button"
            onClick={() => void navigate('..', { relative: 'path' })}
            className="text-text-muted hover:text-text cursor-pointer px-2 py-2.5 text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </ProfileCard>
  )
}

/**
 * El elegidor de avatar, todavía sin avatares.
 *
 * Se dibuja la fila con los redondeles vacíos porque el lugar ya está decidido —es el mismo
 * redondel de la cabecera— y lo que falta es el catálogo. Apagados y con el motivo escrito al
 * lado, la pantalla dice qué va a haber ahí; sin la fila, nadie sabría que se va a poder elegir.
 */
function AvatarPicker() {
  return (
    <div className="flex flex-col gap-1.5 opacity-60">
      <span className="text-sm font-medium">Avatar</span>
      <div className="mt-1 flex items-center gap-3">
        {[0, 1, 2, 3, 4].map((slot) => (
          <span
            key={slot}
            aria-hidden="true"
            className="border-primary/40 h-12 w-12 shrink-0 rounded-full border-2 border-dashed"
          />
        ))}
      </div>
      <p className="text-text-muted mt-1 text-xs">
        Los avatares para elegir todavía no están cargados.
      </p>
    </div>
  )
}
