import { formatRelativeTime } from '../utils/formatters'
import { User } from 'lucide-react'

export default function ActivityFeed({ actividad = [], limit = 5 }) {
  const items = actividad.slice(0, limit)

  if (items.length === 0) {
    return (
      <div style={{ color: '#64748b', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
        Sin actividad reciente
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map(item => (
        <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(99,102,241,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <User size={14} color="#6366f1" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.4 }}>
              <span style={{ fontWeight: 600, color: '#a5b4fc' }}>{item.usuario}</span>{' '}
              {item.accion}{' '}
              <span style={{ color: '#94a3b8' }}>"{item.tareaTitulo}"</span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {formatRelativeTime(item.timestamp)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
