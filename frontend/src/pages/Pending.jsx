import { useEffect, useState } from 'react'
import { Clock, Search, Filter, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react'
import { dataHelpers } from '../lib/supabase'
import { googleSheetsHelpers } from '../lib/googleSheets'

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

    const handleDelete = async (item) => {
        // Validate item has proper data
        if (!item.teller_name || !item.bet_number || item.teller_name === 'Teller' || item.bet_number === 'Bet No.') {
            alert('Cannot delete invalid or header row')
            return
        }

        const confirmMessage = `Are you sure you want to remove this pending item?\n\nTeller: ${item.teller_name}\nBet Number: ${item.bet_number}\nWin Amount: ₱${parseFloat(item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}\n\nThis action cannot be undone.`

        if (!confirm(confirmMessage)) {
            return
        }

        try {
            // If item is from Google Sheets, delete from Google Sheets
            if (item.source === 'google_sheets') {
                await googleSheetsHelpers.deletePendingFromSheets(item.trans_id)
                alert('Item removed from Google Sheets successfully!')
                loadPending() // Reload the list
                return
            }

            // Delete from Supabase
            await dataHelpers.deleteUnclaimed(item.id)
            alert('Item removed successfully!')
            loadPending() // Reload the list
        } catch (error) {
            console.error('Error deleting item:', error)
            alert('Error removing item: ' + error.message)
        }
    }

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

            // Fetch from both sources in parallel
            const [supabaseData, sheetsData] = await Promise.allSettled([
                dataHelpers.getPending(filters),
                googleSheetsHelpers.getPendingFromSheets()
            ])

            // Process Supabase data
            let allItems = []
            if (supabaseData.status === 'fulfilled') {
                allItems = [...supabaseData.value]
            } else {
                console.error('Error loading from Supabase:', supabaseData.reason)
            }

            // Process Google Sheets data
            if (sheetsData.status === 'fulfilled') {
                // Filter sheets data if needed
                let filteredSheetsData = sheetsData.value

                if (filters.collector) {
                    filteredSheetsData = filteredSheetsData.filter(
                        item => item.collector === filters.collector
                    )
                }

                // Merge with Supabase data
                allItems = [...allItems, ...filteredSheetsData]
            } else {
                console.warn('Could not load from Google Sheets:', sheetsData.reason?.message)
                // Continue with Supabase data only
            }

            setItems(allItems)
        } catch (error) {
            console.error('Error loading pending:', error)
            console.error('Error details:', error.message, error)
            alert('Error loading pending items: ' + (error.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    const filteredItems = items.filter(item => {
        const search = searchTerm.toLowerCase()
        const tellerName = (item.teller_name || '').toLowerCase()
        const betNumber = String(item.bet_number || '').toLowerCase()
        const collector = (item.collector || '').toLowerCase()

        return tellerName.includes(search) ||
            betNumber.includes(search) ||
            collector.includes(search)
    })

    // Pagination calculations - do this BEFORE grouping
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem)

    // Group ONLY the current page items by collector for admin and specialist views
    const groupedByCollector = {}
    currentItems.forEach(item => {
        const collectorName = item.collector || 'Unassigned'
        if (!groupedByCollector[collectorName]) {
            groupedByCollector[collectorName] = []
        }
        groupedByCollector[collectorName].push(item)
    })

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
                    <p className="text-gray-600 mt-1">
                        Items overdue by more than 3 days (from Supabase & Google Sheets)
                        {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'specialist') &&
                            <span className="block text-sm text-orange-600 font-medium mt-1">Grouped by Collector</span>
                        }
                    </p>
                </div>
                <button
                    onClick={loadPending}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </button>
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
                        {/* Collector Name Header Row */}
                        {user?.role?.toLowerCase() === 'collector' && user?.fullname && (
                            <thead>
                                <tr>
                                    <th colSpan="10" className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-left">
                                        <span className="text-xl font-bold text-white uppercase tracking-wide">
                                            {user.fullname}
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                        )}

                        <thead className="bg-gradient-to-r from-orange-50 to-red-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Teller Name</th>

                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Draw Time/Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Bet No.</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Bet Code</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Bet Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Win Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Collector</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Notification</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="px-6 py-12 text-center">
                                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No pending items found</p>
                                    </td>
                                </tr>
                            ) : (
                                // For admin and specialist: group by collector
                                (user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'specialist') ? (
                                    Object.keys(groupedByCollector).sort().map(collectorName => {
                                        const collectorItems = groupedByCollector[collectorName]

                                        return (
                                            <>
                                                {/* Collector Header Row */}
                                                <tr key={`header-${collectorName}`}>
                                                    <td colSpan="10" className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xl font-bold text-white uppercase tracking-wide">
                                                                {collectorName}
                                                            </span>
                                                            <span className="text-sm text-white bg-white/20 px-3 py-1 rounded-full">
                                                                {groupedByCollector[collectorName].length} item(s)
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {/* Collector Items */}
                                                {collectorItems.map((item) => {
                                                    const category = getOverdueCategory(item.days_overdue || 0)
                                                    const isOverdue = item.days_overdue >= 3
                                                    return (
                                                        <tr key={item.id} className={`transition-colors ${isOverdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                                                            <td className="px-6 py-4">
                                                                <div className="font-medium text-gray-900">{item.teller_name}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                                {item.draw_date || 'N/A'}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">{item.bet_number || 'N/A'}</td>
                                                            <td className="px-6 py-4">
                                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                                                    {item.bet_code || 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                                ₱{parseFloat(item.bet_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="font-semibold text-green-600">
                                                                    ₱{parseFloat(item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">{item.collector || 'N/A'}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${item.days_overdue >= 3 ? 'bg-red-600 text-white' :
                                                                    item.days_overdue >= 2 ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                    {item.days_overdue >= 3 ? 'Overdue' : item.days_overdue >= 2 ? 'Verifying' : 'Pending'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {item.days_overdue >= 3 ? (
                                                                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold animate-pulse">
                                                                        For Deactivation
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                                                                        Warning ({item.days_overdue} days)
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <button
                                                                    onClick={() => handleDelete(item)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Remove (Returned to Cashier)"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </>
                                        )
                                    })
                                ) : (
                                    // For collector role: show items without grouping (already filtered by their name)
                                    currentItems.map((item) => {
                                        const category = getOverdueCategory(item.days_overdue || 0)
                                        const isOverdue = item.days_overdue >= 3
                                        return (
                                            <tr key={item.id} className={`transition-colors ${isOverdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{item.teller_name}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {item.draw_date || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.bet_number || 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                                        {item.bet_code || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    ₱{parseFloat(item.bet_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-green-600">
                                                        ₱{parseFloat(item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.collector || 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${item.days_overdue >= 3 ? 'bg-red-600 text-white' :
                                                        item.days_overdue >= 2 ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {item.days_overdue >= 3 ? 'Overdue' : item.days_overdue >= 2 ? 'Verifying' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.days_overdue >= 3 ? (
                                                        <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold animate-pulse">
                                                            For Deactivation
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                                                            Warning ({item.days_overdue} days)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remove (Returned to Cashier)"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )
                            )}
                        </tbody>
                    </table>
                </div >

                {/* Pagination */}
                {
                    totalPages > 1 && (
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
                    )
                }
            </div >

            {/* Summary Stats */}
            < div className="grid grid-cols-1 md:grid-cols-4 gap-6" >
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
            </div >
        </div >
    )
}

export default Pending
