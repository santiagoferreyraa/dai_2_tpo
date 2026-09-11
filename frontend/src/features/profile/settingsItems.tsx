import { Link } from 'react-router'

import ThemeToggle from '@/features/theme/ThemeToggle'

/**
 * Las configuraciones del perfil: el listado y lo que hay adentro de cada una.
 *
 * **Están todas en un archivo porque son una lista, no siete pantallas.** Cada una se abre
 * dentro de la misma tarjeta y lo que muestra son dos o tres renglones; partirlas en un archivo
 * por cada una dejaría siete archivos de doce líneas y ningún lugar donde leer la lista entera.
 *
 * **Ninguna promete algo que la aplicación no haga.** Las que dependen de algo que existe —el
 * tema, la ubicación, el contacto— hacen lo que dicen; las que son un texto que todavía no está
 * escrito lo dicen así, en vez de mostrar un párrafo inventado de términos legales. Es el mismo
 * criterio que el resto del proyecto: antes vacío que falso.
 */

export interface SettingItem {
  id: string
  label: string
  /** El renglón corto que acompaña al título adentro del detalle. */
  summary: string
  Body: () => React.ReactElement
}

/**
 * Cómo se lee un párrafo del cuerpo. Es una clase suelta y no un componente a propósito: este
 * archivo exporta una lista de datos, y definir componentes adentro lo convierte en un módulo
 * mixto que el recargado en caliente de Vite ya no puede tratar como uno ni como otro.
 */
const BODY_TEXT = 'text-text-muted max-w-prose text-sm leading-relaxed'

export const SETTINGS: SettingItem[] = [
  {
    id: 'appearance',
    label: 'Apariencia',
    summary: 'El tema con el que se ve la aplicación.',
    Body: () => (
      <div className="flex flex-col gap-4">
        <p className={BODY_TEXT}>
          El tema claro y el oscuro son la misma aplicación con otra paleta. La elección se guarda
          en este dispositivo, así que no viaja con la cuenta: si entrás desde otra computadora, esa
          arranca siguiendo lo que tenga configurado el sistema.
        </p>
        <div className="flex items-center gap-4">
          <span className="text-text text-sm font-medium">Tema claro</span>
          <ThemeToggle />
        </div>
      </div>
    ),
  },
  {
    id: 'location',
    label: 'Ubicación',
    summary: 'Para qué se usa dónde estás.',
    Body: () => (
      <div className="flex flex-col gap-4">
        <p className={BODY_TEXT}>
          El mapa y la portada usan tu ubicación para ordenar las estaciones por distancia y para
          decirte cuál te queda más cerca. La pide el navegador, no la aplicación, y sin permiso las
          dos pantallas funcionan igual: miden desde un punto fijo de la ciudad.
        </p>
        <p className={BODY_TEXT}>
          La ubicación no se guarda ni se manda al servidor: la cuenta se hace en el navegador y se
          descarta al cerrar la pestaña. El permiso se da y se quita desde el candado de la barra de
          direcciones.
        </p>
      </div>
    ),
  },
  {
    id: 'data',
    label: 'Tus datos',
    summary: 'Qué guarda la aplicación y dónde.',
    Body: () => (
      <div className="flex flex-col gap-4">
        <p className={BODY_TEXT}>
          En el servidor viven tu nombre, tu correo y tu rol. Es lo que se ve en la barra de arriba
          de esta pantalla y lo único que se puede editar desde acá.
        </p>
        <p className={BODY_TEXT}>
          En este navegador quedan dos cosas más: la sesión abierta —para no tener que entrar en
          cada visita— y el tema elegido. Las dos se borran al cerrar sesión o al limpiar los datos
          del sitio.
        </p>
      </div>
    ),
  },
  {
    id: 'terms',
    label: 'Términos y condiciones',
    summary: 'Todavía no están redactados.',
    Body: () => (
      <p className={BODY_TEXT}>
        Acá va a ir el texto de los términos del servicio. Todavía no está escrito, y preferimos
        decirlo antes que mostrar un texto de relleno que parezca un contrato.
      </p>
    ),
  },
  {
    id: 'privacy',
    label: 'Política de privacidad',
    summary: 'Todavía no está redactada.',
    Body: () => (
      <p className={BODY_TEXT}>
        Acá va a ir la política de privacidad. Mientras tanto, lo que la aplicación guarda de vos
        está contado en "Tus datos", que dice lo mismo pero sin la parte legal.
      </p>
    ),
  },
  {
    id: 'help',
    label: 'Ayuda y contacto',
    summary: 'Cómo escribirnos.',
    Body: () => (
      <div className="flex flex-col items-start gap-4">
        <p className={BODY_TEXT}>
          Si algo no funciona o falta una estación, el formulario de contacto llega al equipo. Es la
          misma pantalla que está en la barra de arriba.
        </p>
        <Link
          to="/contact"
          className="brand-fill text-on-primary rounded-xl px-4 py-2 text-sm font-semibold"
        >
          Ir a contacto
        </Link>
      </div>
    ),
  },
  {
    id: 'about',
    label: 'Acerca de Ecopedia',
    summary: 'Qué es esto y quién lo hace.',
    Body: () => (
      <div className="flex flex-col gap-4">
        <p className={BODY_TEXT}>
          Ecopedia es una plataforma de gestión, reserva y tarificación de estaciones de carga
          rápida para vehículos eléctricos.
        </p>
        <p className={BODY_TEXT}>
          Es el trabajo práctico integrador de Desarrollo de Aplicaciones II, comisión lunes turno
          mañana, segundo cuatrimestre de 2026.
        </p>
      </div>
    ),
  },
]
