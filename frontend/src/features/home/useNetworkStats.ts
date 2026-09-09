import { useEffect, useState } from 'react'

import { fetchNetworkStats, type NetworkStats } from './data/networkStats'

/**
 * Los números de la red, listos para una tarjeta.
 *
 * **No expone un estado de error, y es deliberado.** Esto alimenta las tarjetas de una portada,
 * no una pantalla de trabajo: si el backend no contesta, lo que corresponde es que las tarjetas
 * muestren un guion y la página siga siendo perfectamente usable, no un cartel rojo sobre la
 * primera cosa que alguien ve al entrar. Quien necesita los datos de verdad va al mapa, y ahí sí
 * el error se muestra.
 *
 * Por eso devuelve `null` en los dos casos que no son "hay datos" —cargando y falló—, y quien lo
 * usa dibuja lo mismo para ambos.
 */
export function useNetworkStats(): NetworkStats | null {
  const [stats, setStats] = useState<NetworkStats | null>(null)

  useEffect(() => {
    /*
      Se cancela al desmontar. Sin esto, salir de la portada antes de que conteste deja una
      respuesta buscando un componente que ya no está.
    */
    const controller = new AbortController()

    fetchNetworkStats(controller.signal)
      .then(setStats)
      .catch(() => {
        /* Silencio a propósito: ver arriba. */
      })

    return () => controller.abort()
  }, [])

  return stats
}
