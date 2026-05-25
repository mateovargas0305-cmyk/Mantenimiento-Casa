import { useState, useEffect, useCallback } from 'react'
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../config/firebase'

export function useActivity(limitCount = 50) {
  const [actividad, setActividad] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'actividad'), orderBy('timestamp', 'desc'), limit(limitCount))
    const unsub = onSnapshot(q, (snap) => {
      setActividad(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => {
      console.error(err)
      setLoading(false)
    })
    return unsub
  }, [limitCount])

  const registrar = useCallback(async (tareaId, tareaTitulo, usuario, accion) => {
    try {
      await addDoc(collection(db, 'actividad'), {
        tareaId,
        tareaTitulo,
        usuario,
        accion,
        timestamp: serverTimestamp(),
      })
    } catch (err) {
      console.error('Error registrando actividad:', err)
    }
  }, [])

  return { actividad, loading, registrar }
}
