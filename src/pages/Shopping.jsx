import { useState } from 'react'
import { ShoppingCart, CheckSquare, Square, Tag } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { PRIORITY_COLORS, getZoneColor } from '../utils/colors'
import { formatCurrency } from '../utils/formatters'

export default function Shopping() {
  const { tareas, loading, marcarMaterialComprado } = useTasks()
  const [filtro, setFiltro] = useState('todos') // 'todos' | 'pendiente' | 'comprado'

  // Armar lista plana de materiales con referencia a su tarea
  const materiales = tareas
    .filter(t => t.estado !== 'Cancelado' && (t.materiales || []).length > 0)
    .flatMap(tarea =>
      (tarea.materiales || []).map((m, idx) => ({
        ...m,
        idx,
        tareaId: tarea.id,
        tareaTitulo: tarea.titulo,
        tareaZona: tarea.zona,
        tareaPrioridad: tarea.prioridad,
        tareaEstado: tarea.estado,
        comprado: m.comprado || false,
      }))
    )
    .filter(m => m.nombre?.trim())

  const filtrados = materiales.filter(m => {
    if (filtro === 'pendiente') return !m.comprado
    if (filtro === 'comprado') return m.comprado
    return true
  })

  const totalPendiente = materiales
    .filter(m => !m.comprado)
    .reduce((sum, m) => sum + (m.cantidad || 0) * (m.costoUnitario || 0), 0)

  const totalComprado = materiales
    .filter(m => m.comprado)
    .reduce((sum, m) => sum + (m.cantidad || 0) * (m.costoUnitario || 0), 0)

  const cantComprados = materiales.filter(m => m.comprado).length

  async function toggleComprado(m) {
    await marcarMaterialComprado(m.tareaId, m.idx, !m.comprado)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#64748b', fontSize: 16 }}>Cargando...</div>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#e2e8f0', fontWeight: 700 }}>Compras</h1>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
          Materiales de todas las tareas activas
        </p>
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total materiales" value={materiales.length} sub={`${cantComprados} comprados`} color="#94a3b8" />
        <StatCard label="Por comprar" value={formatCurrency(totalPendiente)} sub={`${materiales.length - cantComprados} ítems`} color="#f59e0b" />
        <StatCard label="Ya comprado" value={formatCurrency(totalComprado)} sub={`${cantComprados} ítems`} color="#22c55e" />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'pendiente', label: 'Por comprar' },
          { key: 'comprado', label: 'Comprados' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 13,
              cursor: 'pointer', fontWeight: filtro === f.key ? 600 : 400,
              background: filtro === f.key ? 'rgba(99,102,241,0.2)' : '#21253a',
              border: filtro === f.key ? '1px solid rgba(99,102,241,0.5)' : '1px solid #2d3148',
              color: filtro === f.key ? '#a5b4fc' : '#94a3b8',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div style={{
          background: '#21253a', border: '1px solid #2d3148', borderRadius: 12,
          padding: '48px 24px', textAlign: 'center',
        }}>
          <ShoppingCart size={36} color="#64748b" style={{ marginBottom: 12 }} />
          <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>
            {filtro === 'comprado' ? 'Todavía no compraste nada.' : 'No hay materiales pendientes.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtrados.map((m, i) => (
            <MaterialRow key={`${m.tareaId}-${m.idx}-${i}`} material={m} onToggle={toggleComprado} />
          ))}
        </div>
      )}
    </div>
  )
}

function MaterialRow({ material: m, onToggle }) {
  const zoneColor = getZoneColor(m.tareaZona)
  const priorColor = PRIORITY_COLORS[m.tareaPrioridad] || '#64748b'
  const subtotal = (m.cantidad || 0) * (m.costoUnitario || 0)

  return (
    <div
      onClick={() => onToggle(m)}
      style={{
        background: '#21253a',
        border: `1px solid ${m.comprado ? 'rgba(34,197,94,0.3)' : '#2d3148'}`,
        borderRadius: 10, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 14,
        cursor: 'pointer', transition: 'all 0.15s ease',
        opacity: m.comprado ? 0.6 : 1,
      }}
    >
      {/* Checkbox */}
      <div style={{ flexShrink: 0, color: m.comprado ? '#22c55e' : '#64748b' }}>
        {m.comprado
          ? <CheckSquare size={22} />
          : <Square size={22} />
        }
      </div>

      {/* Info principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 500, color: '#e2e8f0',
          textDecoration: m.comprado ? 'line-through' : 'none',
          marginBottom: 4,
        }}>
          {m.nombre}
        </div>
        {/* Tarea de origen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Tag size={11} color="#64748b" />
          <span style={{ fontSize: 12, color: '#64748b' }}>{m.tareaTitulo}</span>
          {m.tareaZona && (
            <span style={{
              fontSize: 11, padding: '1px 7px', borderRadius: 20,
              background: `${zoneColor}22`, color: zoneColor,
              border: `1px solid ${zoneColor}44`,
            }}>
              {m.tareaZona}
            </span>
          )}
          <span style={{
            fontSize: 11, padding: '1px 7px', borderRadius: 20,
            background: `${priorColor}18`, color: priorColor,
            border: `1px solid ${priorColor}33`,
          }}>
            {m.tareaPrioridad}
          </span>
        </div>
      </div>

      {/* Cantidad y costo */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 2 }}>
          {m.cantidad} {m.cantidad === 1 ? 'unidad' : 'unidades'}
        </div>
        {subtotal > 0 && (
          <div style={{ fontSize: 14, fontWeight: 600, color: m.comprado ? '#22c55e' : '#e2e8f0' }}>
            {formatCurrency(subtotal)}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: '#21253a', border: '1px solid #2d3148', borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#64748b' }}>{sub}</div>
    </div>
  )
}
