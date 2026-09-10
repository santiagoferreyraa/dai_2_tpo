import { Link } from 'react-router'

import { useSession } from '@/features/auth/session'
import { displayNameFrom } from '@/lib/displayName'

import { DRIVER_VEHICLE, GUEST_IMAGE, VEHICLE_IMAGE } from '../vehicle'

/**
 * El recuadro grande de la portada: el saludo, el vehículo y su ficha.
 *
 * **Tiene dos caras y muestran cosas distintas, no la misma con otro texto.** Con sesión abierta
 * el protagonista es el auto del conductor, con su ficha técnica abajo. Sin sesión no hay auto que
 * mostrar, así que el recuadro pasa a explicar para qué sirve entrar: lo que ocupa el lugar de la
 * ficha es la invitación, no una ficha vacía o con guiones.
 *
 * El vehículo está escrito a mano por ahora. Ver `vehicle.ts`, que explica por qué y qué cambia
 * cuando el conductor pueda elegirlo.
 *
 * **El auto va como fondo y no como `<img>`.** Eso es lo que lo vuelve opcional: un fondo que no
 * existe simplemente no se dibuja y el recuadro se ve entero, mientras que una imagen rota deja el
 * ícono gris del navegador en el medio de lo primero que alguien mira.
 */

/** El saludo, según la hora del aparato. */
function greetingFor(hour: number): string {
  if (hour < 12) return 'Buen día'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function VehicleHero({ className = '' }: { className?: string }) {
  const session = useSession()
  const greeting = greetingFor(new Date().getHours())

  const image = session === null ? GUEST_IMAGE : VEHICLE_IMAGE

  return (
    <section
      className={`glass-panel relative flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-3xl p-6 ${className}`}
      style={{
        backgroundImage: `url("${image}")`,
        backgroundRepeat: 'no-repeat',
        /*
          El auto se apoya arriba a la derecha y sobresale por el borde: encuadrado entero y
          centrado se ve como una foto de catálogo, y asomando se ve como parte de la pantalla.
        */
        backgroundPosition: 'right -1.5rem top 12%',
        /*
          El tamaño se mide contra el ALTO de la tarjeta, no contra su ancho. Es lo que lo vuelve
          estable: la tarjeta ocupa todo el ancho de la pantalla, así que atado al ancho el auto
          crecía sin freno en un monitor grande hasta taparle el texto al saludo, mientras que el
          alto lo fija el contenido y casi no cambia.
        */
        backgroundSize: 'auto 62%',
      }}
    >
      <header>
        <p className="text-text-muted text-sm font-medium">
          {session === null ? greeting : `${greeting}, ${displayNameFrom(session.email)}`} 👋
        </p>

        {session === null ? (
          <>
            <h1 className="text-text mt-2 max-w-sm text-4xl leading-[1.05] font-extrabold tracking-tight text-balance">
              Tu auto,
              <br />
              <span className="text-primary">tu red de carga.</span>
            </h1>
            <p className="text-text-muted mt-3 max-w-xs text-sm leading-relaxed">
              Entrá y guardá tu vehículo: el mapa te muestra solo las estaciones con el conector que
              usás.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-text mt-2 text-4xl leading-none font-extrabold tracking-tight uppercase">
              {DRIVER_VEHICLE.name}
            </h1>
            <p className="text-text-muted mt-1 text-sm font-bold tracking-wide uppercase">
              {DRIVER_VEHICLE.brand}
            </p>
          </>
        )}
      </header>

      {/*
        La barra de vidrio de abajo. Con sesión lleva la ficha del auto; sin sesión, la puerta de
        entrada. Es el mismo lugar en las dos caras para que el recuadro no cambie de forma según
        quién esté mirando.
      */}
      <div className="glass-panel relative mt-6 rounded-2xl px-5 py-4">
        {session === null ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-text text-sm font-semibold">Todavía no elegiste tu vehículo.</p>
            {/* `/login` la trae ECO-36. Ver el comentario de `ProfilePill.tsx`. */}
            <Link
              to="/login"
              className="brand-fill text-on-primary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {DRIVER_VEHICLE.specs.map((spec) => (
              <div key={spec.label}>
                <dt className="text-text-muted text-[11px] font-medium">{spec.label}</dt>
                <dd className="text-text mt-0.5 text-lg font-extrabold tracking-tight">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}
