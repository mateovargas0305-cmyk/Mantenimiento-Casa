import { PRIORITY_COLORS, PRIORITY_ICONS, STATUS_COLORS, getZoneColor } from '../utils/colors'
import { formatCurrency, formatDate } from '../utils/formatters'
import { User, Calendar } from 'lucide-react'

export default function TaskCard({ tarea, onClick }) {
  const zoneColor = getZoneColor(tarea.zona)

  return (
    <div
      onClick={() => onClick(tarea)}
      style={{
        background: '#21253a',
        border: '1px solid #2d3148',
        borderLeft: `3px solid ${PRIORITY_COLORS[tarea.prioridad] || '#64748b'}`,
        borderRadius: 10,
        padding: 16,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#3d4270'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#2d3148'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3 }}>
          {tarea.titulo}
        </h3>
        <span style={{ fontSize: 16, flexShrink: 0 }}>{PRIORITY_ICONS[tarea.prioridad]}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {tarea.zona && (
          <Chip label={tarea.zona} color={zoneColor} />
        )}
        <Chip
          label={tarea.estado}
          color={STATUS_COLORS[tarea.estado] || '#64748b'}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {tarea.responsable && (
            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <User size={11} /> {tarea.responsable}
            </span>
          )}
          {tarea.fechaFin && (
            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={11} /> {formatDate(tarea.fechaFin)}
            </span>
          )}
        </div>
        {tarea.costoTotal > 0 && (
          <span style={{ color: '#22c55e', fontWeight: 600 }}>
            {formatCurrency(tarea.costoTotal)}
          </span>
        )}
      </div>
    </div>
  )
}

function Chip({ label, color }) {
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      background: `${color}22`,
      color: color, border: `1px solid ${color}44`,
    }}>
      {label}
    </span>
  )
}
