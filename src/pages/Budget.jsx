import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { useTasks } from '../hooks/useTasks'
import { useBudget } from '../hooks/useBudget'
import { useZones } from '../hooks/useZones'
import BudgetBar from '../components/BudgetBar'
import { calcularResumenPresupuesto, calcularPorZona } from '../utils/calculations'
import { formatCurrency } from '../utils/formatters'
import { getZoneColor } from '../utils/colors'
import { Save } from 'lucide-react'

export default function Budget() {
  const { tareas, loading } = useTasks()
  const { presupuesto, guardarPresupuesto } = useBudget()
  const { zonas } = useZones()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const [editTotal, setEditTotal] = useState(false)
  const [nuevoTotal, setNuevoTotal] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [modoPuedo, setModoPuedo] = useState(false)

  const resumen = calcularResumenPresupuesto(tareas, presupuesto.total)
  const porZona = calcularPorZona(tareas)

  const dataZonas = Object.entries(porZona).map(([zona, d]) => ({
    zona, costo: d.costo, tareas: d.tareas, color: getZoneColor(zona),
  }))

  const tareasPosibles = tareas
    .filter(t => t.estado === 'Pendiente' && (t.costoTotal || 0) <= Math.max(0, resumen.disponible))
    .sort((a, b) => {
      const ord = { Alta: 0, Media: 1, Baja: 2 }
      return (ord[a.prioridad] || 1) - (ord[b.prioridad] || 1)
    })

  async function guardar() {
    const total = parseFloat(nuevoTotal)
    if (isNaN(total) || total < 0) return
    setGuardando(true)
    await guardarPresupuesto({ ...presupuesto, total })
    setEditTotal(false)
    setGuardando(false)
  }

  if (loading) return <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>Cargando...</div>

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#e2e8f0', fontWeight: 700 }}>Presupuesto</h1>
        <button
          onClick={() => setModoPuedo(!modoPuedo)}
          style={{
            background: modoPuedo ? '#6366f1' : '#21253a',
            border: `1px solid ${modoPuedo ? '#6366f1' : '#2d3148'}`,
            color: modoPuedo ? 'white' : '#94a3b8',
            padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
            fontSize: isMobile ? 12 : 13, fontWeight: 500, whiteSpace: 'nowrap',
          }}
        >
          💡 ¿Qué puedo hacer hoy?
        </button>
      </div>

      {/* Presupuesto total editable */}
      <div style={{ background: '#21253a', border: '1px solid #2d3148', borderRadius: 12, padding: isMobile ? 16 : 20, marginBottom: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Presupuesto Total
          </span>
        </div>
        {!editTotal ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#e2e8f0' }}>
              {formatCurrency(presupuesto.total)}
            </span>
            <button
              onClick={() => { setEditTotal(true); setNuevoTotal(presupuesto.total) }}
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
              Editar
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <input
              type="number" value={nuevoTotal} min="0"
              onChange={e => setNuevoTotal(e.target.value)}
              style={{ background: '#1a1d27', border: '1px solid #6366f1', color: '#e2e8f0', padding: '10px 12px', borderRadius: 8, fontSize: 16, width: '100%', outline: 'none', boxSizing: 'border-box' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={guardar} disabled={guardando}
                style={{ background: '#6366f1', border: 'none', color: 'white', padding: '9px 16px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}>
                <Save size={14} /> {guardando ? '...' : 'Guardar'}
              </button>
              <button onClick={() => setEditTotal(false)}
                style={{ background: 'transparent', border: '1px solid #2d3148', color: '#64748b', padding: '9px 16px', borderRadius: 8, cursor: 'pointer', flex: 1 }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
        <BudgetBar gastado={resumen.gastado} comprometido={resumen.comprometido} total={presupuesto.total} porcentaje={resumen.porcentaje} />
      </div>

      {/* ¿Qué puedo hacer hoy? */}
      {modoPuedo && (
        <div style={{ background: '#21253a', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 12, padding: isMobile ? 16 : 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 4px', color: '#a5b4fc', fontSize: 16 }}>Tareas que podés hacer hoy</h3>
          <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 13 }}>
            Disponible: {formatCurrency(Math.max(0, resumen.disponible))}
          </p>
          {tareasPosibles.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
              {resumen.disponible <= 0 ? 'Sin presupuesto disponible.' : 'No hay tareas pendientes dentro del presupuesto.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tareasPosibles.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#1a1d27', borderRadius: 8, padding: '12px 14px', border: '1px solid #2d3148', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.titulo}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{t.zona} · {t.prioridad}</div>
                  </div>
                  <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 15, alignSelf: 'center', flexShrink: 0 }}>
                    {formatCurrency(t.costoTotal)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gráficos — apilados en mobile */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#21253a', border: '1px solid #2d3148', borderRadius: 12, padding: isMobile ? 16 : 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Costo por zona
          </h3>
          {dataZonas.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: 13 }}>Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dataZonas} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="zona" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#e2e8f0' }} />
                <Bar dataKey="costo" radius={[4, 4, 0, 0]}>
                  {dataZonas.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: '#21253a', border: '1px solid #2d3148', borderRadius: 12, padding: isMobile ? 16 : 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Distribución por zona
          </h3>
          {dataZonas.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: 13 }}>Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dataZonas}
                  dataKey="costo"
                  nameKey="zona"
                  cx="50%" cy="50%"
                  outerRadius={isMobile ? 70 : 80}
                  label={({ zona, percent }) => `${zona} ${(percent * 100).toFixed(0)}%`}
                  labelLine={!isMobile}
                  fontSize={isMobile ? 10 : 12}
                >
                  {dataZonas.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tabla por zona — con scroll horizontal en mobile */}
      <div style={{ background: '#21253a', border: '1px solid #2d3148', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #2d3148' }}>
          <h3 style={{ margin: 0, fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Desglose por zona
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 340 }}>
            <thead>
              <tr style={{ background: '#1a1d27' }}>
                {['Zona', 'Tareas', 'Costo total', '% presupuesto'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(porZona).map(([zona, d]) => {
                const pct = presupuesto.total > 0 ? (d.costo / presupuesto.total * 100).toFixed(1) : '0'
                return (
                  <tr key={zona} style={{ borderTop: '1px solid #2d3148' }}>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: getZoneColor(zona), flexShrink: 0 }} />
                        <span style={{ color: '#e2e8f0', fontSize: 13 }}>{zona}</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px', color: '#94a3b8', fontSize: 13 }}>{d.tareas}</td>
                    <td style={{ padding: '11px 16px', color: '#22c55e', fontWeight: 600, fontSize: 13 }}>{formatCurrency(d.costo)}</td>
                    <td style={{ padding: '11px 16px', color: '#94a3b8', fontSize: 13 }}>{pct}%</td>
                  </tr>
                )
              })}
              {Object.keys(porZona).length === 0 && (
                <tr><td colSpan={4} style={{ padding: '24px 16px', color: '#64748b', textAlign: 'center', fontSize: 14 }}>Sin datos aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
