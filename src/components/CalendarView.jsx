import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PRIORITY_COLORS } from '../utils/colors'
import { formatDate } from '../utils/formatters'

const DIAS_DESKTOP = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DIAS_MOBILE  = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function getTimestampMs(ts) {
  if (!ts) return null
  if (ts?.toDate) return ts.toDate().getTime()
  return new Date(ts).getTime()
}

export default function CalendarView({ tareas, onClickTarea }) {
  const hoy = new Date()
  const [year, setYear] = useState(hoy.getFullYear())
  const [month, setMonth] = useState(hoy.getMonth())
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const primerDia = new Date(year, month, 1)
  const ultimoDia = new Date(year, month + 1, 0)
  const startDow = primerDia.getDay()

  const celdas = []
  for (let i = 0; i < startDow; i++) celdas.push(null)
  for (let d = 1; d <= ultimoDia.getDate(); d++) celdas.push(d)
  while (celdas.length % 7 !== 0) celdas.push(null)

  function tareasDelMes() {
    const inicioMes = new Date(year, month, 1).getTime()
    const finMes = new Date(year, month + 1, 0, 23, 59, 59).getTime()
    return tareas.filter(t => {
      const inicio = getTimestampMs(t.fechaInicio)
      if (!inicio) return false
      const fin = getTimestampMs(t.fechaFin) ?? inicio
      return inicio <= finMes && fin >= inicioMes
    }).sort((a, b) => getTimestampMs(a.fechaInicio) - getTimestampMs(b.fechaInicio))
  }

  function tareasEnDia(dia) {
    if (!dia) return []
    const diaInicio = new Date(year, month, dia).getTime()
    const diaFin = new Date(year, month, dia, 23, 59, 59).getTime()
    return tareas.filter(t => {
      const inicio = getTimestampMs(t.fechaInicio)
      if (!inicio) return false
      const fin = getTimestampMs(t.fechaFin) ?? inicio
      return inicio <= diaFin && fin >= diaInicio
    })
  }

  function esInicioEnDia(tarea, dia) {
    const ms = getTimestampMs(tarea.fechaInicio)
    if (!ms) return false
    const d = new Date(ms)
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === dia
  }

  function prevMes() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMes() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const listaMes = tareasDelMes()
  const DIAS = isMobile ? DIAS_MOBILE : DIAS_DESKTOP
  const maxChips = isMobile ? 1 : 3
  const celdaMinHeight = isMobile ? 52 : 80

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 280px',
      gap: 20,
      alignItems: 'start',
    }}>
      {/* Grilla del calendario */}
      <div>
        {/* Navegación mes */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={prevMes} style={navBtn}><ChevronLeft size={18} /></button>
          <h2 style={{ margin: 0, fontSize: isMobile ? 16 : 18, color: '#e2e8f0', textAlign: 'center' }}>
            {MESES[month]} {year}
          </h2>
          <button onClick={nextMes} style={navBtn}><ChevronRight size={18} /></button>
        </div>

        {/* Cabecera días */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
          {DIAS.map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: isMobile ? 11 : 12,
              color: '#64748b', padding: '4px 0', fontWeight: 600,
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Celdas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {celdas.map((dia, i) => {
            const ts = tareasEnDia(dia)
            const esHoy = dia && hoy.getFullYear() === year && hoy.getMonth() === month && hoy.getDate() === dia
            return (
              <div key={i} style={{
                minHeight: celdaMinHeight,
                background: dia ? '#21253a' : 'transparent',
                borderRadius: 6,
                padding: isMobile ? '4px 2px' : '6px 4px',
                border: esHoy ? '1px solid #6366f1' : '1px solid transparent',
              }}>
                {dia && (
                  <>
                    <div style={{
                      fontSize: isMobile ? 11 : 12,
                      color: esHoy ? '#6366f1' : '#94a3b8',
                      fontWeight: esHoy ? 700 : 400,
                      marginBottom: 2,
                      textAlign: 'center',
                    }}>
                      {dia}
                    </div>

                    {ts.slice(0, maxChips).map(t => {
                      const inicio = esInicioEnDia(t, dia)
                      const color = PRIORITY_COLORS[t.prioridad] || '#64748b'
                      return (
                        <div key={t.id} onClick={() => onClickTarea(t)}
                          style={{
                            fontSize: isMobile ? 9 : 10,
                            padding: isMobile ? '1px 2px' : '2px 4px',
                            marginBottom: 1,
                            borderRadius: inicio ? 3 : '0 3px 3px 0',
                            background: `${color}${inicio ? '33' : '1a'}`,
                            color,
                            cursor: 'pointer',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            borderLeft: `2px solid ${color}${inicio ? '' : '88'}`,
                            opacity: inicio ? 1 : 0.75,
                          }}>
                          {/* En mobile solo punto de color, sin texto */}
                          {isMobile ? '' : (!inicio && '· ')}{isMobile ? ' ' : t.titulo}
                        </div>
                      )
                    })}

                    {/* Indicador de cantidad en mobile */}
                    {isMobile && ts.length > 0 && (
                      <div style={{
                        fontSize: 9, textAlign: 'center', marginTop: 1,
                        color: PRIORITY_COLORS[ts[0].prioridad] || '#64748b',
                        fontWeight: 600,
                      }}>
                        {ts.length}
                      </div>
                    )}

                    {!isMobile && ts.length > maxChips && (
                      <div style={{ fontSize: 10, color: '#64748b' }}>+{ts.length - maxChips}</div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Panel lateral — tareas del mes */}
      <div style={{
        background: '#21253a', borderRadius: 12,
        border: '1px solid #2d3148', padding: 16,
      }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Tareas del mes
        </h3>
        {listaMes.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Sin tareas este mes</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {listaMes.map(t => (
              <div key={t.id} onClick={() => onClickTarea(t)}
                style={{
                  padding: '10px 12px', borderRadius: 8,
                  background: '#1a1d27',
                  border: `1px solid ${PRIORITY_COLORS[t.prioridad] || '#64748b'}44`,
                  cursor: 'pointer',
                }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 3 }}>
                  {t.titulo}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  {formatDate(t.fechaInicio)}
                  {t.fechaFin && getTimestampMs(t.fechaFin) !== getTimestampMs(t.fechaInicio) && (
                    <> → {formatDate(t.fechaFin)}</>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const navBtn = {
  background: '#21253a', border: '1px solid #2d3148',
  color: '#94a3b8', borderRadius: 8, padding: '6px 10px',
  cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0,
}
