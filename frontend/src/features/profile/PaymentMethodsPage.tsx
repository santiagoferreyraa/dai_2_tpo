import PaymentMethods from '@/features/payments/PaymentMethodsPage'

import ProfileCard from './components/ProfileCard'

/**
 * La sección "Medios de pago": la pantalla de tarjetas de la feature Pagos, adentro de la
 * tarjeta del perfil.
 *
 * **Es un montaje, no una copia.** Toda la lógica —el listado, el alta, la baja con
 * confirmación, la pila de tarjetas del celular— vive en `features/payments` y la mantiene
 * quien trabaja ahí. Acá solo se decide DÓNDE se dibuja, que es la pregunta que le toca al
 * perfil.
 *
 * **Y por eso Pagos ya no tiene ruta propia.** Antes esa pantalla vivía en `/payment-methods`,
 * suelta. Dos direcciones para lo mismo obligan a elegir cuál enlazar y dejan una de las dos sin
 * la navegación del perfil alrededor. El guard de rol que tenía aquella ruta no se perdió: ahora
 * lo pone la ruta de esta sección. Ver `routes.tsx`.
 */
export default function PaymentMethodsPage() {
  return (
    <div className="grid md:h-full">
      <ProfileCard className="md:overflow-y-auto">
        <PaymentMethods />
      </ProfileCard>
    </div>
  )
}
