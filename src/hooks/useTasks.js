import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { calcularCostoTotal } from '../utils/calculations'
import { useActivity } from './useActivity'

export function useTasks() {
  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { registrar } = useActivity()

  useEffect(() => {
    const q = query(collection(db, 'tareas'), orderBy('fechaCreacion', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setTareas(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => {
      console.error(err)
      setError(err.message)
      setLoading(false)
    })
    return unsub
  }, [])

  async function crearTarea(datos, usuario) {
    const costoTotal = calcularCostoTotal(datos.materiales, datos.horasManoObra, datos.costoPorHora)
    const ref = await addDoc(collection(db, 'tareas'), {
      ...datos,
      costoTotal,
      creadoPor: usuario,
      fechaCreacion: serverTimestamp(),
    })
    await registrar(ref.id, datos.titulo, usuario, 'creó la tarea')
    return ref.id
  }

  async function actualizarTarea(id, datos, usuario, tituloAnterior) {
    const costoTotal = calcularCostoTotal(datos.materiales, datos.horasManoObra, datos.costoPorHora)
    await updateDoc(doc(db, 'tareas', id), { ...datos, costoTotal })

    if (datos.estado !== undefined) {
      await registrar(id, datos.titulo || tituloAnterior, usuario, `marcó como ${datos.estado}`)
    } else {
      await registrar(id, datos.titulo || tituloAnterior, usuario, 'editó la tarea')
    }
  }

  async function eliminarTarea(id, titulo, usuario) {
    await deleteDoc(doc(db, 'tareas', id))
    await registrar(id, titulo, usuario, 'eliminó la tarea')
  }

  async function cambiarEstado(id, titulo, nuevoEstado, usuario) {
    await updateDoc(doc(db, 'tareas', id), { estado: nuevoEstado })
    await registrar(id, titulo, usuario, `marcó como ${nuevoEstado}`)
  }

  async function marcarMaterialComprado(tareaId, materialIndex, comprado) {
    const tarea = tareas.find(t => t.id === tareaId)
    if (!tarea) return
    const materiales = [...(tarea.materiales || [])]
    materiales[materialIndex] = { ...materiales[materialIndex], comprado }
    await updateDoc(doc(db, 'tareas', tareaId), { materiales })
  }

  return { tareas, loading, error, crearTarea, actualizarTarea, eliminarTarea, cambiarEstado, marcarMaterialComprado }
}
