import { Link } from 'react-router'

import { roleLabel } from '@/features/auth/roles'
import { useSession } from '@/features/auth/session'
import { EditIcon } from '@/features/navigation/icons'
import { displayNameOf } from '@/lib/displayName'

import ProfileAvatar from './ProfileAvatar'
import ProfileIdentity from './ProfileIdentity'

/**
 * La cabecera del perfil en el celular: el avatar grande y, apoyada sobre su parte de abajo, la
 * tarjeta de vidrio con el nombre, el correo y el rol.
 *
 * **Es la misma idea que el recuadro del auto de la portada** (`home/VehicleHero`): la figura
 * arriba y una barra de vidrio que se le monta encima y la tapa en parte. Como la barra es de
 * vidrio, lo que queda debajo se sigue viendo difuminado a través, y eso es lo que une las dos
 * piezas en una sola figura en vez de un dibujo con una caja abajo.
 *
 * **Reemplaza a la figura de escritorio en el celular**, que no entra: un redondel más una barra al
 * lado, en el ancho de un teléfono, dejan el correo en cuatro renglones. Ver `ProfileHeader`.
 *
 * El lápiz cuelga de la esquina de arriba a la derecha de la tarjeta, mitad afuera, como en el
 * diseño. Lleva a `/profile/edit`, igual que en escritorio.
 */

/** El diámetro del avatar. Grande a propósito: en el celular es la figura que encabeza la pantalla. */
const AVATAR_SIZE = 176

/** Cuánto se mete la tarjeta sobre el avatar: un poco menos de un tercio de su alto. */
const OVERLAP = 52

export default function ProfileMobileCard() {
  const session = useSession()

  return (
    <section className="flex flex-col items-center md:hidden">
      {/*
        Sin elegir avatar, el redondel del volante necesita un fondo propio: sobre el fondo animado
        de la aplicación, un ícono suelto no se lee como un redondel.
      */}
      <ProfileAvatar size={AVATAR_SIZE} placeholderClassName="bg-surface/70 border border-border" />

      <div
        className="glass-panel relative w-full rounded-3xl px-6 py-5"
        style={{ marginTop: -OVERLAP }}
      >
        {session === null ? (
          <ProfileIdentity />
        ) : (
          <>
            {/*
              Nombre y correo con puntos suspensivos si no entran: un correo largo partido en dos
              renglones hace crecer la tarjeta y la separa del avatar.
            */}
            <p className="text-text truncate pr-10 text-2xl leading-tight font-extrabold tracking-tight uppercase">
              {displayNameOf(session)}
            </p>
            <p className="text-text-muted mt-1 truncate text-sm font-bold">{session.email}</p>
            <p className="text-primary mt-4 text-xl leading-none font-extrabold tracking-tight uppercase">
              {roleLabel(session.role)}
            </p>

            <Link
              to="/profile/edit"
              aria-label="Editar el perfil"
              title="Editar el perfil"
              className="brand-fill text-on-primary absolute -top-5 right-5 flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
            >
              <EditIcon className="h-5 w-5" />
            </Link>
          </>
        )}
      </div>
    </section>
  )
}
