export function calcularCostoMateriales(materiales = []) {
  return materiales.reduce((total, m) => {
    return total + (Number(m.cantidad) || 0) * (Number(m.costoUnitario) || 0)
  }, 0)
}

export function calcularCostoManoObra(horasManoObra = 0, costoPorHora = 0) {
  return (Number(horasManoObra) || 0) * (Number(costoPorHora) || 0)
}

export function calcularCostoTotal(materiales = [], horasManoObra = 0, costoPorHora = 0) {
  return calcularCostoMateriales(materiales) + calcularCostoManoObra(horasManoObra, costoPorHora)
}

export function calcularResumenPresupuesto(tareas = [], presupuestoTotal = 0) {
  const gastado = tareas
    .filter(t => t.estado === 'Completado')
    .reduce((sum, t) => sum + (t.costoTotal || 0), 0)

  const comprometido = tareas
    .filter(t => t.estado === 'En progreso' || t.estado === 'Pendiente')
    .reduce((sum, t) => sum + (t.costoTotal || 0), 0)

  const consumido = gastado + comprometido
  const disponible = presupuestoTotal - consumido
  const porcentaje = presupuestoTotal > 0 ? (consumido / presupuestoTotal) * 100 : 0

  return { gastado, comprometido, consumido, disponible, porcentaje }
}

export function calcularPorZona(tareas = []) {
  const mapa = {}
  tareas.forEach(t => {
    if (!t.zona) return
    if (!mapa[t.zona]) mapa[t.zona] = { tareas: 0, costo: 0 }
    mapa[t.zona].tareas += 1
    mapa[t.zona].costo += t.costoTotal || 0
  })
  return mapa
}

export function calcularPorEstado(tareas = []) {
  const estados = ['Pendiente', 'En progreso', 'Completado', 'Cancelado']
  return estados.reduce((acc, estado) => {
    const lista = tareas.filter(t => t.estado === estado)
    acc[estado] = {
      cantidad: lista.length,
      costo: lista.reduce((s, t) => s + (t.costoTotal || 0), 0)
    }
    return acc
  }, {})
}
