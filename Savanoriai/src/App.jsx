import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import SavanoriasLayout from './components/SavanoriasLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SavanoriaiPage from './pages/SavanoriaiPage'
import SavanorystesPage from './pages/SavanorystesPage'
import RenginiaPage from './pages/RenginiaPage'
import StatistikaPage from './pages/StatistikaPage'
import SavanoriasRenginiai from './pages/SavanoriasRenginiai'
import SavanoriasLeaderboard from './pages/SavanoriasLeaderboard'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { role, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (role === 'savanoris') {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><SavanoriasLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/renginiai" replace />} />
          <Route path="renginiai" element={<SavanoriasRenginiai />} />
          <Route path="leaderboard" element={<SavanoriasLeaderboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/renginiai" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="savanoriai" element={<SavanoriaiPage />} />
        <Route path="savanorystes" element={<SavanorystesPage />} />
        <Route path="renginiai" element={<RenginiaPage />} />
        <Route path="statistika" element={<StatistikaPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}