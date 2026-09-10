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
      /*
        El alto es el del buscador, que es el que manda en la franja: los tres controles de
        arriba miden lo mismo. De ese alto sale todo lo demás —la perilla, los íconos y el
        ancho—, así que las medidas de acá abajo no son sueltas: `w-22` menos el `px-1` da
        exactamente dos íconos de `w-10`, y por eso la perilla viaja `translate-x-10`, que es
        justo de un ícono al otro.

        El vidrio es el mismo de la ficha del perfil, que tiene al lado: antes era un fondo
        propio, parecido pero sin la sombra, y de los dos controles solo uno se despegaba de la
        página.
      */
      className="glass-panel relative flex h-12 w-22 shrink-0 items-center rounded-full px-1"
    >
      {/*
        La perilla. Viaja con `transform` y no cambiando `left`: así el navegador la mueve sin
        rehacer el layout, y la sombra la acompaña sin arrastrarse.
      */}
      <span
        aria-hidden="true"
        className={`brand-fill absolute h-10 w-10 rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isLight ? 'translate-x-10' : 'translate-x-0'
        }`}
      />

      {/*
        Los dos íconos, por encima de la perilla. El que está debajo de ella se pinta con el
        color del fondo para que se lea recortado sobre el verde; el otro queda apagado.
      */}
      <span
        aria-hidden="true"
        className={`relative z-10 flex h-10 w-10 items-center justify-center transition-colors duration-300 ${
          isLight ? 'text-text-muted' : 'text-background'
        }`}
      >
        <MoonIcon className="h-5 w-5" />
      </span>
      <span
        aria-hidden="true"
        className={`relative z-10 flex h-10 w-10 items-center justify-center transition-colors duration-300 ${
          isLight ? 'text-background' : 'text-text-muted'
        }`}
      >
        <SunIcon className="h-5 w-5" />
      </span>
    </button>
  )
}
