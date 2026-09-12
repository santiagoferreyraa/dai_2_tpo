import ProfileCard from './components/ProfileCard'

/**
 * La sección "Notificaciones": una sola tarjeta, todavía vacía.
 *
 * Lo que va adentro depende de `NotificationService`, el consumidor de JMS del módulo
 * `ecopedia-async`, que hoy es un scaffold. Se dibuja el recuadro y no un cartel de "próximamente"
 * porque el lugar ya está decidido y el contenido no.
 */
export default function NotificationsPage() {
  return <ProfileCard />
}
