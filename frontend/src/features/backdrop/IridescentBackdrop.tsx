import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'

import { useTheme } from '@/features/theme/theme'

import { blendPalette, paletteFor, type BackdropPalette } from './palettes'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shader'

/**
 * El fondo iridiscente animado.
 *
 * Es un lienzo fijo detrás de todo, con un shader que dibuja una superficie nacarada en
 * movimiento (ver `shader.ts`). Va debajo del degradado de tokens de `.app-shell`, que queda como
 * red: si el navegador no tiene WebGL 2, si la placa pierde el contexto o si estamos en el mapa,
 * acá no se dibuja nada y abajo sigue habiendo un fondo presentable.
 *
 * **En el mapa no corre**, y no es por estética. Esa pantalla ya tiene a Leaflet moviendo
 * mosaicos, pines y un panel, y el mapa tapa casi todo el fondo: se pagaría el costo de dibujar
 * algo que casi no se ve. Al salir de esa ruta el componente se desmonta y suelta el contexto de
 * video, en vez de quedar pausado ocupándolo.
 *
 * Tres decisiones que bajan el costo sin que se note en pantalla:
 *
 * - **Se dibuja a la mitad de resolución** y el navegador lo agranda. En un degradado sin detalle
 *   fino no hay nada que perder, y son cuatro veces menos píxeles que calcular.
 * - **Se limita a 30 cuadros por segundo.** Las formas se mueven muy lento; a 60 se gasta el
 *   doble para dibujar dos veces casi lo mismo.
 * - **Se apaga con la pestaña.** Sin esto seguiría calculando de fondo, gastando batería por algo
 *   que nadie está mirando.
 */

/** Rutas donde el fondo no se dibuja. Ver el motivo arriba. */
const HIDDEN_ROUTES = ['/stations/map']

/** Fracción de la resolución real a la que se dibuja. */
const RENDER_SCALE = 0.5

/**
 * Ancho máximo del lienzo interno, en píxeles.
 *
 * La mitad de la resolución alcanza hasta cierto tamaño de pantalla; pasado eso, la mitad sigue
 * siendo mucho. En un monitor 4K la mitad son casi dos millones de píxeles a calcular por cuadro
 * para un fondo desenfocado donde nadie va a notar la diferencia. El techo corta ahí: de este
 * ancho para arriba se dibuja siempre lo mismo y lo agranda el navegador.
 */
const MAX_RENDER_WIDTH = 1280

const FRAME_MS = 1000 / 30

/** Cuánto se acerca la paleta a su destino por cuadro, al cambiar de tema. */
const PALETTE_BLEND_PER_FRAME = 0.08

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (shader === null) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    /*
      Solo en desarrollo: un error de compilación del shader es un error nuestro de programación,
      no algo que le pueda pasar a un usuario, y en producción el fondo simplemente no se dibuja.
    */
    if (import.meta.env.DEV) console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function createProgram(gl: WebGL2RenderingContext) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  if (vertex === null || fragment === null) return null

  const program = gl.createProgram()
  if (program === null) return null

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)

  /* Ya están dentro del programa enlazado: las copias sueltas no hacen falta. */
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (import.meta.env.DEV) console.error(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }

  return program
}

export default function IridescentBackdrop() {
  const { pathname } = useLocation()
  const theme = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /*
   * La paleta de destino vive en una referencia y no en el estado del efecto: el bucle de dibujo
   * la lee en cada cuadro, y si fuera una dependencia habría que desmontar y rearmar todo el
   * contexto de video en cada cambio de tema.
   */
  const targetPalette = useRef<BackdropPalette>(paletteFor(theme))
  useEffect(() => {
    targetPalette.current = paletteFor(theme)
  }, [theme])

  /* Para que el lienzo entre con una disolvencia en vez de aparecer de golpe al cargar. */
  const [painted, setPainted] = useState(false)

  const hidden = HIDDEN_ROUTES.includes(pathname)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    /*
      `alpha: false` porque el fondo es opaco y así el compositor no tiene que mezclarlo con nada.
      `antialias: false` porque no hay bordes que suavizar, solo degradados. `low-power` para no
      despertar la placa dedicada de una notebook por un fondo.
    */
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    })

    /* Sin WebGL 2 no se dibuja nada y queda el degradado de `.app-shell`. */
    if (gl === null) return

    const program = createProgram(gl)
    if (program === null) return

    const uniform = (name: string) => gl.getUniformLocation(program, name)
    const uResolution = uniform('uResolution')
    const uTime = uniform('uTime')
    const uPaletteA = uniform('uPaletteA')
    const uPaletteB = uniform('uPaletteB')
    const uPaletteC = uniform('uPaletteC')
    const uPaletteD = uniform('uPaletteD')
    const uSpecularColor = uniform('uSpecularColor')
    const uSpecularStrength = uniform('uSpecularStrength')
    const uRelief = uniform('uRelief')

    /*
      El triángulo se arma dentro del shader a partir del número de vértice, así que no hay
      atributos que enlazar. Igual hace falta un objeto de vértices atado: WebGL 2 exige uno para
      dibujar, aunque esté vacío.
    */
    const emptyVao = gl.createVertexArray()
    gl.bindVertexArray(emptyVao)
    gl.useProgram(program)

    let palette: BackdropPalette = { ...targetPalette.current }
    let frame = 0
    let lastFrameAt = 0
    const startedAt = performance.now()

    const resize = () => {
      /* El menor entre la mitad y el techo, para que la proporción no se deforme. */
      const scale = Math.min(RENDER_SCALE, MAX_RENDER_WIDTH / Math.max(canvas.clientWidth, 1))
      const width = Math.max(1, Math.round(canvas.clientWidth * scale))
      const height = Math.max(1, Math.round(canvas.clientHeight * scale))
      if (canvas.width === width && canvas.height === height) return

      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
    }

    const draw = (elapsedSeconds: number) => {
      palette = blendPalette(palette, targetPalette.current, PALETTE_BLEND_PER_FRAME)

      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.uniform1f(uTime, elapsedSeconds)
      gl.uniform3fv(uPaletteA, palette.a)
      gl.uniform3fv(uPaletteB, palette.b)
      gl.uniform3fv(uPaletteC, palette.c)
      gl.uniform3fv(uPaletteD, palette.d)
      gl.uniform3fv(uSpecularColor, palette.specularColor)
      gl.uniform1f(uSpecularStrength, palette.specularStrength)
      gl.uniform1f(uRelief, palette.relief)

      gl.drawArrays(gl.TRIANGLES, 0, 3)
      setPainted(true)
    }

    /*
      Para quien pidió menos movimiento se dibuja UN cuadro y se corta el bucle. El fondo sigue
      estando —el tornasol no molesta a nadie—, lo que se saca es el movimiento, que es lo que la
      preferencia pide. La paleta se salta la mezcla porque no hay cuadros siguientes donde
      terminarla.
    */
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)
      if (now - lastFrameAt < FRAME_MS) return
      lastFrameAt = now

      resize()
      draw((now - startedAt) / 1000)
    }

    if (reducedMotion) {
      resize()
      palette = { ...targetPalette.current }
      draw(0)
    } else {
      frame = requestAnimationFrame(loop)
    }

    const observer = new ResizeObserver(() => {
      resize()
      /* Con el bucle detenido hay que repintar a mano, o el lienzo queda en blanco al achicar. */
      if (reducedMotion) draw(0)
    })
    observer.observe(canvas)

    /* Con la pestaña de fondo no hay nada que mirar: se corta el bucle y se retoma al volver. */
    const onVisibilityChange = () => {
      if (reducedMotion) return
      cancelAnimationFrame(frame)
      if (!document.hidden) frame = requestAnimationFrame(loop)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    /*
      La placa puede quitarnos el contexto —al suspender el equipo, o si otra pestaña lo agota—.
      `preventDefault` es lo que deja la puerta abierta a recuperarlo; sin eso el contexto queda
      muerto para siempre. Mientras tanto se corta el bucle, porque dibujar sin contexto solo
      llena la consola de errores.
    */
    const onContextLost = (event: Event) => {
      event.preventDefault()
      cancelAnimationFrame(frame)
    }
    canvas.addEventListener('webglcontextlost', onContextLost)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      canvas.removeEventListener('webglcontextlost', onContextLost)

      gl.deleteVertexArray(emptyVao)
      gl.deleteProgram(program)

      /*
        Acá NO se fuerza la pérdida del contexto con `WEBGL_lose_context`, aunque sea tentador
        para liberar la memoria de video en el acto: un contexto perdido a la fuerza deja el
        lienzo inservible PARA SIEMPRE, y este componente se vuelve a montar —al entrar y salir
        del mapa, y dos veces seguidas en desarrollo por el modo estricto de React—. La segunda
        vez encontraría un contexto muerto en el que ni siquiera compilan los shaders, y el fondo
        no volvería nunca.

        Un lienzo que se desmonta se lo lleva el recolector con su contexto adentro; borrar el
        programa y el objeto de vértices es todo lo que hay que hacer a mano.
      */
    }
  }, [hidden])

  if (hidden) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-700 ${
        painted ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}
