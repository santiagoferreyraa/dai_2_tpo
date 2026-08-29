# Ecopedia

Plataforma de gestión, reserva y tarificación de estaciones de carga rápida para vehículos eléctricos.

TP Integrador — **Desarrollo de Aplicaciones II** (3.4.218, Comisión Lunes TM, 2.º Cuatrimestre 2026).

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Spring Boot 3.5 · Java 21 |
| Persistencia | PostgreSQL 16 · Spring Data JPA |
| Mensajería | ActiveMQ Artemis (JMS) |
| SOAP | Spring-WS (contract-first) |
| Frontend | React 19 · TypeScript · Vite · TailwindCSS 4 |
| Infra local | Docker Compose |

---

## Requisitos

- JDK 21 o superior
- Maven 3.9+
- Node 20+
- pnpm 11+ *(`npm install -g pnpm`)*
- Docker Desktop *(pendiente de instalar — ver "Correr sin Docker")*

---

## Cómo levantar el proyecto

### 1. Infraestructura

```bash
docker compose up -d
```

Deja arriba PostgreSQL (`localhost:5432`) y ActiveMQ Artemis (`localhost:61616`,
consola web en http://localhost:8161/console).

### 2. Backend

```bash
mvn clean install
mvn -pl backend/ecopedia-core spring-boot:run
```

Cada artefacto tiene su puerto fijo, así los cuatro pueden estar levantados a la vez:

| Módulo | Puerto | Comando |
|--------|--------|---------|
| `ecopedia-core` | 8081 | `mvn -pl backend/ecopedia-core spring-boot:run` |
| `ecopedia-charging` | 8082 | `mvn -pl backend/ecopedia-charging spring-boot:run` |
| `ecopedia-integration` | 8083 | `mvn -pl backend/ecopedia-integration spring-boot:run` |
| `ecopedia-async` | — | `mvn -pl backend/ecopedia-async spring-boot:run` *(sin web: consume del broker)* |

`mvn verify` además **chequea el formato** con Spotless y falla si algo quedó sin formatear.
Para arreglarlo: `mvn spotless:apply`.

### Correr sin Docker

Mientras Docker no esté instalado, el perfil `dev` levanta el módulo contra una base H2
en memoria, sin dependencias externas:

```bash
mvn -pl backend/ecopedia-core spring-boot:run -Dspring-boot.run.profiles=dev
```

Consola de H2: http://localhost:8081/h2-console

> El perfil `dev` es solo para desarrollo. **Las demos de las entregas corren sobre
> PostgreSQL**, que es lo que se documenta y se defiende.

### 3. Frontend

```bash
cd frontend
pnpm install    # solo la primera vez, y cada vez que alguien agregue una dependencia
pnpm dev
```

Queda en http://localhost:5173

| Comando | Qué hace |
|---------|----------|
| `pnpm dev` | Servidor de desarrollo con hot reload |
| `pnpm build` | Chequeo de tipos (`tsc -b`) + build de producción |
| `pnpm lint` | Linter (oxlint) |
| `pnpm format` | Formatea todo con Prettier |
| `pnpm format:check` | Falla si algo quedó sin formatear (es lo que corre CI) |
| `pnpm preview` | Sirve el build de producción localmente |

**El proxy ya está configurado:** todo lo que el front pida a `/api/...` se redirige a
`http://localhost:8081`. Se llama a rutas relativas (`fetch('/api/stations')`) y no hay
que tocar CORS en desarrollo.

**Alias de imports:** `@/` apunta a `frontend/src/`, así que se importa
`@/components/Map` en vez de `../../components/Map`.

---

## Cómo trabajamos en equipo

Somos cuatro tocando el mismo repositorio y **todos hacemos de todo**, así que no hay dueños
por módulo. La defensa contra los conflictos es otra: pocos archivos compartidos, formato
idéntico en las cuatro máquinas y ramas que viven horas, no días.

### Configuración de una sola vez

Correr esto una vez por máquina, después de clonar:

```bash
git config pull.rebase true      # 'git pull' rebasea en vez de crear merges de ida y vuelta
git config rerere.enabled true   # recuerda cómo resolviste un conflicto y lo repite solo
```

`rerere` es el que más se agradece: si rebasás la misma rama tres días seguidos, resolvés el
conflicto una vez y las otras dos las resuelve Git.

### El ciclo

```bash
git switch main && git pull            # partir siempre de main actualizado
git switch -c feat/ECO-12-abm-estaciones

# ... trabajar, commitear ...

git pull --rebase origin main          # antes de pushear, SIEMPRE
git push -u origin feat/ECO-12-abm-estaciones
```

Y después el Pull Request, con **squash merge**.

### Las reglas

1. **Nada de push directo a `main`.** Todo entra por PR.
2. **Ramas cortas.** Una rama de cinco horas casi no conflictúa; una de cinco días conflictúa
   siempre. Si algo lleva más de un día, partirlo en dos PR.
3. **Un PR, un tema.** Los PR gigantes tocan archivos que no hacía falta tocar.
4. **Rebase antes de pushear.** Es lo que traslada el conflicto a tu máquina, donde lo
   resolvés vos que sabés qué hiciste, en vez de dejárselo a quien mergea.
5. **Avisar en el grupo en qué archivo estás.** No hace falta repartir roles: alcanza con que
   dos no estén en `TerminalController.java` la misma tarde.
6. **Formatear antes de commitear:** `mvn spotless:apply` y `pnpm format`. Si te olvidás,
   CI te lo marca en el PR.
7. **Agregar una dependencia va en un PR aparte**, y se mergea el mismo día. Así el
   `pnpm-lock.yaml` no queda tocado en tres ramas a la vez.
8. **El código se escribe en inglés; los comentarios, en castellano.** Alcanza a clases,
   métodos, variables, nombres de archivo y carpeta, rutas REST, tablas y columnas. Los
   comentarios, esta documentación y los mensajes al usuario siguen en castellano; los
   mensajes de commit y los PR, en inglés.

### Cuando conflictúa `pnpm-lock.yaml`

Ese archivo lo genera pnpm, no se resuelve a mano. Está marcado en `.gitattributes` para que
Git ni lo intente. Cuando pase:

```bash
git checkout --ours frontend/pnpm-lock.yaml
pnpm --dir frontend install
git add frontend/pnpm-lock.yaml
git rebase --continue
```

### Cuando CI falla por formato

```bash
mvn spotless:apply     # backend
pnpm --dir frontend format
git commit -am "Aplicar formato"
```

---

## Estructura

```
dai_2_tpo/
├── pom.xml                    # POM padre (multi-módulo) + config de Spotless
├── docker-compose.yml         # PostgreSQL + ActiveMQ
├── .gitattributes             # LF en todo; el lock sin merge textual
├── .editorconfig              # Indentación y encoding para los tres IDEs
├── .nvmrc                     # Versión de Node del equipo
├── .github/workflows/ci.yml   # Build + formato en cada PR
├── backend/
│   ├── ecopedia-core/        # Usuarios · Terminales · Tarificación
│   ├── ecopedia-charging/    # Reservas · Sesiones de carga (stateful)
│   ├── ecopedia-integration/ # Pagos (REST) · Red Eléctrica (SOAP)
│   └── ecopedia-async/       # Notificaciones (consumidor JMS)
├── frontend/                  # React + TypeScript + Vite
│   ├── vite.config.ts         # proxy a /api, alias @/, plugin de Tailwind
│   ├── .prettierrc.json       # Formato compartido
│   └── src/                   # Organizado por feature — ver frontend/src/README.md
└── docs/                      # Diagramas y material de entregas
```

### Módulos previstos

Un módulo Maven por artefacto desplegable. Los componentes de negocio viven dentro de
estos módulos, cada uno con su interfaz explícita.

| Módulo | Componentes | Estado |
|--------|-------------|--------|
| `ecopedia-core` | TerminalService · UserService · PricingService | 🚧 scaffold |
| `ecopedia-charging` | BookingService · ChargingSessionService *(stateful)* | 🚧 scaffold |
| `ecopedia-integration` | PaymentService (REST) · PowerGridService (SOAP) | 🚧 scaffold |
| `ecopedia-async` | NotificationService | 🚧 scaffold |
| `distribuidora-soap` | Simulador del sistema legado — publica el WSDL | ⬜ pendiente |
| `pasarela-simulada` | Simulador del partner de pagos — expone la API REST | ⬜ pendiente |
| `cargador-simulador` | Simulador de hardware — publica telemetría al tópico | ⬜ pendiente |

---

## Convención de capas

Cada componente se organiza en tres capas, en paquetes separados:

```
<componente>/
├── presentacion/   # Controladores REST y DTOs. Sin reglas de negocio.
├── negocio/        # Interfaz del componente, implementación y modelo de dominio.
└── datos/          # Interfaces DAO + su implementación (subpaquete jpa/).
```

La capa de negocio depende de la **interfaz** del DAO, nunca de Spring Data directamente.

---

## Direcciones y configuración

**Ninguna dirección de red se escribe a mano.** Ni una URL, ni un host, ni un puerto, dentro
de un archivo `.java`, `.ts` o `.tsx`.

Hoy todo corre en `localhost` y parece que da lo mismo. No da lo mismo: para la Entrega Final
la aplicación tiene que correr en una máquina que haga de servidor, con dos dispositivos
apuntando al mismo estado. Si para entonces hay direcciones desparramadas por el código,
mudar el ambiente deja de ser cambiar un valor y pasa a ser un refactor por todo el proyecto,
justo en la semana de la entrega.

### Backend

Todo dato de conexión sale de una variable de entorno **con valor por defecto para
desarrollo**, como ya hacen los `application.yml`:

```yaml
url: ${ECOPEDIA_DB_URL:jdbc:postgresql://localhost:5432/ecopedia}
```

Así el que clona el repo levanta el módulo sin configurar nada, y el ambiente compartido se
arma exportando variables, sin tocar el código.

Si un módulo necesita hablar con otro, la dirección se declara igual, bajo la clave
`ecopedia:` del YAML — nunca incrustada donde se hace la llamada. `ecopedia-integration` ya
lo hace así con los sistemas externos simulados.

### Frontend

Las llamadas van a rutas **relativas** que empiezan con `/api`, y pasan por el cliente HTTP
de `src/lib/`. El proxy de Vite las redirige al backend, así que el frontend no sabe ni
necesita saber dónde está la API — y de paso no hay CORS que configurar.

```ts
// Bien: anda igual en desarrollo y en el ambiente compartido.
await api.get('/stations')

// Mal: ata el código a una máquina, y el token de sesión hay que acordarse de mandarlo.
await fetch('http://localhost:8081/api/stations')
```

Que todas las llamadas pasen por un solo lugar es además lo que permite agregar la
autenticación una vez, cuando exista el login, en vez de en cada pantalla.

---

## Migraciones de base de datos

El esquema lo gobierna **Flyway**, no Hibernate. `ddl-auto` está en `validate`: Hibernate
verifica que las entidades coincidan con las tablas, pero no las toca. Con `update` y cuatro
personas contra la misma base, el arranque de uno le rompe las tablas al otro.

Los archivos van en `src/main/resources/db/migration/` del módulo que corresponda
(`ecopedia-core` o `ecopedia-charging`).

**Cada módulo tiene su propio schema** dentro de la misma base: `core` y `charging`. Flyway los
crea solo. Es necesario porque, si compartieran schema, compartirían la tabla
`flyway_schema_history`: cada módulo vería las migraciones del otro como "aplicadas pero
ausentes" y ninguno de los dos arrancaría.

### Convención de nombres

```
V<AAAAMMDD><HHmm>__description_in_snake_case.sql
```

Por ejemplo: `V202608241530__create_stations_table.sql`

**Con timestamp, nunca con `V1`, `V2`, `V3`.** Con numeración secuencial, dos personas
escriben `V3__` la misma tarde y chocan; con timestamp el choque es imposible.

### Reglas

- **Una migración ya mergeada no se edita nunca.** Flyway guarda un checksum: si cambiás el
  archivo, el arranque falla en la máquina de todos los que ya la corrieron. Para corregir
  algo, va una migración nueva.
- **SQL de PostgreSQL.** El perfil `dev` corre H2 en `MODE=PostgreSQL` justamente para que
  las mismas migraciones funcionen en los dos motores y el esquema no se bifurque.
- Si la base de desarrollo quedó en un estado raro: `docker compose down -v && docker compose up -d`
  la borra y la reconstruye desde cero.

---

## Documentación

Los documentos de la cursada (consigna consolidada, arquitectura, requerimientos) se
mantienen fuera del repositorio, en la carpeta del TP.
