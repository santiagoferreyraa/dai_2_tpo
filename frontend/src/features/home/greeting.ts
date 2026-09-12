/**
 * El saludo, según la hora del aparato.
 *
 * Vive suelto porque lo usan las dos portadas y dicen el saludo en lugares distintos: en el
 * celular va arriba de todo, encabezando la pantalla, y en escritorio adentro del recuadro del
 * auto. Con la función repetida en cada uno, cambiar a qué hora empieza la tarde arregla una sola
 * de las dos pantallas y nadie se entera hasta que alguien las ve al lado.
 *
 * La hora sale del dispositivo y no del backend a propósito: el saludo acompaña a quien está
 * mirando la pantalla, así que el reloj que importa es el suyo.
 */
export function greetingFor(hour: number): string {
  if (hour < 12) return 'Buen día'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
}
