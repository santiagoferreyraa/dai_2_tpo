import { useRef } from 'react'

import { useWheelToHorizontal } from '../useWheelToHorizontal'

/**
 * Fotos de la estación en el formulario: agregar desde el celular y sacar las que sobran.
 *
 * El backend guarda URLs (`station_photos.url`), no archivos, y todavía no hay dónde subir
 * una imagen. Así que lo que el selector produce es un object URL local: la miniatura se
 * ve, pero la dirección solo existe en esta pestaña y no sobrevive a un recargado. Es
 * suficiente para el formulario y hay que reemplazarlo por una subida real cuando exista
 * el endpoint.
 */
interface ImagePickerProps {
  value: string[]
  onChange: (photoUrls: string[]) => void
}

/** Un object URL es local; una foto que vino del backend es una dirección http. */
function isLocal(url: string): boolean {
  return url.startsWith('blob:')
}

export default function ImagePicker({ value, onChange }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const stripRef = useWheelToHorizontal<HTMLDivElement>()

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    onChange([...value, ...Array.from(files).map((file) => URL.createObjectURL(file))])
  }

  const removeAt = (index: number) => {
    const removed = value[index]
    /*
     * Solo se libera lo que se descarta acá. Liberar al desmontar sería peor: la misma URL
     * la sigue mostrando el listado después de guardar, y revocarla dejaría la foto rota.
     */
    if (removed && isLocal(removed)) URL.revokeObjectURL(removed)
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <section className="mt-6">
      <h3 className="text-st-muted text-lg font-bold">IMAGES</h3>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          addFiles(event.target.files)
          /* Se limpia para que elegir dos veces el mismo archivo vuelva a disparar el cambio. */
          event.target.value = ''
        }}
      />

      <div
        ref={stripRef}
        className="max-md:no-scrollbar md:slim-scrollbar mt-3 w-full min-w-0 overflow-x-auto pb-2"
      >
        {/*
          El que scrollea es este contenedor y la lista va adentro con `w-max`. Con el
          `overflow` puesto en la lista misma, su ancho dependía de que se lo fijara el
          padre: adentro del panel lateral no pasaba, la fila crecía hasta desbordarlo
          y el recorte terminaba haciéndolo el panel, que no scrollea de costado.
        */}
        <ul className="flex w-max gap-3">
          <li className="shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="border-st-muted/60 text-st-muted hover:border-st-accent hover:text-st-accent focus-visible:outline-st-accent flex h-24 w-36 items-center justify-center rounded-xl border-2 border-dashed transition-colors focus-visible:outline-2"
              aria-label="Agregar fotos"
            >
              {/* Dibujada y no el carácter "+", que nunca queda centrado. */}
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </li>

          {value.map((url, index) => (
            /*
            Sin relleno alrededor: la miniatura tiene que quedar a la misma altura y del
            mismo tamaño que el recuadro que agrega. Por eso la cruz va DENTRO de la
            imagen y no colgando de su esquina, que además la recortaría el scroll.
          */
            <li key={`${url}-${index}`} className="relative shrink-0">
              <img
                src={url}
                alt={`Foto ${index + 1}`}
                className="h-24 w-36 rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Quitar la foto ${index + 1}`}
                className="bg-st-offline focus-visible:outline-st-accent absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full text-white focus-visible:outline-2"
              >
                {/* Dibujada, por el mismo motivo que el "+": el carácter no queda centrado. */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
