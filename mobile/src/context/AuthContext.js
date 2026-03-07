import React, { createContext, useContext, useEffect, useState } from 'react'
import { authHelpers } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        authHelpers.getCurrentUser().then((u) => {
            setUser(u)
            setLoading(false)
        })
    }, [])

    const login = async (username, password) => {
        const userData = await authHelpers.signIn(username, password)
        if (!userData) throw new Error('Invalid credentials or account inactive.')

        const role = userData.role?.toLowerCase()
        if (role !== 'cashier' && role !== 'collector') {
            throw new Error('This app is for Cashier and Collector accounts only.')
        }

        await authHelpers.setCurrentUser(userData)
        setUser(userData)
        return userData
    }

    const logout = async () => {
        await authHelpers.signOut()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
