import ProfileCard from './components/ProfileCard'

/**
 * La sección "Medios de pago": una sola tarjeta, todavía vacía.
 *
 * Contra `PaymentService` del módulo `ecopedia-integration`, que habla con la pasarela simulada.
 */
export default function PaymentMethodsPage() {
  return (
    <div className="grid md:h-full">
      <ProfileCard />
    </div>
  )
}
