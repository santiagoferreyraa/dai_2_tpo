import { useEffect, useState } from 'react'

import type { Role } from '@/features/auth/types'
import {
  deactivateStation,
  deactivateUser,
  fetchAdminDashboard,
  fetchPricingScheme,
  fetchStations,
  fetchUsers,
  savePricingScheme,
} from './data/adminRepository'
import type {
  AdminDashboardMetrics,
  PricingSchemeResponse,
  PricingStrategyType,
  StationItem,
  UserItem,
} from './types'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'stations' | 'pricing'>(
    'dashboard',
  )

  // Dashboard State
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null)
  const [loadingMetrics, setLoadingMetrics] = useState(true)

  // Users State
  const [users, setUsers] = useState<UserItem[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | 'ALL'>('ALL')
  const [searchUser, setSearchUser] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [deactivatingUserId, setDeactivatingUserId] = useState<number | null>(null)

  // Stations State
  const [stations, setStations] = useState<StationItem[]>([])
  const [searchStation, setSearchStation] = useState('')
  const [loadingStations, setLoadingStations] = useState(false)
  const [deactivatingStationId, setDeactivatingStationId] = useState<number | null>(null)

  // Pricing Scheme State
  const [pricingConnectorId, setPricingConnectorId] = useState<number>(1)
  const [pricingScheme, setPricingScheme] = useState<PricingSchemeResponse | null>(null)
  const [strategyType, setStrategyType] = useState<PricingStrategyType>('FLAT_RATE')
  const [kwhRate, setKwhRate] = useState<number>(150)
  const [depositAmount, setDepositAmount] = useState<number>(500)
  const [excessPenaltyPerMin, setExcessPenaltyPerMin] = useState<number>(10)
  const [peakKwhRate, setPeakKwhRate] = useState<number>(250)
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState<string | null>(null)
  const [pricingErrorMsg, setPricingErrorMsg] = useState<string | null>(null)
  const [loadingPricing, setLoadingPricing] = useState(false)

  // Feedback Messages
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const loadMetrics = async () => {
    setLoadingMetrics(true)
    try {
      const data = await fetchAdminDashboard()
      setMetrics(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMetrics(false)
    }
  }

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const roleQuery = selectedRole === 'ALL' ? undefined : selectedRole
      const data = await fetchUsers(roleQuery)
      setUsers(data)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al cargar usuarios')
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadStations = async () => {
    setLoadingStations(true)
    try {
      const data = await fetchStations()
      setStations(data)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al cargar estaciones')
    } finally {
      setLoadingStations(false)
    }
  }

  useEffect(() => {
    loadMetrics()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') loadUsers()
    if (activeTab === 'stations') loadStations()
  }, [activeTab, selectedRole])

  const handleDeactivateUser = async (userId: number) => {
    if (!confirm(`¿Confirma dar de baja al usuario con ID #${userId}?`)) return
    setDeactivatingUserId(userId)
    setActionError(null)
    setActionSuccess(null)
    try {
      await deactivateUser(userId)
      setActionSuccess(`El usuario #${userId} fue dado de baja exitosamente.`)
      await loadUsers()
      await loadMetrics()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo dar de baja al usuario.')
    } finally {
      setDeactivatingUserId(null)
    }
  }

  const handleDeactivateStation = async (stationId: number) => {
    if (!confirm(`¿Confirma la baja de la estación de carga #${stationId}?`)) return
    setDeactivatingStationId(stationId)
    setActionError(null)
    setActionSuccess(null)
    try {
      await deactivateStation(stationId)
      setActionSuccess(`La estación #${stationId} fue dada de baja exitosamente.`)
      await loadStations()
      await loadMetrics()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo dar de baja la estación.')
    } finally {
      setDeactivatingStationId(null)
    }
  }

  const handleQueryPricingScheme = async () => {
    if (!pricingConnectorId || pricingConnectorId <= 0) return
    setLoadingPricing(true)
    setPricingSuccessMsg(null)
    setPricingErrorMsg(null)
    try {
      const scheme = await fetchPricingScheme(pricingConnectorId)
      setPricingScheme(scheme)
      setStrategyType(scheme.strategyType || 'FLAT_RATE')
      setKwhRate(scheme.kwhRate || 150)
      setDepositAmount(scheme.depositAmount || 500)
      setExcessPenaltyPerMin(scheme.excessPenaltyPerMin || 0)
      setPeakKwhRate(scheme.peakKwhRate || 250)
    } catch (err) {
      setPricingScheme(null)
      setPricingErrorMsg(
        err instanceof Error
          ? err.message
          : `No se encontró esquema cargado para el conector #${pricingConnectorId}`,
      )
    } finally {
      setLoadingPricing(false)
    }
  }

  const handleSavePricingScheme = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingPricing(true)
    setPricingSuccessMsg(null)
    setPricingErrorMsg(null)
    try {
      const resp = await savePricingScheme({
        connectorId: pricingConnectorId,
        strategyType,
        kwhRate,
        depositAmount,
        excessPenaltyPerMin,
        peakKwhRate: strategyType === 'PEAK_OFF_PEAK' ? peakKwhRate : null,
      })
      setPricingScheme(resp)
      setPricingSuccessMsg(
        `¡Esquema tarifario para el conector #${pricingConnectorId} guardado exitosamente!`,
      )
    } catch (err) {
      setPricingErrorMsg(
        err instanceof Error ? err.message : 'Error al guardar el esquema tarifario.',
      )
    } finally {
      setLoadingPricing(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    if (!searchUser.trim()) return true
    const q = searchUser.toLowerCase()
    return u.email.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q)
  })

  const filteredStations = stations.filter((s) => {
    if (!searchStation.trim()) return true
    const q = searchStation.toLowerCase()
    return s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
  })

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8">
      {/* Banner / Header */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-xs font-bold tracking-widest text-primary uppercase">
              Centro de Control • Administrador
            </span>
            <h1 className="text-2xl font-extrabold text-text md:text-3xl">
              Backoffice de Administración
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Gestión global de la plataforma Ecopedia: usuarios, estaciones, estado del sistema y
              tarifas.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary md:self-auto">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Sesión Administrador Activa
          </div>
        </div>

        {/* Action Feedbacks */}
        {actionSuccess && (
          <div className="mt-4 rounded-xl border border-primary/40 bg-primary/10 p-4 text-sm font-medium text-primary">
            ✓ {actionSuccess}
          </div>
        )}
        {actionError && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm font-medium text-rose-400">
            ⚠ {actionError}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border/50 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'brand-fill text-on-primary shadow-lg shadow-primary/20'
                : 'border border-border/60 bg-surface/40 text-text-muted hover:border-primary/40 hover:text-text'
            }`}
          >
            📊 Tablero General
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'users'
                ? 'brand-fill text-on-primary shadow-lg shadow-primary/20'
                : 'border border-border/60 bg-surface/40 text-text-muted hover:border-primary/40 hover:text-text'
            }`}
          >
            👥 Gestión de Usuarios
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stations')}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'stations'
                ? 'brand-fill text-on-primary shadow-lg shadow-primary/20'
                : 'border border-border/60 bg-surface/40 text-text-muted hover:border-primary/40 hover:text-text'
            }`}
          >
            ⚡ Gestión de Estaciones
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'pricing'
                ? 'brand-fill text-on-primary shadow-lg shadow-primary/20'
                : 'border border-border/60 bg-surface/40 text-text-muted hover:border-primary/40 hover:text-text'
            }`}
          >
            💰 Esquemas Tarifarios
          </button>
        </div>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          {loadingMetrics ? (
            <div className="rounded-2xl border border-border/80 bg-surface/80 p-8 text-center text-text-muted">
              Cargando métricas del sistema...
            </div>
          ) : metrics ? (
            <>
              {/* Tarjetas métricas superiores */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-lg backdrop-blur-xl">
                  <span className="text-xs font-semibold text-text-muted uppercase">
                    Usuarios Registrados
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-text">{metrics.totalUsers}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                    <span className="text-primary font-semibold">
                      {metrics.activeUsers} activos
                    </span>
                    •<span>{metrics.inactiveUsers} dados de baja</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-lg backdrop-blur-xl">
                  <span className="text-xs font-semibold text-text-muted uppercase">
                    Conductores
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-cyan-400">
                    {metrics.driverCount}
                  </div>
                  <p className="mt-2 text-xs text-text-muted">
                    Usuarios con rol CONDUCTOR en la app
                  </p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-lg backdrop-blur-xl">
                  <span className="text-xs font-semibold text-text-muted uppercase">
                    Operadores CPO
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-purple-400">
                    {metrics.cpoCount}
                  </div>
                  <p className="mt-2 text-xs text-text-muted">
                    Operadores de infraestructura de carga
                  </p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-lg backdrop-blur-xl">
                  <span className="text-xs font-semibold text-text-muted uppercase">
                    Estaciones de Carga
                  </span>
                  <div className="mt-2 text-3xl font-extrabold text-emerald-400">
                    {metrics.totalStations}
                  </div>
                  <div className="mt-2 text-xs text-text-muted">
                    {metrics.activeStations} activas • {metrics.totalConnectors} conectores
                  </div>
                </div>
              </div>

              {/* Detalle adicional */}
              <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-xl backdrop-blur-xl">
                <h3 className="text-lg font-bold text-text">Estado General del Sistema</h3>
                <p className="mt-1 text-sm text-text-muted">
                  Resumen de distribución de roles y disponibilidad de infraestructura.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border/50 bg-surface/40 p-4">
                    <h4 className="text-sm font-semibold text-text">Distribución de Permisos</h4>
                    <ul className="mt-3 flex flex-col gap-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-text-muted">Conductores de EV:</span>
                        <span className="font-bold text-text">{metrics.driverCount}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-text-muted">Operadores CPO:</span>
                        <span className="font-bold text-text">{metrics.cpoCount}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-text-muted">Administradores de Sistema:</span>
                        <span className="font-bold text-text">{metrics.adminCount}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-surface/40 p-4">
                    <h4 className="text-sm font-semibold text-text">Red de Estaciones</h4>
                    <ul className="mt-3 flex flex-col gap-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-text-muted">Estaciones Activas:</span>
                        <span className="font-bold text-emerald-400">{metrics.activeStations}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-text-muted">Estaciones Dadas de Baja:</span>
                        <span className="font-bold text-rose-400">{metrics.inactiveStations}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-text-muted">Total Conectores Registrados:</span>
                        <span className="font-bold text-text">{metrics.totalConnectors}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* TAB 2: GESTIÓN DE USUARIOS */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-text">Padrón de Usuarios</h2>
              <p className="text-sm text-text-muted">
                Consulta, filtra y realiza la baja lógica de usuarios en la plataforma.
              </p>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="rounded-xl border border-border/80 bg-surface/90 px-3.5 py-2 text-sm text-text placeholder-text-muted focus:border-primary focus:outline-none"
              />

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role | 'ALL')}
                className="rounded-xl border border-border/80 bg-surface/90 px-3.5 py-2 text-sm text-text focus:border-primary focus:outline-none"
              >
                <option value="ALL">Todos los Roles</option>
                <option value="CONDUCTOR">Conductores</option>
                <option value="CPO">Operadores (CPO)</option>
                <option value="ADMIN">Administradores</option>
              </select>
            </div>
          </div>

          {loadingUsers ? (
            <div className="mt-6 py-8 text-center text-sm text-text-muted">
              Cargando lista de usuarios...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="mt-6 rounded-xl border border-border/50 bg-surface/30 p-8 text-center text-sm text-text-muted">
              No se encontraron usuarios que coincidan con los filtros aplicados.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm text-text">
                <thead className="border-b border-border/60 text-xs text-text-muted uppercase">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Nombre Completo</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-surface/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-text-muted">
                        #{user.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-text">{user.fullName}</td>
                      <td className="py-3.5 px-4 text-text-muted">{user.email}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            user.role === 'ADMIN'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : user.role === 'CPO'
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {user.active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                            Dado de baja
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {user.active ? (
                          <button
                            type="button"
                            disabled={deactivatingUserId === user.id}
                            onClick={() => handleDeactivateUser(user.id)}
                            className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500 hover:text-white disabled:opacity-50"
                          >
                            {deactivatingUserId === user.id ? 'Dando de baja...' : 'Dar de Baja'}
                          </button>
                        ) : (
                          <span className="text-xs text-text-muted italic">Sin acciones</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GESTIÓN DE ESTACIONES */}
      {activeTab === 'stations' && (
        <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-text">Red de Estaciones de Carga</h2>
              <p className="text-sm text-text-muted">
                Monitorea y deshabilita estaciones de la plataforma (RF03 / Backoffice).
              </p>
            </div>

            <input
              type="text"
              placeholder="Buscar por nombre o dirección..."
              value={searchStation}
              onChange={(e) => setSearchStation(e.target.value)}
              className="w-full max-w-xs rounded-xl border border-border/80 bg-surface/90 px-3.5 py-2 text-sm text-text placeholder-text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {loadingStations ? (
            <div className="mt-6 py-8 text-center text-sm text-text-muted">
              Cargando catálogo de estaciones...
            </div>
          ) : filteredStations.length === 0 ? (
            <div className="mt-6 rounded-xl border border-border/50 bg-surface/30 p-8 text-center text-sm text-text-muted">
              No se encontraron estaciones registradas.
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredStations.map((station) => (
                <div
                  key={station.id}
                  className="flex flex-col justify-between rounded-xl border border-border/60 bg-surface/40 p-4 transition-all hover:border-primary/40"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-text-muted">
                        Estación #{station.id}
                      </span>
                      {station.active ? (
                        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                          Operativa
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 text-xs font-bold text-rose-400">
                          Dada de baja
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-base font-bold text-text">{station.name}</h3>
                    <p className="mt-0.5 text-xs text-text-muted">{station.address}</p>

                    <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
                      <span>📍 Lat: {station.latitude}</span>
                      <span>Lng: {station.longitude}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                    <span className="text-xs text-text-muted">
                      {station.connectors
                        ? `${station.connectors.length} conectores`
                        : 'CPO Owner ID: #' + station.ownerId}
                    </span>

                    {station.active ? (
                      <button
                        type="button"
                        disabled={deactivatingStationId === station.id}
                        onClick={() => handleDeactivateStation(station.id)}
                        className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500 hover:text-white disabled:opacity-50"
                      >
                        {deactivatingStationId === station.id ? 'Dando de baja...' : 'Dar de Baja'}
                      </button>
                    ) : (
                      <span className="text-xs text-text-muted italic">Deshabilitada</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ESQUEMAS TARIFARIOS */}
      {activeTab === 'pricing' && (
        <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-xl backdrop-blur-xl">
          <div>
            <h2 className="text-xl font-bold text-text">Gestión de Esquemas Tarifarios</h2>
            <p className="text-sm text-text-muted">
              Define y consulta la tarifa vigente (`/api/pricing`) de los conectores de la red
              (ECO-29, ECO-30, RF06).
            </p>
          </div>

          {pricingSuccessMsg && (
            <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-400">
              ✓ {pricingSuccessMsg}
            </div>
          )}
          {pricingErrorMsg && (
            <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm font-medium text-rose-400">
              ⚠ {pricingErrorMsg}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Selector de conector */}
            <div className="rounded-xl border border-border/60 bg-surface/40 p-5">
              <h3 className="text-sm font-bold text-text">1. Buscar Conector</h3>
              <p className="mt-1 text-xs text-text-muted">
                Ingresa el ID del conector para cargar su tarifa configurada.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <label className="text-xs font-semibold text-text-muted">ID del Conector</label>
                <input
                  type="number"
                  min="1"
                  value={pricingConnectorId}
                  onChange={(e) => setPricingConnectorId(Number(e.target.value))}
                  className="rounded-xl border border-border/80 bg-surface/90 px-3.5 py-2 text-sm text-text focus:border-primary focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleQueryPricingScheme}
                  disabled={loadingPricing}
                  className="mt-2 rounded-xl border border-primary/40 bg-primary/10 py-2.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-on-primary disabled:opacity-50"
                >
                  {loadingPricing ? 'Consultando...' : 'Consultar Tarifa Vigente'}
                </button>
              </div>

              {pricingScheme && (
                <div className="mt-4 rounded-lg border border-border/50 bg-surface/60 p-3 text-xs">
                  <span className="font-bold text-primary">Esquema Actual Registrado:</span>
                  <div className="mt-1 text-text">
                    Estrategia: <strong>{pricingScheme.strategyType}</strong>
                  </div>
                  <div className="text-text">
                    Tarifa Base: <strong>${pricingScheme.kwhRate}/kWh</strong>
                  </div>
                  <div className="text-text">
                    Seña: <strong>${pricingScheme.depositAmount}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Formulario de Configuración */}
            <form
              onSubmit={handleSavePricingScheme}
              className="rounded-xl border border-border/60 bg-surface/40 p-5 lg:col-span-2"
            >
              <h3 className="text-sm font-bold text-text">2. Definir / Actualizar Tarifa</h3>
              <p className="mt-1 text-xs text-text-muted">
                Aplica la regla de cálculo (Patrón Strategy) para el conector #{pricingConnectorId}.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-text-muted">
                    Estrategia de Tarificación
                  </label>
                  <select
                    value={strategyType}
                    onChange={(e) => setStrategyType(e.target.value as PricingStrategyType)}
                    className="mt-1.5 w-full rounded-xl border border-border/80 bg-surface/90 px-3.5 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  >
                    <option value="FLAT_RATE">FLAT_RATE (Tarifa Plana)</option>
                    <option value="PEAK_OFF_PEAK">PEAK_OFF_PEAK (Horario Pico / Valle)</option>
                    <option value="OCCUPANCY_PENALTY">
                      OCCUPANCY_PENALTY (Recargo por Ocupación)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-muted">
                    Tarifa Base ($ / kWh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={kwhRate}
                    onChange={(e) => setKwhRate(Number(e.target.value))}
                    required
                    className="mt-1.5 w-full rounded-xl border border-border/80 bg-surface/90 px-3.5 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-muted">Monto Seña ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    required
                    className="mt-1.5 w-full rounded-xl border border-border/80 bg-surface/90 px-3.5 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-muted">
                    Penalización Exceso ($/min)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={excessPenaltyPerMin}
                    onChange={(e) => setExcessPenaltyPerMin(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-border/80 bg-surface/90 px-3.5 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>

                {strategyType === 'PEAK_OFF_PEAK' && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-text-muted">
                      Tarifa en Horario Pico ($ / kWh)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={peakKwhRate}
                      onChange={(e) => setPeakKwhRate(Number(e.target.value))}
                      required
                      className="mt-1.5 w-full rounded-xl border border-border/80 bg-surface/90 px-3.5 py-2 text-sm text-text focus:border-primary focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loadingPricing}
                  className="rounded-xl brand-fill px-6 py-2.5 text-xs font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {loadingPricing ? 'Guardando...' : 'Guardar Esquema Tarifario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
