import { Link } from 'react-router'

import { useSession } from '@/features/auth/session'
import { displayNameFrom } from '@/lib/displayName'

import { SteeringWheelIcon } from './icons'
import { PROFILE_SECTION } from './navSections'

/**
 * La ficha del usuario, arriba a la derecha en escritorio y tablet.
 *
 * **Son dos cosas distintas, no una ficha con dos contenidos.** Sin sesión hay una sola acción
 * posible —entrar— y eso es un botón, verde y con el texto solo: un ícono al lado de dos palabras
 * que ya dicen todo no agrega nada, y el verde es con lo que la aplicación pide acción en el
 * resto de la pantalla. Con sesión no hay nada que pedir: hay algo que informar —quién entró y
 * con qué rol— y eso es una ficha.
 *
 * Lo que sí comparten es el alto, y es a propósito: es el mismo del buscador y el del interruptor
 * de tema, que son sus vecinos de fila. Uno que creciera al iniciar sesión correría a los otros
 * de lugar y la franja daría un salto.
 */

/** Cómo se lee cada rol en pantalla. El enum viaja en inglés técnico; el usuario no. */
const ROLE_LABEL = {
  CONDUCTOR: 'Conductor',
  CPO: 'Operador',
  ADMIN: 'Administrador',
} as const

/** El alto de la franja. Lo fija el buscador; acá se repite para no quedar desparejo. */
const HEIGHT = 'h-12'

export default function ProfilePill() {
  const session = useSession()

  if (session === null) {
    /* El destino es `/login`, la pantalla de la feature Auth. */
    return (
      <Link
        to="/login"
        className={`brand-fill text-on-primary ${HEIGHT} flex items-center rounded-3xl px-6 text-sm font-semibold`}
      >
        Iniciar sesión
      </Link>
    )
  }

  return (
    <Link
      to={PROFILE_SECTION.to}
      /*
        El radio es el de las tarjetas de la home, para que la ficha se lea como parte de la
        misma familia. El `pl-1.5` no es simetría rota por gusto: con la punta redondeada el
        borde izquierdo se curva hacia adentro, y con el mismo padding de la derecha el círculo
        quedaría pisando esa curva.
      */
      className={`glass-panel hover:border-primary/60 ${HEIGHT} flex items-center gap-2.5 rounded-3xl pr-5 pl-1.5 transition-colors`}
      aria-label={`Perfil de ${session.email}`}
    >
      {/*
        El volante, en un círculo verde. Redondo y no cuadrado porque es lo que ocupa el lugar del
        avatar que todavía no existe, y un avatar es redondo en todos lados.

        **Es un volante y no un rayo**, que es lo que había antes. El rayo es el símbolo de la
        carga y ya está en la ficha del vehículo, en los pines del mapa y en las fichas de la
        cinta; acá, en el lugar del avatar, decía "electricidad" cuando lo que tiene que decir es
        quién sos. El volante además acompaña al rol que va escrito justo debajo.

        Va con el color del FONDO de la página, que es el mismo recurso que usan la luna y el sol
        de la perilla del interruptor: oscuro sobre el tema oscuro, claro sobre el claro. Es lo
        que lo hace leer como recortado del círculo verde y no como un dibujo apoyado encima, y es
        lo que mantiene a los dos vecinos de la franja hablando el mismo idioma.

        Un punto más grande que el rayo (20px contra 16): el rayo es una silueta maciza y se lee
        de golpe, el volante es de trazo y tiene un círculo adentro, así que apretado a 16px los
        tres brazos se empastan contra el cubo.
      */}
      <span className="text-background brand-fill flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
        <SteeringWheelIcon className="h-5 w-5" />
      </span>

      <span className="flex flex-col leading-tight">
        <span className="text-text text-sm font-medium">{displayNameFrom(session.email)}</span>
        {/*
          El rol debajo del nombre, en chico y en el verde de la marca. Es lo que explica por qué
          dos cuentas ven pantallas distintas, y sin él un operador no tiene forma de saber con
          cuál entró. Va en el verde de TINTA y no en el degradado: sobre once píxeles de alto un
          degradado no se ve, y la punta clara del par sobre el tema claro no se lee.
        */}
        <span className="text-primary text-[11px] font-semibold">{ROLE_LABEL[session.role]}</span>
      </span>
    </Link>
  )
}
