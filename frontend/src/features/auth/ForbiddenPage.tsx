import { Link } from 'react-router'

/**
 * Pantalla de acceso denegado.
 *
 * Es a dónde manda el guard a quien tiene sesión pero no el rol que la ruta pide. Tiene
 * dirección propia en vez de dibujarse dentro de la ruta prohibida: quedándose en ella, la
 * dirección que no corresponde sigue en la barra y el usuario recarga sobre ella una y otra
 * vez esperando otro resultado.
 *
 * El botón de vuelta no es un adorno. Sin una salida a la vista, la única que queda es el
 * botón de atrás del navegador, que devuelve a la ruta prohibida y rebota de nuevo acá.
 */
export default function ForbiddenPage() {
  return (
    <section className="flex h-full items-center justify-center p-6">
      <div className="border-border bg-surface w-full max-w-sm rounded-2xl border p-8 text-center">
        <h1 className="text-2xl font-semibold text-red-600">Acceso denegado</h1>
        <p className="text-text-muted mt-2 text-sm">No tenés permiso para entrar a esta sección.</p>

        <Link
          className="brand-fill text-on-primary mt-6 inline-block rounded-lg px-4 py-2.5 text-sm font-semibold"
          to="/"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  )
}
