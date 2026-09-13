import type { Role } from '@/features/auth/types'

export interface AdminDashboardMetrics {
  totalUsers: number
  driverCount: number
  cpoCount: number
  adminCount: number
  activeUsers: number
  inactiveUsers: number
  totalStations: number
  activeStations: number
  inactiveStations: number
  totalConnectors: number
  activePricingSchemes: number
}

export interface UserItem {
  id: number
  email: string
  fullName: string
  role: Role
  active: boolean
  createdAt: string
}

export interface ConnectorItem {
  id: number
  stationId: number
  connectorType: string
  maxPowerKw: number
  operationalStatus: string
}

export interface StationItem {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  ownerId: number
  active: boolean
  connectors?: ConnectorItem[]
}

export type PricingStrategyType = 'FLAT_RATE' | 'PEAK_OFF_PEAK' | 'OCCUPANCY_PENALTY'

export interface PricingSchemeResponse {
  id?: number
  connectorId: number
  strategyType: PricingStrategyType
  kwhRate: number
  depositAmount: number
  excessPenaltyPerMin: number
  peakKwhRate?: number | null
}

export interface DefinePricingSchemeRequest {
  connectorId: number
  strategyType: PricingStrategyType
  kwhRate: number
  depositAmount: number
  excessPenaltyPerMin?: number
  peakKwhRate?: number | null
}
