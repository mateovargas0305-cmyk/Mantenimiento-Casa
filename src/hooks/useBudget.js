import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

export function useBudget() {
  const [presupuesto, setPresupuesto] = useState({ total: 0, alerta80: false, umbralTarea: 50000 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'presupuesto'), (snap) => {
      if (snap.exists()) setPresupuesto(snap.data())
      setLoading(false)
    }, (err) => {
      console.error(err)
      setLoading(false)
    })
    return unsub
  }, [])

  async function guardarPresupuesto(datos) {
    await setDoc(doc(db, 'config', 'presupuesto'), datos, { merge: true })
  }

  return { presupuesto, loading, guardarPresupuesto }
}
