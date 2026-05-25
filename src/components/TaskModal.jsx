import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Timestamp } from 'firebase/firestore'
import ActivityFeed from './ActivityFeed'
import { calcularCostoMateriales, calcularCostoManoObra, calcularCostoTotal } from '../utils/calculations'
import { formatCurrency, toDateInputValue } from '../utils/formatters'
import { USERS } from '../config/users'
import { STATUS_COLORS, PRIORITY_COLORS } from '../utils/colors'
import { useActivity } from '../hooks/useActivity'

const ESTADOS = ['Pendiente', 'En progreso', 'Completado', 'Cancelado']
const PRIORIDADES = ['Alta', 'Media', 'Baja']
const MATERIAL_VACIO = { nombre: '', cantidad: 1, costoUnitario: 0 }

export default function TaskModal({ tarea, zonas, onClose, onSave, onDelete, umbralTarea }) {
  const usuario = localStorage.getItem('currentUser') || 'Usuario'
  const { actividad } = useActivity(100)
  const actividadTarea = tarea?.id ? actividad.filter(a => a.tareaId === tarea.id) : []

  const [form, setForm] = useState({
    titulo: '', descripcion: '', zona: zonas[0] || '',
    prioridad: 'Media', estado: 'Pendiente',
    responsable: null, fechaInicio: '', fechaFin: '',
    materiales: [], horasManoObra: 0, costoPorHora: 0,
    notas: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [alertaUmbral, setAlertaUmbral] = useState(false)

  useEffect(() => {
    if (tarea) {
      setForm({
        titulo: tarea.titulo || '',
        descripcion: tarea.descripcion || '',
        zona: tarea.zona || zonas[0] || '',
        prioridad: tarea.prioridad || 'Media',
        estado: tarea.estado || 'Pendiente',
        responsable: tarea.responsable || null,
        fechaInicio: toDateInputValue(tarea.fechaInicio),
        fechaFin: toDateInputValue(tarea.fechaFin),
        materiales: tarea.materiales || [],
        horasManoObra: tarea.horasManoObra || 0,
        costoPorHora: tarea.costoPorHora || 0,
        notas: tarea.notas || '',
      })
    }
  }, [tarea])

  const costoMat = calcularCostoMateriales(form.materiales)
  const costoMO = calcularCostoManoObra(form.horasManoObra, form.costoPorHora)
  const costoTotal = costoMat + costoMO

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function agregarMaterial() {
    set('materiales', [...form.materiales, { ...MATERIAL_VACIO }])
  }

  function editarMaterial(i, key, value) {
    const copia = [...form.materiales]
    copia[i] = { ...copia[i], [key]: value }
    set('materiales', copia)
  }

  function quitarMaterial(i) {
    set('materiales', form.materiales.filter((_, idx) => idx !== i))
  }

  function toTimestamp(dateStr) {
    if (!dateStr) return null
    return Timestamp.fromDate(new Date(dateStr))
  }

  async function handleGuardar() {
    if (!form.titulo.trim()) return
    if (umbralTarea && costoTotal > umbralTarea) {
      setAlertaUmbral(true)
      return
    }
    setGuardando(true)
    const datos = {
      ...form,
      fechaInicio: toTimestamp(form.fechaInicio),
      fechaFin: toTimestamp(form.fechaFin),
      costoTotal,
    }
    await onSave(datos, tarea?.id)
    setGuardando(false)
    onClose()
  }

  async function confirmarAlertaYGuardar() {
    setAlertaUmbral(false)
    setGuardando(true)
    const datos = {
      ...form,
      fechaInicio: toTimestamp(form.fechaInicio),
      fechaFin: toTimestamp(form.fechaFin),
      costoTotal,
    }
    await onSave(datos, tarea?.id)
    setGuardando(false)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'flex-start', justifyContent: 'center',
      padding: '20px 16px', overflowY: 'auto',
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#1a1d27', borderRadius: 16,
        border: '1px solid #2d3148', width: '100%', maxWidth: 720,
        padding: 28,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: '#e2e8f0' }}>
            {tarea ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {alertaUmbral && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <p style={{ color: '#ef4444', margin: '0 0 12px', fontSize: 14 }}>
              ⚠️ El costo de esta tarea ({formatCurrency(costoTotal)}) supera el umbral configurado ({formatCurrency(umbralTarea)}).
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <BtnPrimary onClick={confirmarAlertaYGuardar}>Guardar igual</BtnPrimary>
              <BtnSecondary onClick={() => setAlertaUmbral(false)}>Revisar</BtnSecondary>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: 16 }}>
          <Field label="Título *">
            <input value={form.titulo} onChange={e => set('titulo', e.target.value)}
              style={inputStyle} placeholder="Nombre de la tarea" />
          </Field>

          <Field label="Descripción">
            <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Descripción detallada..." />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <Field label="Zona">
              <select value={form.zona} onChange={e => set('zona', e.target.value)} style={inputStyle}>
                {zonas.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </Field>
            <Field label="Prioridad">
              <select value={form.prioridad} onChange={e => set('prioridad', e.target.value)} style={inputStyle}>
                {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Estado">
              <select value={form.estado} onChange={e => set('estado', e.target.value)} style={inputStyle}>
                {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <Field label="Responsable">
              <select value={form.responsable || ''} onChange={e => set('responsable', e.target.value || null)} style={inputStyle}>
                <option value="">Sin asignar</option>
                {USERS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Fecha inicio">
              <input type="date" value={form.fechaInicio} onChange={e => set('fechaInicio', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Fecha fin estimada">
              <input type="date" value={form.fechaFin} onChange={e => set('fechaFin', e.target.value)} style={inputStyle} />
            </Field>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={labelStyle}>Materiales</label>
              <button onClick={agregarMaterial} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)',
                color: '#a5b4fc', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
              }}>
                <Plus size={13} /> Agregar
              </button>
            </div>
            {form.materiales.length > 0 && (
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 40px', gap: 8, fontSize: 11, color: '#64748b', padding: '0 4px' }}>
                  <span>Nombre</span><span>Cantidad</span><span>Costo unit.</span><span></span>
                </div>
                {form.materiales.map((m, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 40px', gap: 8, alignItems: 'center' }}>
                    <input value={m.nombre} onChange={e => editarMaterial(i, 'nombre', e.target.value)}
                      style={{ ...inputStyle, padding: '6px 10px' }} placeholder="Material" />
                    <input type="number" value={m.cantidad} onChange={e => editarMaterial(i, 'cantidad', Number(e.target.value))}
                      style={{ ...inputStyle, padding: '6px 10px' }} min="0" />
                    <input type="number" value={m.costoUnitario} onChange={e => editarMaterial(i, 'costoUnitario', Number(e.target.value))}
                      style={{ ...inputStyle, padding: '6px 10px' }} min="0" />
                    <button onClick={() => quitarMaterial(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div style={{ textAlign: 'right', fontSize: 13, color: '#94a3b8', paddingRight: 48 }}>
                  Subtotal: <span style={{ color: '#22c55e', fontWeight: 600 }}>{formatCurrency(costoMat)}</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Horas de mano de obra">
              <input type="number" value={form.horasManoObra} min="0"
                onChange={e => set('horasManoObra', Number(e.target.value))} style={inputStyle} />
            </Field>
            <Field label="Costo por hora ($)">
              <input type="number" value={form.costoPorHora} min="0"
                onChange={e => set('costoPorHora', Number(e.target.value))} style={inputStyle} />
            </Field>
          </div>

          {(form.horasManoObra > 0 || form.costoPorHora > 0) && (
            <div style={{ textAlign: 'right', fontSize: 13, color: '#94a3b8' }}>
              Subtotal MO: <span style={{ color: '#3b82f6', fontWeight: 600 }}>{formatCurrency(costoMO)}</span>
            </div>
          )}

          <div style={{
            background: '#21253a', borderRadius: 10, padding: 16,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ color: '#94a3b8', fontSize: 14 }}>Costo total estimado</span>
            <span style={{ color: '#22c55e', fontSize: 20, fontWeight: 700 }}>{formatCurrency(costoTotal)}</span>
          </div>

          <Field label="Notas adicionales">
            <textarea value={form.notas} onChange={e => set('notas', e.target.value)}
              style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder="Notas, observaciones..." />
          </Field>

          {tarea && actividadTarea.length > 0 && (
            <div>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 10 }}>Historial de actividad</label>
              <div style={{ background: '#21253a', borderRadius: 10, padding: 16 }}>
                <ActivityFeed actividad={actividadTarea} limit={10} />
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 12 }}>
          <div>
            {tarea && onDelete && (
              <button onClick={() => { onDelete(tarea); onClose() }} style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
              }}>
                Eliminar
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <BtnSecondary onClick={onClose}>Cancelar</BtnSecondary>
            <BtnPrimary onClick={handleGuardar} disabled={guardando || !form.titulo.trim()}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </BtnPrimary>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function BtnPrimary({ onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? '#2d3148' : '#6366f1',
      border: 'none', color: 'white',
      padding: '9px 20px', borderRadius: 8,
      cursor: disabled ? 'default' : 'pointer', fontSize: 14, fontWeight: 500,
    }}>
      {children}
    </button>
  )
}

function BtnSecondary({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', border: '1px solid #2d3148',
      color: '#94a3b8', padding: '9px 20px', borderRadius: 8,
      cursor: 'pointer', fontSize: 14,
    }}>
      {children}
    </button>
  )
}

const inputStyle = {
  width: '100%', background: '#21253a', border: '1px solid #2d3148',
  borderRadius: 8, padding: '9px 12px', color: '#e2e8f0',
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block', fontSize: 12, color: '#94a3b8',
  fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
}
