import { formatCurrency } from '../utils/formatters'

export default function BudgetBar({ gastado, comprometido, total, porcentaje }) {
  const alerta = porcentaje >= 80

  return (
    <div style={{
      background: '#21253a',
      border: `1px solid ${alerta ? 'rgba(239,68,68,0.4)' : '#2d3148'}`,
      borderRadius: 12,
      padding: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ color: '#94a3b8', fontSize: 14 }}>Presupuesto utilizado</span>
        <span style={{ color: alerta ? '#ef4444' : '#e2e8f0', fontWeight: 600 }}>
          {porcentaje.toFixed(1)}%
        </span>
      </div>
      <div style={{ background: '#2d3148', borderRadius: 6, height: 10, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{
          height: '100%',
          width: `${Math.min(porcentaje, 100)}%`,
          background: alerta
            ? 'linear-gradient(90deg, #ef4444, #f97316)'
            : 'linear-gradient(90deg, #6366f1, #3b82f6)',
          borderRadius: 6,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <Stat label="Gastado (completado)" value={formatCurrency(gastado)} color="#22c55e" />
        <Stat label="Comprometido (pendiente + en progreso)" value={formatCurrency(comprometido)} color="#3b82f6" />
        <Stat label="Total" value={formatCurrency(total)} color="#94a3b8" />
      </div>
      {alerta && (
        <div style={{
          marginTop: 12, padding: '8px 12px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8, color: '#ef4444', fontSize: 13,
        }}>
          ⚠️ Atención: se ha consumido más del 80% del presupuesto total
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color }}>{value}</div>
    </div>
  )
}
