import { useEffect, useState } from 'react'
import { Package, Clock, DollarSign, FileText, TrendingUp, Users, AlertTriangle } from 'lucide-react'
import { dataHelpers } from '../lib/supabase'
import { googleSheetsHelpers } from '../lib/googleSheets'

function Dashboard({ user }) {
    const [stats, setStats] = useState({
        totalUnclaimed: 0,
        totalPending: 0,
        totalPendingFromSheets: 0,
        totalCollections: 0,
        totalRevenue: 0,
        totalReports: 0
    })
    const [loading, setLoading] = useState(true)
    const [recentUnclaimed, setRecentUnclaimed] = useState([])
    const [recentPending, setRecentPending] = useState([])

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch from both Supabase and Google Sheets in parallel
            const [dashboardStats, unclaimed, pendingFromSupabase, pendingFromSheets] = await Promise.allSettled([
                dataHelpers.getDashboardStats(user),
                // Fetch all unclaimed items with status 'Unclaimed' or 'Uncollected'
                // This includes items created by cashiers and items awaiting verification
                dataHelpers.getUnclaimed({ status: ['Unclaimed', 'Uncollected'] }),
                dataHelpers.getPending({}),
                googleSheetsHelpers.getPendingFromSheets()
            ])

            // Process Supabase stats
            if (dashboardStats.status === 'fulfilled') {
                setStats(prev => ({ ...prev, ...dashboardStats.value }))
            }

            // Process unclaimed items - show most recent 5
            if (unclaimed.status === 'fulfilled') {
                setRecentUnclaimed(unclaimed.value.slice(0, 5))
            }

            // Process pending items from both sources
            let allPendingItems = []

            if (pendingFromSupabase.status === 'fulfilled') {
                allPendingItems = [...pendingFromSupabase.value]
            }

            if (pendingFromSheets.status === 'fulfilled') {
                const sheetsData = pendingFromSheets.value
                setStats(prev => ({ ...prev, totalPendingFromSheets: sheetsData.length }))
                allPendingItems = [...allPendingItems, ...sheetsData]
            } else {
                console.warn('Could not load pending from Google Sheets:', pendingFromSheets.reason?.message)
            }

            // Sort by days overdue (descending) and take top 5
            allPendingItems.sort((a, b) => (b.days_overdue || 0) - (a.days_overdue || 0))
            setRecentPending(allPendingItems.slice(0, 5))

        } catch (error) {
            console.error('Error loading dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        {
            name: 'Total Unclaimed',
            value: stats.totalUnclaimed,
            icon: Package,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            name: 'Pending Items',
            value: stats.totalPendingFromSheets,
            icon: Clock,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600'
        },
        {
            name: 'Collections',
            value: stats.totalCollections,
            icon: DollarSign,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            name: 'Total Revenue',
            value: `₱${stats.totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
            icon: TrendingUp,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
        }
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {user?.fullname || 'User'}!</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div
                            key={stat.name}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                                    </div>
                                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${stat.color} text-white text-xs font-semibold`}>
                                        Live
                                    </div>
                                </div>
                                <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.name}</h3>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
                        </div>
                    )
                })}
            </div>

            {/* Recent Unclaimed Items */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h2 className="text-xl font-bold text-gray-900">Recent Unclaimed Items</h2>
                    <p className="text-sm text-gray-600 mt-1">Latest unclaimed winnings</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Teller Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Bet Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Draw Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Win Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Franchise
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recentUnclaimed.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No unclaimed items found
                                    </td>
                                </tr>
                            ) : (
                                recentUnclaimed.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{item.teller_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {item.bet_number || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(item.draw_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-green-600">
                                                ₱{parseFloat(item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {item.franchise_name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Pending Items (from Google Sheets & Supabase) */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                                Recent Pending Items
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">Top 5 most overdue items (from all sources)</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                Database
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                Google Sheets
                            </span>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Source
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Teller Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Bet Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Draw Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Win Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Collector
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Days Overdue
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recentPending.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p>No pending items found</p>
                                    </td>
                                </tr>
                            ) : (
                                recentPending.map((item, index) => (
                                    <tr
                                        key={`${item.source}-${item.id}-${index}`}
                                        className={`hover:bg-gray-50 transition-colors ${item.days_overdue >= 7 ? 'bg-red-50' :
                                            item.days_overdue >= 5 ? 'bg-orange-50' : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.source === 'google_sheets'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {item.source === 'google_sheets' ? 'Sheets' : 'DB'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{item.teller_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {item.bet_number || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {item.draw_date || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-green-600">
                                                ₱{parseFloat(item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {item.collector || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.days_overdue >= 7 ? 'bg-red-600 text-white animate-pulse' :
                                                item.days_overdue >= 5 ? 'bg-orange-500 text-white' :
                                                    item.days_overdue >= 3 ? 'bg-yellow-500 text-white' :
                                                        'bg-gray-200 text-gray-700'
                                                }`}>
                                                {item.days_overdue} days
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
