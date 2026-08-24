# EcoCharge

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
mvn -pl backend/ecocharge-core spring-boot:run
```

Queda escuchando en http://localhost:8081

### Correr sin Docker

Mientras Docker no esté instalado, el perfil `dev` levanta el módulo contra una base H2
en memoria, sin dependencias externas:

```bash
mvn -pl backend/ecocharge-core spring-boot:run -Dspring-boot.run.profiles=dev
```

Consola de H2: http://localhost:8081/h2-console

> El perfil `dev` es solo para desarrollo. **Las demos de las entregas corren sobre
> PostgreSQL**, que es lo que se documenta y se defiende.

### 3. Frontend

```bash
cd frontend
npm install     # solo la primera vez
npm run dev
```

Queda en http://localhost:5173

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Chequeo de tipos (`tsc -b`) + build de producción |
| `npm run lint` | Linter (oxlint) |
| `npm run preview` | Sirve el build de producción localmente |

**El proxy ya está configurado:** todo lo que el front pida a `/api/...` se redirige a
`http://localhost:8081`. Se llama a rutas relativas (`fetch('/api/estaciones')`) y no hay
que tocar CORS en desarrollo.

**Alias de imports:** `@/` apunta a `frontend/src/`, así que se importa
`@/componentes/Mapa` en vez de `../../componentes/Mapa`.

---

## Estructura

```
dai_2_tpo/
├── pom.xml                    # POM padre (multi-módulo)
├── docker-compose.yml         # PostgreSQL + ActiveMQ
├── backend/
│   └── ecocharge-core/        # Componentes stateless
├── frontend/                  # React + TypeScript + Vite
│   ├── vite.config.ts         # proxy a /api, alias @/, plugin de Tailwind
│   └── src/
│       ├── index.css          # Tailwind + tokens de tema
│       ├── main.tsx
│       └── App.tsx
└── docs/                      # Diagramas y material de entregas
```

### Módulos previstos

Un módulo Maven por artefacto desplegable. Los componentes de negocio viven dentro de
estos módulos, cada uno con su interfaz explícita.

| Módulo | Componentes | Estado |
|--------|-------------|--------|
| `ecocharge-core` | ServicioDeTerminales · ServicioDeUsuarios · ServicioDeTarificacion | 🚧 scaffold |
| `ecocharge-carga` | ServicioDeReservas · ServicioDeSesionesDeCarga *(stateful)* | ⬜ pendiente |
| `ecocharge-integracion` | ServicioDePagos (REST) · ServicioDeRedElectrica (SOAP) | ⬜ pendiente |
| `ecocharge-async` | ServicioDeNotificaciones | ⬜ pendiente |
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

## Documentación

Los documentos de la cursada (consigna consolidada, arquitectura, requerimientos) se
mantienen fuera del repositorio, en la carpeta del TP.
