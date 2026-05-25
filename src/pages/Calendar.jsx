import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useZones } from '../hooks/useZones'
import { useBudget } from '../hooks/useBudget'
import CalendarView from '../components/CalendarView'
import TaskModal from '../components/TaskModal'

export default function Calendar() {
  const { tareas, loading, actualizarTarea, crearTarea, eliminarTarea } = useTasks()
  const { zonas } = useZones()
  const { presupuesto } = useBudget()
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null)
  const usuario = localStorage.getItem('currentUser') || 'Usuario'

  async function handleSave(datos, id) {
    if (id) await actualizarTarea(id, datos, usuario, datos.titulo)
    else await crearTarea(datos, usuario)
  }

  if (loading) return <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>Cargando...</div>

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: 22, color: '#e2e8f0', fontWeight: 700 }}>Calendario</h1>
      <CalendarView tareas={tareas} onClickTarea={setTareaSeleccionada} />
      {tareaSeleccionada && (
        <TaskModal
          tarea={tareaSeleccionada}
          zonas={zonas}
          umbralTarea={presupuesto.umbralTarea}
          onClose={() => setTareaSeleccionada(null)}
          onSave={handleSave}
          onDelete={t => { eliminarTarea(t.id, t.titulo, usuario); setTareaSeleccionada(null) }}
        />
      )}
    </div>
  )
}
