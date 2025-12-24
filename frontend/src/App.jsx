import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Unclaimed from './pages/Unclaimed'
import Pending from './pages/Pending'
import Collections from './pages/Collections'
import Reports from './pages/Reports'
import Users from './pages/Users'
import { authHelpers } from './lib/supabase'
import { hasPermission, PERMISSIONS } from './utils/permissions'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authHelpers.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // If not logged in, show login page
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  // Helper to find default landing page
  const getDefaultRoute = () => {
    if (hasPermission(user, PERMISSIONS.VIEW_DASHBOARD)) return '/'
    if (hasPermission(user, PERMISSIONS.VIEW_UNCLAIMED)) return '/unclaimed'
    if (hasPermission(user, PERMISSIONS.VIEW_PENDING)) return '/pending'
    if (hasPermission(user, PERMISSIONS.VIEW_COLLECTIONS)) return '/collections'
    if (hasPermission(user, PERMISSIONS.VIEW_REPORTS)) return '/reports'
    if (hasPermission(user, PERMISSIONS.VIEW_USERS)) return '/users'
    return '/unclaimed' // Fallback
  }

  const defaultRoute = getDefaultRoute()

  // Helper for route guard
  const ProtectedRoute = ({ element, permission }) => {
    return hasPermission(user, permission) ? element : <Navigate to={defaultRoute} replace />
  }

  // If logged in, show the app with routing
  return (
    <BrowserRouter>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={
            hasPermission(user, PERMISSIONS.VIEW_DASHBOARD)
              ? <Dashboard user={user} />
              : <Navigate to={defaultRoute} replace />
          } />
          <Route path="/unclaimed" element={<ProtectedRoute element={<Unclaimed user={user} />} permission={PERMISSIONS.VIEW_UNCLAIMED} />} />
          <Route path="/pending" element={<ProtectedRoute element={<Pending user={user} />} permission={PERMISSIONS.VIEW_PENDING} />} />
          <Route path="/collections" element={<ProtectedRoute element={<Collections user={user} />} permission={PERMISSIONS.VIEW_COLLECTIONS} />} />
          <Route path="/reports" element={<ProtectedRoute element={<Reports user={user} />} permission={PERMISSIONS.VIEW_REPORTS} />} />
          <Route path="/users" element={<ProtectedRoute element={<Users user={user} />} permission={PERMISSIONS.VIEW_USERS} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
