import { useNavigate } from 'react-router-dom'
import { USERS } from '../config/users'
import { Home } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()

  function elegirUsuario(nombre) {
    localStorage.setItem('currentUser', nombre)
    navigate('/')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0f1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#1a1d27', border: '1px solid #2d3148',
        borderRadius: 20, padding: 40, width: '100%', maxWidth: 380, textAlign: 'center',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Home size={28} color="#6366f1" />
          </div>
        </div>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, color: '#e2e8f0', fontWeight: 700 }}>
          Mantenimiento Casa
        </h1>
        <p style={{ margin: '0 0 32px', color: '#64748b', fontSize: 14 }}>
          Seleccioná tu nombre para continuar
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {USERS.map(nombre => (
            <button
              key={nombre}
              onClick={() => elegirUsuario(nombre)}
              style={{
                background: '#21253a', border: '1px solid #2d3148',
                borderRadius: 10, padding: '14px 20px',
                color: '#e2e8f0', fontSize: 15, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s ease',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.15)'
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'
                e.currentTarget.style.color = '#a5b4fc'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#21253a'
                e.currentTarget.style.borderColor = '#2d3148'
                e.currentTarget.style.color = '#e2e8f0'
              }}
            >
              {nombre}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
