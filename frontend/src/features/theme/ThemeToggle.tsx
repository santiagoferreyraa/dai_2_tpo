import { MoonIcon, SunIcon } from '@/features/navigation/icons'

import { toggleTheme, useTheme } from './theme'

/**
 * El interruptor de tema claro / oscuro (RNF08).
 *
 * **Es un `role="switch"` y no un botón común.** La diferencia no es cosmética: un lector de
 * pantalla anuncia "activado / desactivado" y dice en qué estado está, que es justo lo que un
 * control con dos posiciones necesita comunicar. Un botón suelto solo diría "cambiar tema", sin
 * decir hacia dónde.
 *
 * Los dos íconos están siempre dibujados, uno en cada extremo, y lo que se mueve es la perilla.
 * Cambiar el ícono al tocar sería más simple pero se pierde el gesto: lo que hace legible un
 * interruptor es ver el recorrido de un lado al otro, no ver aparecer un dibujo distinto.
 */
export default function ThemeToggle() {
  const theme = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label="Tema claro"
      onClick={toggleTheme}
      className="border-border/70 bg-surface/60 relative flex h-9 w-16 shrink-0 items-center rounded-full border px-1 transition-colors"
    >
      {/*
        La perilla. Viaja con `transform` y no cambiando `left`: así el navegador la mueve sin
        rehacer el layout, y la sombra la acompaña sin arrastrarse.
      */}
      <span
        aria-hidden="true"
        className={`brand-fill absolute h-7 w-7 rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isLight ? 'translate-x-7' : 'translate-x-0'
        }`}
      />

      {/*
        Los dos íconos, por encima de la perilla. El que está debajo de ella se pinta con el
        color del fondo para que se lea recortado sobre el verde; el otro queda apagado.
      */}
      <span
        aria-hidden="true"
        className={`relative z-10 flex h-7 w-7 items-center justify-center transition-colors duration-300 ${
          isLight ? 'text-text-muted' : 'text-background'
        }`}
      >
        <MoonIcon className="h-4 w-4" />
      </span>
      <span
        aria-hidden="true"
        className={`relative z-10 flex h-7 w-7 items-center justify-center transition-colors duration-300 ${
          isLight ? 'text-background' : 'text-text-muted'
        }`}
      >
        <SunIcon className="h-4 w-4" />
      </span>
    </button>
  )
}
