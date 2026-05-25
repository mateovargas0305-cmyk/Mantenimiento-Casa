import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Budget from './pages/Budget'
import Settings from './pages/Settings'

function RequireAuth({ children }) {
  const user = localStorage.getItem('currentUser')
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter basename="/mantenimiento-casa">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="tareas" element={<Tasks />} />
          <Route path="calendario" element={<Calendar />} />
          <Route path="presupuesto" element={<Budget />} />
          <Route path="config" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
