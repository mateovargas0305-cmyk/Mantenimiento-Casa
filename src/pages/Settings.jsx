import { useState } from 'react'
import { Plus, Trash2, Save, Pencil } from 'lucide-react'
import { useZones } from '../hooks/useZones'
import { useBudget } from '../hooks/useBudget'
import { formatCurrency } from '../utils/formatters'

export default function Settings() {
  const { zonas, guardarZonas } = useZones()
  const { presupuesto, guardarPresupuesto } = useBudget()

  const [listaZonas, setListaZonas] = useState(null)
  const [nuevaZona, setNuevaZona] = useState('')
  const [editandoZona, setEditandoZona] = useState(null)
  const [zonaEditada, setZonaEditada] = useState('')
  const [guardandoZonas, setGuardandoZonas] = useState(false)

  const [umbral, setUmbral] = useState(presupuesto.umbralTarea || 50000)
  const [guardandoUmbral, setGuardandoUmbral] = useState(false)

  const zonasTrabajo = listaZonas !== null ? listaZonas : zonas

  function agregarZona() {
    if (!nuevaZona.trim() || zonasTrabajo.includes(nuevaZona.trim())) return
    setListaZonas([...zonasTrabajo, nuevaZona.trim()])
    setNuevaZona('')
  }

  function eliminarZona(zona) {
    setListaZonas(zonasTrabajo.filter(z => z !== zona))
  }

  function iniciarEdicion(zona) {
    setEditandoZona(zona)
    setZonaEditada(zona)
  }

  function confirmarEdicion() {
    if (!zonaEditada.trim()) return
    setListaZonas(zonasTrabajo.map(z => z === editandoZona ? zonaEditada.trim() : z))
    setEditandoZona(null)
  }

  async function guardarTodasZonas() {
    setGuardandoZonas(true)
    await guardarZonas(zonasTrabajo)
    setListaZonas(null)
    setGuardandoZonas(false)
  }

  async function guardarUmbral() {
    setGuardandoUmbral(true)
    await guardarPresupuesto({ ...presupuesto, umbralTarea: Number(umbral) })
    setGuardandoUmbral(false)
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 28px', fontSize: 22, color: '#e2e8f0', fontWeight: 700 }}>Configuración</h1>

      <div style={{ display: 'grid', gap: 24, maxWidth: 640 }}>
        <Section title="Zonas de la casa">
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input
              value={nuevaZona}
              onChange={e => setNuevaZona(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarZona()}
              placeholder="Nueva zona..."
              style={inputStyle}
            />
            <button onClick={agregarZona} style={btnPrimary}>
              <Plus size={16} /> Agregar
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {zonasTrabajo.map(zona => (
              <div key={zona} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#21253a', border: '1px solid #2d3148', borderRadius: 8, padding: '10px 14px',
              }}>
                {editandoZona === zona ? (
                  <input
                    value={zonaEditada}
                    onChange={e => setZonaEditada(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && confirmarEdicion()}
                    autoFocus
                    style={{ ...inputStyle, flex: 1, marginRight: 10, padding: '4px 8px' }}
                  />
                ) : (
                  <span style={{ color: '#e2e8f0', fontSize: 14 }}>{zona}</span>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  {editandoZona === zona ? (
                    <button onClick={confirmarEdicion} style={{ ...btnIcon, color: '#22c55e' }}>
                      <Save size={14} />
                    </button>
                  ) : (
                    <button onClick={() => iniciarEdicion(zona)} style={btnIcon}>
                      <Pencil size={14} />
                    </button>
                  )}
                  <button onClick={() => eliminarZona(zona)} style={{ ...btnIcon, color: '#ef4444' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {listaZonas !== null && (
            <button onClick={guardarTodasZonas} disabled={guardandoZonas} style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>
              <Save size={14} /> {guardandoZonas ? 'Guardando...' : 'Guardar zonas'}
            </button>
          )}
        </Section>

        <Section title="Umbral de alerta por tarea">
          <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 16px' }}>
            Si el costo de una tarea supera este monto, se mostrará una alerta al guardar.
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="number"
              value={umbral}
              min="0"
              onChange={e => setUmbral(e.target.value)}
              style={{ ...inputStyle, maxWidth: 200 }}
            />
            <span style={{ color: '#64748b', fontSize: 13 }}>({formatCurrency(Number(umbral))})</span>
            <button onClick={guardarUmbral} disabled={guardandoUmbral} style={btnPrimary}>
              <Save size={14} /> {guardandoUmbral ? '...' : 'Guardar'}
            </button>
          </div>
        </Section>

      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 12, padding: 24 }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 16, color: '#e2e8f0', fontWeight: 600 }}>{title}</h2>
      {children}
    </div>
  )
}

const inputStyle = {
  flex: 1, background: '#21253a', border: '1px solid #2d3148',
  borderRadius: 8, padding: '9px 12px', color: '#e2e8f0',
  fontSize: 14, outline: 'none',
}

const btnPrimary = {
  background: '#6366f1', border: 'none', color: 'white',
  padding: '9px 16px', borderRadius: 8, cursor: 'pointer',
  fontSize: 13, fontWeight: 500,
  display: 'flex', alignItems: 'center', gap: 6,
}

const btnIcon = {
  background: 'none', border: 'none', color: '#64748b',
  cursor: 'pointer', padding: 4, display: 'flex',
  alignItems: 'center', borderRadius: 4,
}
