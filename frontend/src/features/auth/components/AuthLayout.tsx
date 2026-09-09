import type { ReactNode } from 'react'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

/**
 * Marco común de las pantallas de login y registro: una tarjeta centrada.
 *
 * Usa los tokens globales de `index.css` (`surface`, `border`, `text-muted`) y no los
 * `st-*` de la feature Terminales, que están para retirarse cuando entre el tema oscuro
 * global. Atarse a ellos sería heredar un borrado anunciado.
 */
export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <section className="flex h-full items-center justify-center p-6">
      <div className="border-border bg-surface w-full max-w-sm rounded-2xl border p-8">
        <h1 className="text-primary text-2xl font-semibold">{title}</h1>
        <p className="text-text-muted mt-1 mb-6 text-sm">{subtitle}</p>

        {children}

        <p className="text-text-muted mt-6 text-center text-sm">{footer}</p>
      </div>
    </section>
  )
}
