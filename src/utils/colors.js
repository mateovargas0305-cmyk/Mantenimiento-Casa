export const PRIORITY_COLORS = {
  Alta: '#ef4444',
  Media: '#f59e0b',
  Baja: '#22c55e',
}

export const PRIORITY_ICONS = {
  Alta: '🔴',
  Media: '🟡',
  Baja: '🟢',
}

export const STATUS_COLORS = {
  Pendiente: '#64748b',
  'En progreso': '#3b82f6',
  Completado: '#22c55e',
  Cancelado: '#ef4444',
}

const ZONE_PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f97316', '#06b6d4', '#84cc16', '#a855f7',
  '#f43f5e', '#0ea5e9',
]

const zoneColorCache = {}
let zoneColorIndex = 0

export function getZoneColor(zona) {
  if (!zoneColorCache[zona]) {
    zoneColorCache[zona] = ZONE_PALETTE[zoneColorIndex % ZONE_PALETTE.length]
    zoneColorIndex++
  }
  return zoneColorCache[zona]
}

export function seedZoneColors(zonas = []) {
  zonas.forEach((zona, i) => {
    if (!zoneColorCache[zona]) {
      zoneColorCache[zona] = ZONE_PALETTE[i % ZONE_PALETTE.length]
    }
  })
  zoneColorIndex = zonas.length
}
