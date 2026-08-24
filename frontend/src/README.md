# Estructura del frontend

La carpeta está organizada **por feature**, no por tipo de archivo. El motivo es que
somos cuatro trabajando en paralelo: si todos los componentes viven en `componentes/`
y todas las páginas en `paginas/`, cualquier pantalla nueva toca las mismas carpetas
y los mismos archivos índice que las de los demás.

```
src/
  App.tsx              Layout raíz. Solo el marco común: header, <Outlet />.
  main.tsx             Punto de entrada. Monta el router.

  rutas/
    rutas.tsx          ÚNICO archivo compartido del ruteo. Una línea por feature.

  features/
    inicio/            Una carpeta por feature. Todo lo suyo adentro.
      PaginaInicio.tsx
      rutas.tsx        Las rutas de esta feature, exportadas como RouteObject[].

  componentes/         Componentes genuinamente compartidos (botón, input, tabla).
  lib/                 Utilidades y cliente HTTP.
```

## Agregar una pantalla

1. Crear `features/<mi-feature>/` con el componente de la pantalla.
2. Crear `features/<mi-feature>/rutas.tsx` que exporte `rutas<MiFeature>: RouteObject[]`.
3. Agregar **una línea** en `rutas/rutas.tsx`: `...rutasMiFeature,`.

Los pasos 1 y 2 no tocan ningún archivo de nadie más. El paso 3 sí, pero es una línea:
si dos personas la agregan el mismo día, el conflicto se resuelve quedándose con las dos.

## Lo que conviene evitar

- **Escribir el objeto de ruta completo dentro de `rutas/rutas.tsx`.** Ahí sí se pisan.
- **Archivos barril** (`componentes/index.ts` que reexporta todo). Son un imán de
  conflictos: cada componente nuevo agrega una línea al mismo archivo. Importar
  directo desde la ruta del componente.
- **Meter en `componentes/` algo que usa una sola feature.** Va adentro de la feature;
  se promueve a compartido recién cuando lo usa una segunda.
