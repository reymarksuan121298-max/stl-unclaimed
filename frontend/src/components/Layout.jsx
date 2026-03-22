import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Package,
    Clock,
    DollarSign,
    Wallet,
    FileText,
    Users,
    MapPin,
    LogOut,
    Menu,
    X,
    User
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { authHelpers } from '../lib/supabase'
import { hasPermission, PERMISSIONS } from '../utils/permissions'

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
        { name: 'Dashboard', href: '/', icon: LayoutDashboard, permission: PERMISSIONS.VIEW_DASHBOARD },
        { name: 'Unclaimed', href: '/unclaimed', icon: Package, permission: PERMISSIONS.VIEW_UNCLAIMED },
        { name: 'Pending', href: '/pending', icon: Clock, permission: PERMISSIONS.VIEW_PENDING },
        { name: 'Cash Deposits', href: '/cash-deposits', icon: Wallet, permission: PERMISSIONS.VIEW_CASH_DEPOSITS },
        { name: 'Collections', href: '/collections', icon: DollarSign, permission: PERMISSIONS.VIEW_COLLECTIONS },
        { name: 'Reports', href: '/reports', icon: FileText, permission: PERMISSIONS.VIEW_REPORTS },
        { name: 'Users', href: '/users', icon: Users, permission: PERMISSIONS.VIEW_USERS },
        { name: 'Areas', href: '/areas', icon: MapPin, permission: PERMISSIONS.MANAGE_USERS },
        { name: 'Profile', href: '/profile', icon: User, permission: 'authenticated' },
    ].filter(item => item.permission === 'authenticated' || hasPermission(user, item.permission))

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                <div className="flex flex-col flex-grow bg-brand-teal overflow-y-auto shadow-2xl">
                    {/* Logo */}
                    <div className="flex items-center justify-center flex-shrink-0 px-6 py-6 bg-black/10">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
                                <img src="/logo.png" alt="STL Logo" className="w-full h-full object-contain p-1" />
                            </div>
                            <div className="text-center">
                                <h1 className="text-xl font-bold text-white uppercase tracking-wider">Glowing Fortune</h1>
                                <p className="text-xs text-brand-gold font-medium">Gaming OPC</p>
                            </div>
                        </div>
                    </div>
                    {/* User Info */}
                    <Link 
                        to="/profile"
                        className="px-6 py-4 bg-black/10 border-y border-white/10 flex items-center gap-3 hover:bg-black/20 transition-all group"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all overflow-hidden border border-white/10">
                            {user?.profile_url ? (
                                <img src={user.profile_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white font-semibold text-sm">
                                    {user?.fullname?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate group-hover:underline">{user?.fullname || 'User'}</p>
                            <p className="text-xs text-brand-gold truncate">
                                {(user?.role || 'Role').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </p>
                        </div>
                    </Link>

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
                                        ? 'bg-brand-gold text-white shadow-lg'
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
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-brand-teal shadow-lg">
                <div className="flex items-center justify-between px-4 py-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-lg text-white hover:bg-white/10"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Package className="w-6 h-6 text-white" />
                        <h1 className="text-lg font-bold text-white">STL Unclaimed</h1>
                    </div>
                    <div className="w-10"></div> {/* Spacer for centering */}
                </div>
            </div>

            {/* Mobile Sidebar Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden fixed inset-0 bg-black/50 z-40"
                            onClick={() => setIsMobileMenuOpen(false)}
                        ></motion.div>

                        {/* Slide-out Sidebar */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="md:hidden fixed inset-y-0 left-0 z-50 w-64"
                        >
                            <div className="flex flex-col h-full bg-brand-teal shadow-2xl">
                                {/* Logo */}
                                <div className="flex items-center justify-center flex-shrink-0 px-6 py-6 bg-black/10">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
                                            <img src="/logo.png" alt="STL Logo" className="w-full h-full object-contain p-1" />
                                        </div>
                                        <div className="text-center">
                                            <h1 className="text-xl font-bold text-white">Glowing Fortune</h1>
                                            <p className="text-xs text-brand-gold">Gaming OPC</p>
                                        </div>
                                    </div>
                                </div>

                                {/* User Info */}
                                <Link 
                                    to="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="px-6 py-4 bg-black/10 border-y border-white/10 flex items-center gap-3 hover:bg-black/20 transition-all font-medium"
                                >
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                                        {user?.profile_url ? (
                                            <img src={user.profile_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white font-semibold text-sm">
                                                {user?.fullname?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{user?.fullname || 'User'}</p>
                                        <p className="text-xs text-indigo-200 truncate">
                                            {(user?.role || 'Role').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                        </p>
                                    </div>
                                </Link>

                                {/* Navigation */}
                                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                                    {navigation.map((item, index) => {
                                        const Icon = item.icon
                                        const active = isActive(item.href)
                                        return (
                                            <motion.div
                                                key={item.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Link
                                                    to={item.href}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
                                                        ? 'bg-brand-gold text-white shadow-lg'
                                                        : 'text-white hover:bg-white/10'
                                                        }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <span className="font-medium">{item.name}</span>
                                                </Link>
                                            </motion.div>
                                        )
                                    })}
                                </nav>

                                {/* Logout Button */}
                                <div className="px-4 py-4 pb-16 border-t border-white/10">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-200"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">Logout</span>
                                    </button>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>


            {/* Main Content */}
            <div className="md:pl-64">
                <main className="pt-16 md:pt-0 pb-16">
                    {children}
                </main>

                {/* Footer */}
                <footer className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-200 py-3 z-[60]">
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold text-brand-teal uppercase tracking-tight">Glowing Fortune Gaming OPC</span> v1.0
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default Layout
