#!/usr/bin/env node

/*
 * Libera los puertos que se le pasen por argumento, matando al proceso que los escucha.
 *
 * Existe por un problema concreto de Windows: `mvn spring-boot:run` NO corre la aplicación,
 * la lanza en una segunda JVM. Cuando se corta el lanzador con Ctrl+C, la señal llega al
 * proceso de arriba de la cadena (pnpm → mprocs → shell → mvn → java) y los nietos quedan
 * huérfanos: la aplicación sigue viva, con el 8081 tomado y la base H2 en memoria adentro.
 * El síntoma es "Web server failed to start. Port 8081 was already in use" al arrancar de
 * nuevo, y el diagnóstico no es obvio porque la terminal anterior ya se cerró.
 *
 * Por eso los scripts `dev:back` y `dev:front` liberan su puerto antes de arrancar, en vez
 * de dejarlo a cargo de que el lanzador mate bien el árbol de procesos.
 *
 * Se mata SOLO a quien escucha el puerto. Buscarlo por nombre de imagen sería peor: en
 * Windows, `taskkill /IM java.exe` se lleva puesto el servidor de lenguaje de VS Code y el
 * editor se queda sin autocompletado hasta que se lo reinicia.
 */

import { execFileSync } from 'node:child_process'

const ports = process.argv.slice(2).map(Number).filter(Number.isInteger)

if (ports.length === 0) {
  console.error('Uso: node scripts/free-port.mjs <puerto> [puerto...]')
  process.exit(1)
}

/** Corre un comando y devuelve su salida, o '' si falla. Nunca tira. */
function run(command, args) {
  try {
    return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {
    return ''
  }
}

/**
 * PIDs que escuchan el puerto.
 *
 * En Windows se pregunta por PowerShell y no con `netstat`, cuya salida está traducida al
 * idioma del sistema: en una máquina en castellano el estado dice ESCUCHANDO y cualquier
 * filtro por la palabra LISTENING falla en silencio.
 */
function listenersOf(port) {
  const output =
    process.platform === 'win32'
      ? run('powershell', [
          '-NoProfile',
          '-Command',
          `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess`,
        ])
      : run('lsof', ['-t', `-iTCP:${port}`, '-sTCP:LISTEN'])

  return [...new Set(output.split(/\s+/).map(Number).filter((pid) => pid > 0))]
}

for (const port of ports) {
  for (const pid of listenersOf(port)) {
    /* El propio proceso nunca: pasa si alguien apunta el script contra un puerto de Node. */
    if (pid === process.pid) continue

    if (process.platform === 'win32') {
      run('taskkill', ['/PID', String(pid), '/F', '/T'])
    } else {
      try {
        process.kill(pid, 'SIGKILL')
      } catch {
        /* Ya no estaba. */
      }
    }

    console.log(`[free-port] ${port} estaba tomado por el proceso ${pid}; se lo dio de baja.`)
  }
}
