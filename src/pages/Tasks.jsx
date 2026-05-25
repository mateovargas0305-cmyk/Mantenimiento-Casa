import { useState, useMemo } from 'react'
import { Plus, Filter } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useZones } from '../hooks/useZones'
import { useBudget } from '../hooks/useBudget'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import { USERS } from '../config/users'
import { STATUS_COLORS } from '../utils/colors'

const ESTADOS = ['Pendiente', 'En progreso', 'Completado', 'Cancelado']
const PRIORIDADES = ['Alta', 'Media', 'Baja']

export default function Tasks() {
  const { tareas, loading, crearTarea, actualizarTarea, eliminarTarea } = useTasks()
  const { zonas } = useZones()
  const { presupuesto } = useBudget()
  const usuario = localStorage.getItem('currentUser') || 'Usuario'

  const [modalOpen, setModalOpen] = useState(false)
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null)
  const [filtros, setFiltros] = useState({ zona: '', prioridad: '', estado: '', responsable: '' })
  const [vistaKanban, setVistaKanban] = useState(false)

  const tareasFiltradas = useMemo(() => {
    return tareas.filter(t => {
      if (filtros.zona && t.zona !== filtros.zona) return false
      if (filtros.prioridad && t.prioridad !== filtros.prioridad) return false
      if (filtros.estado && t.estado !== filtros.estado) return false
      if (filtros.responsable && t.responsable !== filtros.responsable) return false
      return true
    })
  }, [tareas, filtros])

  function setFiltro(key, value) {
    setFiltros(prev => ({ ...prev, [key]: value }))
  }

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

  if (loading) return <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>Cargando...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#e2e8f0', fontWeight: 700 }}>Tareas</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setVistaKanban(!vistaKanban)}
            style={{
              background: '#21253a', border: '1px solid #2d3148',
              color: '#94a3b8', padding: '8px 16px', borderRadius: 8,
              cursor: 'pointer', fontSize: 13,
            }}
          >
            {vistaKanban ? 'Vista lista' : 'Vista Kanban'}
          </button>
          <button
            onClick={nuevaTarea}
            style={{
              background: '#6366f1', border: 'none',
              color: 'white', padding: '8px 16px', borderRadius: 8,
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Plus size={16} /> Nueva tarea
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <Filter size={16} color="#64748b" style={{ alignSelf: 'center' }} />
        {[
          { key: 'zona', options: ['', ...zonas], label: 'Zona' },
          { key: 'prioridad', options: ['', ...PRIORIDADES], label: 'Prioridad' },
          { key: 'estado', options: ['', ...ESTADOS], label: 'Estado' },
          { key: 'responsable', options: ['', ...USERS], label: 'Responsable' },
        ].map(f => (
          <select
            key={f.key}
            value={filtros[f.key]}
            onChange={e => setFiltro(f.key, e.target.value)}
            style={{
              background: '#21253a', border: '1px solid #2d3148',
              color: filtros[f.key] ? '#e2e8f0' : '#64748b',
              padding: '7px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            }}
          >
            <option value="">{f.label}: Todos</option>
            {f.options.slice(1).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        {Object.values(filtros).some(Boolean) && (
          <button
            onClick={() => setFiltros({ zona: '', prioridad: '', estado: '', responsable: '' })}
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
          >
            Limpiar
          </button>
        )}
      </div>

      {vistaKanban ? (
        <KanbanView tareas={tareasFiltradas} onClickTarea={abrirTarea} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {tareasFiltradas.length === 0 ? (
            <div style={{ gridColumn: '1/-1', color: '#64748b', textAlign: 'center', padding: '60px 0', fontSize: 15 }}>
              No hay tareas con los filtros seleccionados
            </div>
          ) : (
            tareasFiltradas.map(t => <TaskCard key={t.id} tarea={t} onClick={abrirTarea} />)
          )}
        </div>
      )}

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

function KanbanView({ tareas, onClickTarea }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, overflowX: 'auto' }}>
      {['Pendiente', 'En progreso', 'Completado', 'Cancelado'].map(estado => {
        const cols = tareas.filter(t => t.estado === estado)
        return (
          <div key={estado} style={{ background: '#1a1d27', borderRadius: 12, padding: 16, minHeight: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[estado] }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{estado}</span>
              <span style={{ marginLeft: 'auto', background: '#21253a', borderRadius: 12, padding: '2px 8px', fontSize: 12, color: '#64748b' }}>
                {cols.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cols.map(t => <TaskCard key={t.id} tarea={t} onClick={onClickTarea} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
