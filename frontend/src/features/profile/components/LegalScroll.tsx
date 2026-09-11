/** Una cláusula de un texto legal: un título corto y su párrafo. */
export interface Clause {
  title: string
  text: string
}

/**
 * Los textos largos, en un recuadro de alto fijo con scroll propio.
 *
 * **El alto fijo es la razón de ser del recuadro.** Diez cláusulas seguidas estiran la tarjeta
 * —y con ella la página— hasta dejar el resto del perfil a varias pantallas de distancia de lo
 * que se está leyendo. Encerradas, se recorren sin mover nada de lugar, que además es como se
 * leen estas cosas en cualquier aplicación.
 *
 * El borde marca dónde empieza y dónde termina lo que se puede recorrer: sin él, un párrafo
 * cortado a la mitad del renglón parece contenido roto en vez de contenido que sigue.
 */
export default function LegalScroll({ clauses, closing }: { clauses: Clause[]; closing: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border-border/60 max-h-80 overflow-y-auto rounded-2xl border p-5">
        <div className="flex flex-col gap-5">
          {clauses.map((clause) => (
            <section key={clause.title}>
              <h3 className="text-text text-sm font-semibold">{clause.title}</h3>
              <p className={'text-text-muted mt-1 text-sm leading-relaxed'}>{clause.text}</p>
            </section>
          ))}
        </div>
      </div>

      <p className="text-text-muted text-xs">{closing}</p>
    </div>
  )
}
