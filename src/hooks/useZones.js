import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { seedZoneColors } from '../utils/colors'

export function useZones() {
  const [zonas, setZonas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'zonas'), (snap) => {
      if (snap.exists()) {
        const lista = snap.data().lista || []
        setZonas(lista)
        seedZoneColors(lista)
      } else {
        const defaults = ['Cocina', 'Baño', 'Living', 'Dormitorio', 'Exterior']
        setZonas(defaults)
        seedZoneColors(defaults)
      }
      setLoading(false)
    }, (err) => {
      console.error(err)
      setLoading(false)
    })
    return unsub
  }, [])

  async function guardarZonas(lista) {
    await setDoc(doc(db, 'config', 'zonas'), { lista })
  }

  return { zonas, loading, guardarZonas }
}
