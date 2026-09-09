/**
 * La marca de Ecopedia: una hoja con un rayo recortado.
 *
 * Las dos mitades del nombre en un solo dibujo —lo eco y lo eléctrico—, que es más de lo que
 * dice una inicial suelta. El rayo no está pintado encima: está **calado**, así que se ve el
 * fondo a través de él y la marca funciona igual sobre el tema claro que sobre el oscuro.
 * De ahí el `fill-rule="evenodd"`, que es lo que convierte el segundo contorno en un agujero
 * en vez de una figura apilada sobre la primera.
 */
export default function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 2.2c5.4 4.3 7.6 8.5 7.6 11.8a7.6 7.6 0 0 1-15.2 0C4.4 10.7 6.6 6.5 12 2.2Zm1.1 4.4-4.5 6.6a.6.6 0 0 0 .5.95h2.4l-.7 4.2a.6.6 0 0 0 1.1.4l4.5-6.6a.6.6 0 0 0-.5-.95h-2.4l.7-4.2a.6.6 0 0 0-1.1-.4Z"
      />
    </svg>
  )
}
