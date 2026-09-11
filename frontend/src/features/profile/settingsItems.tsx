import { Link } from 'react-router'

import ThemeToggle from '@/features/theme/ThemeToggle'

import LegalScroll, { type Clause } from './components/LegalScroll'

/**
 * Las configuraciones del perfil: el listado y lo que hay adentro de cada una.
 *
 * **Están todas en un archivo porque son una lista, no siete pantallas.** Cada una se abre
 * dentro de la misma tarjeta y lo que muestra son unos párrafos; partirlas en un archivo por
 * cada una dejaría siete archivos cortos y ningún lugar donde leer la lista entera.
 *
 * **Las que dependen de algo que existe hacen lo que dicen**: el tema se cambia, el enlace de
 * contacto lleva al formulario, y lo que se cuenta sobre la ubicación y los datos es lo que la
 * aplicación hace de verdad. Los dos textos legales son el borrador del trabajo práctico, y lo
 * dicen al final en vez de hacerse pasar por un contrato vigente.
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
 *
 * **Sin ancho máximo.** Un renglón corto se lee mejor que uno larguísimo, pero acá el texto vive
 * adentro de una tarjeta que ya tiene su propio relleno y su propio ancho: capándolo otra vez
 * dejaba media tarjeta escrita y media vacía.
 */
const BODY_TEXT = 'text-text-muted text-sm leading-relaxed'

const TERMS: Clause[] = [
  {
    title: '1. Qué es este servicio',
    text: 'Ecopedia es una plataforma que conecta a conductores de vehículos eléctricos con estaciones de carga rápida operadas por terceros. Publica la información de esas estaciones, permite reservar un conector por una ventana de tiempo y cobra la energía entregada. Ecopedia no opera las estaciones ni suministra la energía: eso lo hace el operador de cada punto de carga.',
  },
  {
    title: '2. Tu cuenta',
    text: 'Para reservar hace falta una cuenta. Los datos que se cargan al registrarse tienen que ser reales y mantenerse actualizados, porque de ellos dependen el comprobante de la carga y el cobro. La cuenta es personal: quien la usa es responsable de lo que se haga desde ella, así que la contraseña no se comparte. Si sospechás que alguien entró con tus credenciales, cambiala y avisanos.',
  },
  {
    title: '3. Reservas',
    text: 'Una reserva toma un conector determinado durante una ventana de tiempo determinada. Se mantiene durante los primeros quince minutos de esa ventana: pasado ese plazo sin que la carga haya empezado, el conector se libera para otro conductor y la reserva queda cancelada. Cancelar antes del inicio no tiene costo.',
  },
  {
    title: '4. Uso de las estaciones',
    text: 'El conductor es responsable de que su vehículo sea compatible con el conector que reservó y de usar el equipo según las indicaciones del operador. Cualquier daño causado por un uso indebido del cargador corre por cuenta de quien lo provocó. Si el equipo no funciona, la vía es reportarlo desde la aplicación y no intentar repararlo.',
  },
  {
    title: '5. Precios y cobro',
    text: 'El precio de cada carga surge de la energía entregada, de la tarifa vigente en esa estación y del momento en que se cargó. La tarifa aplicable se muestra antes de confirmar la reserva. El importe se debita del medio de pago elegido al terminar la sesión, y el detalle queda en el historial.',
  },
  {
    title: '6. Medios de pago',
    text: 'Para reservar hace falta al menos una tarjeta vigente registrada. Ecopedia no guarda el número completo: lo procesa la pasarela de pagos, que devuelve un identificador con el que se hacen los cobros. Una tarjeta vencida o rechazada impide reservar hasta que se cargue otra.',
  },
  {
    title: '7. Disponibilidad del servicio',
    text: 'La plataforma puede interrumpirse por mantenimiento, por fallas de un operador o por causas ajenas a Ecopedia. Cuando el corte es programado se avisa con antelación. El estado de un conector se muestra tal como lo informa su operador, así que puede cambiar entre la consulta y la llegada a la estación.',
  },
  {
    title: '8. Responsabilidad',
    text: 'Ecopedia responde por el funcionamiento de la plataforma: la reserva, el cobro y la información que publica. No responde por el estado del vehículo, por la calidad del suministro eléctrico ni por los daños ocurridos en la estación, que son responsabilidad de su operador.',
  },
  {
    title: '9. Baja de la cuenta',
    text: 'La cuenta se puede dar de baja en cualquier momento escribiéndonos desde la sección de ayuda. La baja no borra los comprobantes de las cargas ya hechas: respaldan una operación comercial y se conservan por el plazo que exige la ley.',
  },
  {
    title: '10. Cambios en estos términos',
    text: 'Estos términos pueden cambiar cuando cambie el servicio. Los cambios se avisan dentro de la aplicación antes de que entren en vigencia, y seguir usando la plataforma después de esa fecha implica aceptarlos.',
  },
]

const PRIVACY: Clause[] = [
  {
    title: '1. Qué datos pedimos',
    text: 'Al registrarte pedimos tu nombre y tu correo. Al cargar un medio de pago, los datos de la tarjeta viajan a la pasarela, que nos devuelve solamente la marca, los últimos cuatro números y el vencimiento: el número completo no queda guardado en nuestros servidores.',
  },
  {
    title: '2. Qué datos genera el uso',
    text: 'Cada reserva y cada sesión de carga dejan un registro con la estación, el conector, los horarios y la energía entregada. Son los datos que arman tu historial y el comprobante del cobro.',
  },
  {
    title: '3. Tu ubicación',
    text: 'El mapa y la portada usan la ubicación del dispositivo para ordenar las estaciones por distancia. La pide el navegador, se calcula en tu equipo y no se envía ni se guarda en nuestros servidores. Sin permiso, las dos pantallas funcionan igual midiendo desde un punto fijo de la ciudad.',
  },
  {
    title: '4. Qué guarda tu navegador',
    text: 'En este dispositivo quedan la sesión abierta —para no tener que entrar en cada visita— y el tema elegido. Las dos cosas se borran al cerrar sesión o al limpiar los datos del sitio.',
  },
  {
    title: '5. Con quién se comparten',
    text: 'Con el operador de la estación se comparte lo mínimo para que la reserva funcione, y con la pasarela de pagos lo necesario para cobrar. No vendemos datos personales ni los cedemos con fines publicitarios.',
  },
  {
    title: '6. Cuánto tiempo se conservan',
    text: 'Los datos de la cuenta se conservan mientras la cuenta exista. Los comprobantes de cargas y cobros se conservan por el plazo que exige la ley aunque la cuenta se dé de baja.',
  },
  {
    title: '7. Tus derechos',
    text: 'Podés pedir una copia de tus datos, corregirlos o pedir que se eliminen los que no estemos obligados a conservar. El camino es escribirnos desde la sección de ayuda con el correo de tu cuenta.',
  },
]

const DRAFT_NOTE =
  'Este texto es el borrador del trabajo práctico de la materia: sirve para mostrar cómo se lee la pantalla, no es un contrato vigente ni lo revisó nadie con título de abogado.'

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
        <p className={BODY_TEXT}>
          De las tarjetas guardadas no tenemos el número completo: la pasarela de pagos devuelve la
          marca, los últimos cuatro dígitos y el vencimiento, y eso es todo lo que se ve en Medios
          de pago.
        </p>
      </div>
    ),
  },
  {
    id: 'terms',
    label: 'Términos y condiciones',
    summary: 'Las reglas del servicio, en diez puntos.',
    Body: () => <LegalScroll clauses={TERMS} closing={DRAFT_NOTE} />,
  },
  {
    id: 'privacy',
    label: 'Política de privacidad',
    summary: 'Qué datos se guardan y con quién se comparten.',
    Body: () => <LegalScroll clauses={PRIVACY} closing={DRAFT_NOTE} />,
  },
  {
    id: 'help',
    label: 'Ayuda y contacto',
    summary: 'Cómo escribirnos.',
    Body: () => (
      <div className="flex flex-col items-start gap-4">
        <p className={BODY_TEXT}>
          Si algo no funciona, si falta una estación o si querés dar de baja tu cuenta, el
          formulario de contacto llega al equipo. Es la misma pantalla que está en la barra de
          arriba.
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
