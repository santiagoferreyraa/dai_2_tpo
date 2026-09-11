import { useState } from 'react'

import { ArrowLeftIcon, ChevronRightIcon } from '@/features/navigation/icons'

import ProfileCard from './components/ProfileCard'
import { SETTINGS, type SettingItem } from './settingsItems'

/**
 * La sección "Configuración": el listado de ajustes y, adentro de la misma tarjeta, el detalle
 * del que se abra.
 *
 * **El detalle no es otra pantalla ni un panel encima: reemplaza al listado en el mismo lugar.**
 * Cada ajuste ocupa dos o tres renglones, así que abrir una ventana para eso es desproporcionado,
 * y una ruta nueva por cada uno llenaría el ruteo de destinos que nadie enlaza. Lo que hay es un
 * ir y volver adentro del recuadro, con la flecha que devuelve.
 *
 * **Por eso el estado vive acá y no en la dirección.** Es la excepción a lo que hacen las cuatro
 * secciones —que sí son rutas—: aquéllas se enlazan desde el riel y conviene poder compartirlas;
 * esto es un paso adentro de una de ellas.
 */
export default function SettingsPage() {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = SETTINGS.find((setting) => setting.id === openId) ?? null

  return (
    <div className="grid md:h-full">
      <ProfileCard className="md:overflow-y-auto">
        {open === null ? (
          <SettingsList onOpen={setOpenId} />
        ) : (
          <SettingDetail setting={open} onBack={() => setOpenId(null)} />
        )}
      </ProfileCard>
    </div>
  )
}

/**
 * El listado, en dos columnas con una línea en el medio.
 *
 * **Dos columnas y no una lista larga** porque son siete renglones cortos: en una sola columna
 * ocupan un tercio del alto de la tarjeta y dejan el resto vacío, con cada nombre perdido en un
 * renglón del ancho de la pantalla. Partidos al medio, la lista se lee de un vistazo.
 *
 * El reparto es cuatro y tres, no mitad exacta: con número impar, la columna que sobra es la de
 * la izquierda, que es por donde se empieza a leer.
 */
function SettingsList({ onOpen }: { onOpen: (id: string) => void }) {
  const half = Math.ceil(SETTINGS.length / 2)
  const columns = [SETTINGS.slice(0, half), SETTINGS.slice(half)]

  return (
    <div className="md:divide-border/60 grid gap-2 md:grid-cols-2 md:gap-8 md:divide-x">
      {columns.map((column, index) => (
        <ul key={index} className={`flex flex-col gap-1 ${index === 1 ? 'md:pl-8' : 'md:pr-8'}`}>
          {column.map((setting) => (
            <li key={setting.id}>
              <button
                type="button"
                onClick={() => onOpen(setting.id)}
                className="text-text hover:bg-surface/40 flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition-colors"
              >
                {setting.label}
                {/*
                  El galón es lo que distingue un renglón que ABRE algo de uno que solo informa.
                  Va apagado: señala, no llama.
                */}
                <ChevronRightIcon className="text-text-muted h-4 w-4 shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}

/** Un ajuste abierto: la flecha para volver, el título y su contenido. */
function SettingDetail({ setting, onBack }: { setting: SettingItem; onBack: () => void }) {
  const { Body } = setting

  return (
    <div className="flex flex-col">
      <header className="flex items-center gap-3">
        {/*
          La flecha va en un redondel con el vidrio de siempre, del tamaño de un blanco para el
          dedo. Es el único camino de vuelta, así que no puede ser un texto chico.
        */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a la lista de configuración"
          className="glass-panel text-text hover:border-primary/60 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors"
        >
          <ArrowLeftIcon className="h-4.5 w-4.5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-text text-base font-extrabold tracking-tight">{setting.label}</h2>
          <p className="text-text-muted truncate text-xs">{setting.summary}</p>
        </div>
      </header>

      <div className="mt-6">
        <Body />
      </div>
    </div>
  )
}
