import { useEffect, useId, useState } from 'react'
import { useNavigate } from 'react-router'

import { clearSession, useSession } from '@/features/auth/session'
import { CrossIcon } from '@/features/navigation/icons'

/**
 * El botón de cerrar sesión: un redondel con una cruz, debajo del riel de secciones.
 *
 * **Está afuera del riel y no adentro.** El riel son destinos —cuatro lugares de la misma
 * pantalla— y esto no lleva a ningún lado: corta la sesión. Metido entre los cuatro se leería
 * como una quinta sección y se tocaría por error, que es el error más caro de esta pantalla.
 * Separado por un espacio, con la misma forma y el mismo vidrio, se lee como lo que es: parte
 * de la misma columna, pero otra cosa.
 *
 * **Y por eso pregunta antes.** Cerrar sesión no se deshace con el botón de atrás: hay que
 * volver a escribir la contraseña. Un clic accidental en un redondel que está al lado de la
 * navegación no puede costar eso.
 *
 * Sin sesión no se dibuja: no hay nada que cerrar.
 */
export default function ProfileExit() {
  const session = useSession()
  const [asking, setAsking] = useState(false)

  if (session === null) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setAsking(true)}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        /*
          El mismo vidrio y el mismo ancho que el riel, para que se lea como parte de la columna.
          El rojo aparece recién al pasar por encima: en reposo sería un semáforo prendido al
          lado de la navegación.
        */
        className="glass-panel text-text-muted hover:border-danger/60 hover:text-danger flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors md:h-16 md:w-16"
      >
        <CrossIcon className="h-5 w-5" />
      </button>

      {asking && <ExitDialog onCancel={() => setAsking(false)} />}
    </>
  )
}

/**
 * La pregunta, en una ventana sobre el resto de la pantalla.
 *
 * **Las dos salidas no pesan lo mismo y se nota en el dibujo:** cerrar sesión es el botón verde
 * —lo que la aplicación está ofreciendo hacer— y cancelar es texto al lado. Invertirlo dejaría
 * la acción destructiva escondida y la inocente resaltada, que es cómo se toca lo que no se
 * quería tocar.
 *
 * La tecla Escape cancela y el fondo también: son las dos formas en que cualquiera cierra una
 * ventana sin leerla, y las dos tienen que caer del lado seguro.
 */
function ExitDialog({ onCancel }: { onCancel: () => void }) {
  const navigate = useNavigate()
  const titleId = useId()

  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  function handleLogout(): void {
    clearSession()
    /* Al salir se vuelve a la portada: quedarse en una ruta privada dispararía el guard. */
    void navigate('/', { replace: true })
  }

  return (
    /*
      Por encima de todo, la barra del celular incluida —que vive en 1100—, o la ventana
      aparecería con la navegación flotando por delante.
    */
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
      onClick={onCancel}
    >
      {/*
        El clic de adentro no se propaga: sin esto, tocar el propio texto de la ventana la
        cerraría, porque el clic termina llegando al fondo.
      */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="glass-panel glass-modal w-full max-w-sm rounded-3xl p-6"
      >
        <h2 id={titleId} className="text-text text-lg font-extrabold tracking-tight">
          ¿Cerrás la sesión?
        </h2>
        <p className="text-text-muted mt-2 text-sm leading-relaxed">
          Vas a volver a la portada. Para entrar de nuevo hay que escribir el correo y la
          contraseña.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          {/*
            El foco arranca en cancelar. Quien llegó acá sin querer aprieta Enter para sacarse la
            ventana de encima, y esa tecla tiene que caer del lado que no rompe nada.
          */}
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="text-text-muted hover:text-text cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="brand-fill text-on-primary cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
