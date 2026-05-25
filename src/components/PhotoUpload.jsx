import { useState, useRef } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../config/firebase'
import { Upload, X, Image } from 'lucide-react'

export default function PhotoUpload({ label, url, onChange, tareaId, tipo }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef()

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setProgress(0)

    try {
      const storageRef = ref(storage, `tareas/${tareaId || 'nueva'}/${tipo}_${Date.now()}`)
      const task = uploadBytesResumable(storageRef, file)

      task.on('state_changed',
        (snap) => setProgress((snap.bytesTransferred / snap.totalBytes) * 100),
        (err) => { console.error(err); setUploading(false) },
        async () => {
          const downloadURL = await getDownloadURL(task.snapshot.ref)
          onChange(downloadURL)
          setUploading(false)
        }
      )
    } catch (err) {
      console.error(err)
      setUploading(false)
    }
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, fontWeight: 500 }}>{label}</div>
      {url ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={url}
            alt={label}
            style={{ width: '100%', maxWidth: 200, height: 130, objectFit: 'cover', borderRadius: 8, border: '1px solid #2d3148' }}
          />
          <button
            onClick={() => onChange(null)}
            style={{
              position: 'absolute', top: 6, right: 6,
              background: 'rgba(0,0,0,0.7)', border: 'none',
              color: 'white', borderRadius: '50%', width: 24, height: 24,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current.click()}
          style={{
            width: 200, height: 130,
            border: '2px dashed #2d3148',
            borderRadius: 8,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', gap: 8,
            background: uploading ? 'rgba(99,102,241,0.05)' : 'transparent',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#2d3148'}
        >
          {uploading ? (
            <>
              <Upload size={20} color="#6366f1" />
              <span style={{ fontSize: 12, color: '#6366f1' }}>{progress.toFixed(0)}%</span>
            </>
          ) : (
            <>
              <Image size={20} color="#64748b" />
              <span style={{ fontSize: 12, color: '#64748b' }}>Subir foto</span>
            </>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}
