# Estructura del frontend

La carpeta está organizada **por feature**, no por tipo de archivo. El motivo es que
somos cuatro trabajando en paralelo: si todos los componentes viven en `components/`
y todas las páginas en `pages/`, cualquier pantalla nueva toca las mismas carpetas
y los mismos archivos índice que las de los demás.

> **Los identificadores y los nombres de archivo van en inglés**; los comentarios y esta
> documentación, en castellano. Ver la directriz 5 del `CLAUDE.md` del proyecto.

```
src/
  App.tsx              Layout raíz. Solo el marco común: header, <Outlet />.
  main.tsx             Punto de entrada. Monta el router.

  routes/
    routes.tsx         ÚNICO archivo compartido del ruteo. Una línea por feature.

  features/
    home/              Una carpeta por feature. Todo lo suyo adentro.
      HomePage.tsx
      routes.tsx       Las rutas de esta feature, exportadas como RouteObject[].

  components/          Componentes genuinamente compartidos (botón, input, tabla).
  lib/                 Utilidades y cliente HTTP.
```

## Agregar una pantalla

1. Crear `features/<my-feature>/` con el componente de la pantalla.
2. Crear `features/<my-feature>/routes.tsx` que exporte `<myFeature>Routes: RouteObject[]`.
3. Agregar **una línea** en `routes/routes.tsx`: `...myFeatureRoutes,`.

Los pasos 1 y 2 no tocan ningún archivo de nadie más. El paso 3 sí, pero es una línea:
si dos personas la agregan el mismo día, el conflicto se resuelve quedándose con las dos.

## Lo que conviene evitar

- **Escribir el objeto de ruta completo dentro de `routes/routes.tsx`.** Ahí sí se pisan.
- **Archivos barril** (`components/index.ts` que reexporta todo). Son un imán de
  conflictos: cada componente nuevo agrega una línea al mismo archivo. Importar
  directo desde la ruta del componente.
- **Meter en `components/` algo que usa una sola feature.** Va adentro de la feature;
  se promueve a compartido recién cuando lo usa una segunda.
