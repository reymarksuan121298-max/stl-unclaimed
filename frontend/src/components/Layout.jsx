import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Package,
    Clock,
    DollarSign,
    FileText,
    Users,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'
import { authHelpers } from '../lib/supabase'

function Layout({ children, user }) {
    const location = useLocation()
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            await authHelpers.signOut()
            window.location.reload() // Reload to trigger app to show login screen
        }
    }

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Unclaimed', href: '/unclaimed', icon: Package },
        { name: 'Pending', href: '/pending', icon: Clock },
        { name: 'Collections', href: '/collections', icon: DollarSign },
        { name: 'Reports', href: '/reports', icon: FileText },
        { name: 'Users', href: '/users', icon: Users },
    ]

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                <div className="flex flex-col flex-grow bg-gradient-to-b from-indigo-600 to-purple-700 overflow-y-auto shadow-2xl">
                    {/* Logo */}
                    <div className="flex items-center flex-shrink-0 px-6 py-6 bg-black/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">STL Unclaimed</h1>
                                <p className="text-xs text-indigo-200">Collections System</p>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="px-6 py-4 bg-black/10 border-y border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                    {user?.fullname?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user?.fullname || 'User'}</p>
                                <p className="text-xs text-indigo-200 truncate capitalize">{user?.role || 'Role'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
                                        ? 'bg-white text-indigo-600 shadow-lg'
                                        : 'text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="px-4 py-4 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-200"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-700 shadow-lg">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-2">
                        <Package className="w-6 h-6 text-white" />
                        <h1 className="text-lg font-bold text-white">STL Unclaimed</h1>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-lg text-white hover:bg-white/10"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="bg-white border-t border-gray-200 shadow-xl">
                        <div className="px-4 py-3 bg-gray-50 border-b">
                            <p className="text-sm font-semibold text-gray-900">{user?.fullname || 'User'}</p>
                            <p className="text-xs text-gray-600 capitalize">{user?.role || 'Role'}</p>
                        </div>
                        <nav className="py-2">
                            {navigation.map((item) => {
                                const Icon = item.icon
                                const active = isActive(item.href)
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 ${active
                                            ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                )
                            })}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="md:pl-64">
                <main className="pt-16 md:pt-0">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default Layout
