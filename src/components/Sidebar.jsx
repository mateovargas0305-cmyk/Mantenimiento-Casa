import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Calendar, DollarSign, Settings, X, Home } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tareas', icon: CheckSquare, label: 'Tareas' },
  { to: '/calendario', icon: Calendar, label: 'Calendario' },
  { to: '/presupuesto', icon: DollarSign, label: 'Presupuesto' },
  { to: '/config', icon: Settings, label: 'Configuración' },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 40, display: 'none'
          }}
        />
      )}
      <aside style={{
        width: 220,
        background: '#1a1d27',
        borderRight: '1px solid #2d3148',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        transition: 'transform 0.3s ease',
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #2d3148', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Home size={22} color="#6366f1" />
          <span style={{ fontWeight: 700, fontSize: 16, color: '#e2e8f0' }}>Mantenimiento</span>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8,
                color: isActive ? '#6366f1' : '#94a3b8',
                background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                textDecoration: 'none', fontWeight: isActive ? 600 : 400,
                fontSize: 14, transition: 'all 0.15s ease',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
