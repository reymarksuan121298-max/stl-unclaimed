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

  // If logged in, show the app with routing
  return (
    <BrowserRouter>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/unclaimed" element={<Unclaimed user={user} />} />
          <Route path="/pending" element={<Pending user={user} />} />
          <Route path="/collections" element={<Collections user={user} />} />
          <Route path="/reports" element={<Reports user={user} />} />
          <Route path="/users" element={<Users user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
