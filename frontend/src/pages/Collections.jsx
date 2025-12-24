import { useEffect, useState } from 'react'
import { DollarSign, Search, Filter, TrendingUp } from 'lucide-react'
import { dataHelpers } from '../lib/supabase'

function Collections() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterFranchise, setFilterFranchise] = useState('')

    useEffect(() => {
        loadCollections()
    }, [filterFranchise])

    const loadCollections = async () => {
        try {
            setLoading(true)
            const filters = {}
            if (filterFranchise) filters.franchise_name = filterFranchise

            const data = await dataHelpers.getCollections(filters)
            setItems(data)
        } catch (error) {
            console.error('Error loading collections:', error)
            alert('Error loading collections')
        } finally {
            setLoading(false)
        }
    }

    const filteredItems = items.filter(item =>
        item.teller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.bet_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.collector?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const franchises = ['5A Royal Gaming OPC', 'Imperial Gnaing OPC', 'Glowing Fortune OPC']

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading collections...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    Collections
                </h1>
                <p className="text-gray-600 mt-1">All collected winnings across franchises</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, bet number, or collector..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={filterFranchise}
                            onChange={(e) => setFilterFranchise(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
                        >
                            <option value="">All Franchises</option>
                            {franchises.map(franchise => (
                                <option key={franchise} value={franchise}>{franchise}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Teller Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Bet Number</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Draw Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Return Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Charge</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Net</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Collector</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Franchise</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center">
                                        <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No collections found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{item.teller_name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.bet_number || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(item.draw_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.return_date ? new Date(item.return_date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-blue-600">
                                                ₱{parseFloat(item.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-red-600">
                                                ₱{parseFloat(item.charge_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-green-600">
                                                ₱{parseFloat(item.net || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.collector || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.franchise_name || 'N/A'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                    <p className="text-blue-100 text-sm mb-1">Total Collections</p>
                    <p className="text-3xl font-bold">{filteredItems.length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                    <p className="text-purple-100 text-sm mb-1">Total Amount</p>
                    <p className="text-2xl font-bold">
                        ₱{filteredItems.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
                    <p className="text-red-100 text-sm mb-1">Total Charges</p>
                    <p className="text-2xl font-bold">
                        ₱{filteredItems.reduce((sum, item) => sum + parseFloat(item.charge_amount || 0), 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                    <p className="text-green-100 text-sm mb-1">Total Net Revenue</p>
                    <p className="text-2xl font-bold">
                        ₱{filteredItems.reduce((sum, item) => sum + parseFloat(item.net || 0), 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Collections
