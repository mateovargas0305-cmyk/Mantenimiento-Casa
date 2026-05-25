import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const usuario = localStorage.getItem('currentUser') || 'Usuario'

  function logout() {
    localStorage.removeItem('currentUser')
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f1117' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          background: '#1a1d27',
          borderBottom: '1px solid #2d3148',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'none' }}
          >
            <Menu size={22} />
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 500 }}>{usuario}</span>
            <button
              onClick={logout}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444', padding: '6px 12px', borderRadius: 8,
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
              }}
            >
              <LogOut size={14} />
              Salir
            </button>
          </div>
        </header>
        <main style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
