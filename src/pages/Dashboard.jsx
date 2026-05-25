import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useBudget } from '../hooks/useBudget'
import { useActivity } from '../hooks/useActivity'
import { useZones } from '../hooks/useZones'
import BudgetBar from '../components/BudgetBar'
import ActivityFeed from '../components/ActivityFeed'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import { calcularResumenPresupuesto, calcularPorEstado } from '../utils/calculations'
import { formatCurrency } from '../utils/formatters'
import { STATUS_COLORS } from '../utils/colors'

export default function Dashboard() {
  const { tareas, loading, crearTarea, actualizarTarea, eliminarTarea } = useTasks()
  const { presupuesto } = useBudget()
  const { actividad } = useActivity(5)
  const { zonas } = useZones()
  const [modalOpen, setModalOpen] = useState(false)
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null)
  const usuario = localStorage.getItem('currentUser') || 'Usuario'

  const resumen = calcularResumenPresupuesto(tareas, presupuesto.total)
  const porEstado = calcularPorEstado(tareas)

  const tareasUrgentes = tareas.filter(
    t => t.prioridad === 'Alta' && (t.estado === 'Pendiente' || t.estado === 'En progreso')
  )

  async function handleSave(datos, id) {
    if (id) {
      await actualizarTarea(id, datos, usuario, datos.titulo)
    } else {
      await crearTarea(datos, usuario)
    }
  }

  function abrirTarea(t) {
    setTareaSeleccionada(t)
    setModalOpen(true)
  }

  function nuevaTarea() {
    setTareaSeleccionada(null)
    setModalOpen(true)
  }

  if (loading) return <LoadingScreen />

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#e2e8f0', fontWeight: 700 }}>Dashboard</h1>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
          Bienvenido, {usuario}
        </p>
      </div>

      <BudgetBar
        gastado={resumen.gastado}
        comprometido={resumen.comprometido}
        total={presupuesto.total}
        porcentaje={resumen.porcentaje}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, margin: '24px 0' }}>
        {[
          { label: 'Presupuesto total', value: formatCurrency(presupuesto.total), color: '#94a3b8' },
          { label: 'Gastado', value: formatCurrency(resumen.gastado), color: '#22c55e' },
          { label: 'Comprometido (pendiente + en progreso)', value: formatCurrency(resumen.comprometido), color: '#3b82f6' },
          { label: 'Disponible', value: formatCurrency(Math.max(0, resumen.disponible)), color: resumen.disponible < 0 ? '#ef4444' : '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: '#21253a', border: '1px solid #2d3148', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <Card title="Tareas por estado">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(porEstado).map(([estado, data]) => (
              <div key={estado} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[estado] }} />
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{estado}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{data.cantidad}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Últimas actividades">
          <ActivityFeed actividad={actividad} limit={5} />
        </Card>
      </div>

      {tareasUrgentes.length > 0 && (
        <Card title={`Tareas urgentes (${tareasUrgentes.length})`} accentColor="#ef4444">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {tareasUrgentes.map(t => (
              <TaskCard key={t.id} tarea={t} onClick={abrirTarea} />
            ))}
          </div>
        </Card>
      )}

      <button
        onClick={nuevaTarea}
        style={{
          position: 'fixed', bottom: 28, right: 28,
          width: 54, height: 54, borderRadius: '50%',
          background: '#6366f1', border: 'none',
          color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          zIndex: 20,
        }}
      >
        <Plus size={24} />
      </button>

      {modalOpen && (
        <TaskModal
          tarea={tareaSeleccionada}
          zonas={zonas}
          umbralTarea={presupuesto.umbralTarea}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onDelete={t => eliminarTarea(t.id, t.titulo, usuario)}
        />
      )}
    </div>
  )
}

function Card({ title, children, accentColor }) {
  return (
    <div style={{
      background: '#21253a',
      border: `1px solid ${accentColor ? accentColor + '44' : '#2d3148'}`,
      borderRadius: 12, padding: 20,
    }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 14, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#64748b', fontSize: 16 }}>Cargando...</div>
    </div>
  )
}
