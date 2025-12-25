import { useEffect, useState } from 'react'
import { Clock, Search, Filter, AlertTriangle } from 'lucide-react'
import { dataHelpers } from '../lib/supabase'

function Pending({ user }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterFranchise, setFilterFranchise] = useState('')
    const [filterCollector, setFilterCollector] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    useEffect(() => {
        loadPending()
    }, [filterFranchise, filterCollector, user])

    useEffect(() => {
        setCurrentPage(1) // Reset to first page when search/filter changes
    }, [searchTerm, filterFranchise, filterCollector])

    const loadPending = async () => {
        try {
            setLoading(true)
            const filters = {}
            if (filterFranchise) filters.franchise_name = filterFranchise
            if (filterCollector) filters.collector = filterCollector

            // Auto-filter by collector's fullname if user is a collector
            if (user?.role?.toLowerCase() === 'collector' && user?.fullname) {
                filters.collector = user.fullname
            }

            const data = await dataHelpers.getPending(filters)
            setItems(data)
        } catch (error) {
            console.error('Error loading pending:', error)
            console.error('Error details:', error.message, error)
            alert('Error loading pending items: ' + (error.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    const filteredItems = items.filter(item =>
        item.teller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.bet_number?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination calculations
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem)

    const paginate = (pageNumber) => setCurrentPage(pageNumber)
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

    const franchises = ['5A Royal Gaming OPC', 'Imperial Gnaing OPC', 'Glowing Fortune OPC']
    const collectors = [...new Set(items.map(i => i.collector).filter(Boolean))].sort()

    const getOverdueCategory = (days) => {
        if (days <= 7) return { label: 'Recently Overdue', color: 'bg-yellow-100 text-yellow-800' }
        if (days <= 30) return { label: 'Moderately Overdue', color: 'bg-orange-100 text-orange-800' }
        return { label: 'Severely Overdue', color: 'bg-red-100 text-red-800' }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading pending items...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Clock className="w-8 h-8 text-orange-600" />
                        Pending Items
                    </h1>
                    <p className="text-gray-600 mt-1">Items overdue by more than 3 days</p>
                </div>
            </div>

            {/* Alert Banner */}
            {filteredItems.length > 0 && (
                <div className="bg-orange-50 border-l-4 border-orange-500 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-orange-900">Attention Required</h3>
                        <p className="text-sm text-orange-700 mt-1">
                            You have {filteredItems.length} pending item(s) that require immediate attention.
                        </p>
                    </div>
                </div>
            )}

            {/* Filters */}
            {user?.role?.toLowerCase() !== 'collector' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <label htmlFor="pending-search" className="sr-only">Search items</label>
                            <input
                                id="pending-search"
                                name="search"
                                type="text"
                                placeholder="Search by name or bet number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <label htmlFor="pending-franchise-filter" className="sr-only">Filter by franchise</label>
                            <select
                                id="pending-franchise-filter"
                                name="franchise"
                                value={filterFranchise}
                                onChange={(e) => setFilterFranchise(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
                            >
                                <option value="">All Franchises</option>
                                {franchises.map(franchise => (
                                    <option key={franchise} value={franchise}>{franchise}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <label htmlFor="pending-collector-filter" className="sr-only">Filter by collector</label>
                            <select
                                id="pending-collector-filter"
                                name="collector"
                                value={filterCollector}
                                onChange={(e) => setFilterCollector(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
                            >
                                <option value="">All Collectors</option>
                                {collectors.map(collector => (
                                    <option key={collector} value={collector}>{collector}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-orange-50 to-red-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Agent Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Bet Number</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Draw Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Return Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Days Overdue</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Win Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Franchise</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Collector</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center">
                                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No pending items found</p>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((item) => {
                                    const category = getOverdueCategory(item.days_overdue || 0)
                                    return (
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
                                                <span className="font-bold text-red-600 text-lg">
                                                    {item.days_overdue || 0} days
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-green-600">
                                                    ₱{parseFloat(item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.franchise_name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.collector || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${category.color}`}>
                                                    {category.label}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} items
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Previous
                            </button>

                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNumber = index + 1
                                    // Show first page, last page, current page, and pages around current
                                    if (
                                        pageNumber === 1 ||
                                        pageNumber === totalPages ||
                                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => paginate(pageNumber)}
                                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${currentPage === pageNumber
                                                    ? 'bg-orange-600 text-white'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        )
                                    } else if (
                                        pageNumber === currentPage - 2 ||
                                        pageNumber === currentPage + 2
                                    ) {
                                        return <span key={pageNumber} className="px-2 text-gray-400">...</span>
                                    }
                                    return null
                                })}
                            </div>

                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white">
                    <p className="text-yellow-100 text-sm mb-1">Recently Overdue</p>
                    <p className="text-3xl font-bold">
                        {filteredItems.filter(i => (i.days_overdue || 0) <= 7).length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
                    <p className="text-orange-100 text-sm mb-1">Moderately Overdue</p>
                    <p className="text-3xl font-bold">
                        {filteredItems.filter(i => (i.days_overdue || 0) > 7 && (i.days_overdue || 0) <= 30).length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
                    <p className="text-red-100 text-sm mb-1">Severely Overdue</p>
                    <p className="text-3xl font-bold">
                        {filteredItems.filter(i => (i.days_overdue || 0) > 30).length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                    <p className="text-purple-100 text-sm mb-1">Total Value</p>
                    <p className="text-2xl font-bold">
                        ₱{filteredItems.reduce((sum, item) => sum + parseFloat(item.win_amount || 0), 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Pending
