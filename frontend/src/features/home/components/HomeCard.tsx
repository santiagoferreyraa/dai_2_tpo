import type { ReactNode } from 'react'

/**
 * La tarjeta de vidrio de la home.
 *
 * Existe porque las tres tarjetas de la pantalla comparten la misma anatomía —un encabezado
 * chico con ícono y rótulo, un cuerpo con el dato grande, y un pie separado por una línea con
 * dos datos menores— y solo cambia lo que va adentro. Encerrar esa estructura acá es lo que
 * hace que las tres se lean como una familia aunque digan cosas distintas.
 *
 * El pie es opcional: la tarjeta que no tiene dos datos que agregar no dibuja ni la línea.
 */
interface HomeCardProps {
  Icon: (props: { className?: string }) => React.ReactElement
  label: string
  children: ReactNode
  /** Las dos columnas del pie. Sin esto, la tarjeta termina en el cuerpo. */
  footer?: { label: string; value: string }[]
  className?: string
}

export default function HomeCard({ Icon, label, children, footer, className = '' }: HomeCardProps) {
  return (
    <article className={`glass-panel flex flex-col rounded-3xl p-5 ${className}`}>
      <header className="text-text-muted flex items-center gap-2 text-xs font-medium">
        <Icon className="h-4 w-4" />
        {label}
      </header>

      <div className="mt-3 flex flex-1 flex-col">{children}</div>

      {footer !== undefined && (
        <footer className="border-border/60 mt-4 grid grid-cols-2 gap-4 border-t pt-3">
          {footer.map((item) => (
            <div key={item.label}>
              <p className="text-text-muted text-[11px]">{item.label}</p>
              <p className="text-text mt-0.5 text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </footer>
      )}
    </article>
  )
}
