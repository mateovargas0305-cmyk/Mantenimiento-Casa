import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const navigate = useNavigate()
  const location = useLocation()
  const usuario = localStorage.getItem('currentUser') || 'Usuario'

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Cerrar sidebar al navegar en mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [location.pathname])

  function logout() {
    localStorage.removeItem('currentUser')
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f1117' }}>
      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 40,
          }}
        />
      )}

      <Sidebar open={sidebarOpen} isMobile={isMobile} />

      <div style={{
        marginLeft: isMobile ? 0 : 220,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}>
        <header style={{
          background: '#1a1d27',
          borderBottom: '1px solid #2d3148',
          padding: '0 16px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 30,
          gap: 12,
        }}>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none', border: 'none',
                color: '#94a3b8', cursor: 'pointer',
                display: 'flex', alignItems: 'center', padding: 4,
                flexShrink: 0,
              }}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 500 }}>{usuario}</span>
            <button
              onClick={logout}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444', padding: '6px 10px', borderRadius: 8,
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
              }}
            >
              <LogOut size={14} />
              {!isMobile && 'Salir'}
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: isMobile ? 16 : 24, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
