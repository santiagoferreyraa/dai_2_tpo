import { useSyncExternalStore } from 'react'

/**
 * El tema de la aplicación: dónde vive, cómo sobrevive a un F5 y quién se entera cuando cambia.
 *
 * Cubre **RNF08** (soporte multitema en tiempo de ejecución). Está escrito con la misma forma
 * que `features/auth/session.ts`: un módulo con su estado, React leyéndolo con
 * `useSyncExternalStore` y una función para cambiarlo. El motivo es el mismo —el tema se aplica
 * sobre `<html>`, que está fuera del árbol de React— y de paso las dos piezas se leen igual.
 *
 * **El tema no se guarda en una clase de React ni en un contexto**, se escribe como atributo en
 * `<html>`. Así el CSS puede redefinir los tokens sin que ningún componente se entere: los
 * botones, las tarjetas y la navegación siguen diciendo `bg-surface` y cambian de color solos.
 * Ver `index.css`.
 *
 * **Se aplica al importar el módulo**, antes del primer render (ver el final del archivo). Si se
 * hiciera dentro de un efecto, la primera pintura saldría con el tema equivocado y se vería el
 * parpadeo blanco clásico al recargar en oscuro.
 */

const STORAGE_KEY = 'ecopedia.theme'

export type Theme = 'dark' | 'light'

let theme: Theme = 'dark'
const listeners = new Set<() => void>()

function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light'
}

/**
 * El tema con el que arranca la aplicación.
 *
 * Sin elección guardada se sigue **la preferencia del sistema operativo**, que es lo que
 * `RNF08` llama el tema "predeterminado": alguien que tiene el teléfono en claro espera que una
 * aplicación que abre por primera vez también lo esté. Después de la primera vez manda lo que
 * el usuario haya elegido, aunque el sistema diga otra cosa.
 */
function initialTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (isTheme(stored)) return stored
  } catch {
    /* Modo incógnito o almacenamiento bloqueado: se decide por el sistema. */
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/**
 * Escribe el tema en el documento.
 *
 * `color-scheme` va junto con el atributo y no es un adorno: es lo que le avisa al navegador de
 * qué color pintar lo que no controlamos —las barras de scroll, los menús desplegables nativos,
 * el fondo detrás del rebote del scroll—. Sin eso quedan claras sobre una interfaz oscura.
 */
function apply(next: Theme): void {
  const root = document.documentElement
  root.setAttribute('data-theme', next)
  root.style.colorScheme = next
}

export function setTheme(next: Theme): void {
  if (next === theme) return
  theme = next
  apply(next)
  try {
    window.localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* Sin persistencia el tema vive igual, solo que no sobrevive a un F5. */
  }
  for (const listener of listeners) listener()
}

export function toggleTheme(): void {
  setTheme(theme === 'dark' ? 'light' : 'dark')
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): Theme {
  return theme
}

/** El tema actual, para componentes. Se vuelve a renderizar cuando cambia. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'dark' as const)
}

/*
  Efecto de importación, a propósito.

  Es la única forma de que el atributo esté puesto antes de que React pinte por primera vez sin
  tocar `main.tsx`, que es un archivo que hoy están modificando otras dos ramas. Cuando esas
  ramas entren y `main.tsx` se estabilice, esto puede pasar a ser una llamada explícita ahí,
  al lado de `restoreSession()`.
*/
if (typeof window !== 'undefined') {
  theme = initialTheme()
  apply(theme)
}
