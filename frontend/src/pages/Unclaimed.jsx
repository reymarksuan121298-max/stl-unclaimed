import { useEffect, useState } from 'react'
import { Package, Search, Plus, Trash2, Check, Filter, X, Edit } from 'lucide-react'
import { dataHelpers } from '../lib/supabase'
import { hasPermission, PERMISSIONS, canPerformAction } from '../utils/permissions'

function Unclaimed({ user }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterFranchise, setFilterFranchise] = useState('')
    const [filterArea, setFilterArea] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [formData, setFormData] = useState({
        teller_name: '',
        bet_number: '',
        draw_date: '',
        win_amount: '',
        charge_amount: '',
        mode: 'Cash',
        payment_type: 'Full Payment',
        franchise_name: '5A Royal Gaming OPC',
        area: '',
        collector: '',
        return_date: ''
    })

    useEffect(() => {
        loadUnclaimed()
    }, [filterFranchise, filterArea])

    useEffect(() => {
        setCurrentPage(1) // Reset to first page when search/filter changes
    }, [searchTerm, filterFranchise, filterArea])

    const loadUnclaimed = async () => {
        try {
            setLoading(true)
            const filters = {}
            if (filterFranchise) filters.franchise_name = filterFranchise
            if (filterArea) filters.area = filterArea

            // If user is a collector, only fetch their items
            if (user?.role?.toLowerCase() === 'collector') {
                filters.collector = user.fullname
            }

            const data = await dataHelpers.getUnclaimed(filters)
            setItems(data)
        } catch (error) {
            console.error('Error loading unclaimed:', error)
            alert('Error loading unclaimed')
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsCollected = async (id) => {
        if (!confirm('Mark this item as collected? This will also generate a report.')) return
        try {
            setLoading(true)
            await dataHelpers.markAsCollected(id, user.fullname)
            loadUnclaimed()
            alert('Item marked as collected!')
        } catch (error) {
            console.error('Error updating item:', error)
            alert('Error updating item')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return

        try {
            setLoading(true)
            await dataHelpers.deleteUnclaimed(id)
            loadUnclaimed()
            alert('Item deleted successfully!')
        } catch (error) {
            console.error('Error deleting item:', error)
            alert('Error deleting item')
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item)
            // Format ISO date to YYYY-MM-DDTHH:mm for datetime-local input
            const formattedReturnDate = item.return_date
                ? new Date(item.return_date).toISOString().slice(0, 16)
                : ''

            setFormData({
                teller_name: item.teller_name,
                bet_number: item.bet_number,
                draw_date: item.draw_date,
                win_amount: item.win_amount,
                charge_amount: item.charge_amount || '',
                mode: item.mode || 'Cash',
                payment_type: item.payment_type || 'Full Payment',
                franchise_name: item.franchise_name,
                area: item.area || '',
                collector: item.collector || (user?.role?.toLowerCase() === 'collector' ? user.fullname : ''),
                return_date: formattedReturnDate
            })
        } else {
            setEditingItem(null)
            setFormData({
                teller_name: '',
                bet_number: '',
                draw_date: '',
                win_amount: '',
                charge_amount: '',
                mode: 'Cash',
                payment_type: 'Full Payment',
                franchise_name: '5A Royal Gaming OPC',
                area: '',
                collector: user?.role?.toLowerCase() === 'collector' ? user.fullname : '',
                return_date: ''
            })
        }
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const winAmountTotal = parseFloat(formData.win_amount || 0)
            const chargeAmountTotal = parseFloat(formData.charge_amount || 0)
            const netAmountTotal = winAmountTotal - chargeAmountTotal

            const payload = {
                ...formData,
                win_amount: winAmountTotal,
                charge_amount: chargeAmountTotal,
                net: netAmountTotal,
                status: editingItem ? editingItem.status : 'Unclaimed',
                return_date: formData.return_date || null,
                // Automatically set collector if user is a collector
                collector: user?.role?.toLowerCase() === 'collector' ? user.fullname : formData.collector
            }

            if (editingItem) {
                await dataHelpers.updateUnclaimed(editingItem.id, payload)
                alert('Item updated successfully!')
            } else {
                await dataHelpers.createUnclaimed(payload)
                alert('Item added successfully!')
            }
            setShowModal(false)
            loadUnclaimed()
        } catch (error) {
            console.error('Error saving item:', error)
            alert('Error saving item: ' + error.message)
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
    const areas = ['BAROY', 'KAPATAGAN', 'KOLAMBOGAN', 'LALA', 'MAIGO', 'SALVADOR', 'SAPAD', 'SND', 'TUBOD']

    if (loading && items.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading unclaimed items...</p>
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
                        <Package className="w-8 h-8 text-indigo-600" />
                        Unclaimed Items
                    </h1>
                    <p className="text-gray-600 mt-1">Manage all unclaimed winnings</p>
                </div>
                {hasPermission(user, PERMISSIONS.CREATE_UNCLAIMED) && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                    >
                        <Plus className="w-5 h-5" />
                        Add Unclaimed Item
                    </button>
                )}
            </div>

            {/* Filters */}
            {user?.role?.toLowerCase() !== 'collector' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <label htmlFor="unclaimed-search" className="sr-only">Search items</label>
                            <input
                                id="unclaimed-search"
                                name="search"
                                type="text"
                                placeholder="Search by name or bet number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <label htmlFor="unclaimed-franchise-filter" className="sr-only">Filter by franchise</label>
                            <select
                                id="unclaimed-franchise-filter"
                                name="franchise"
                                value={filterFranchise}
                                onChange={(e) => setFilterFranchise(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                            >
                                <option value="">All Franchises</option>
                                {franchises.map(franchise => (
                                    <option key={franchise} value={franchise}>{franchise}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <label htmlFor="unclaimed-area-filter" className="sr-only">Filter by area</label>
                            <select
                                id="unclaimed-area-filter"
                                name="area"
                                value={filterArea}
                                onChange={(e) => setFilterArea(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                            >
                                <option value="">All Areas</option>
                                {[...new Set(items.map(i => i.area).filter(Boolean))].sort().map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Agent</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Bet #</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Draw Date</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Return Timestamp</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Win Amt</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Charge</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Net</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Mode</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Payment</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Franchise</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Area</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Status</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="13" className="px-6 py-12 text-center">
                                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No unclaimed items found</p>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="font-medium text-gray-900 text-xs">{item.teller_name}</div>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{item.bet_number || 'N/A'}</td>
                                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                                            {new Date(item.draw_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                                            {item.return_date ? new Date(item.return_date).toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <span className="font-semibold text-green-600 text-xs">
                                                ₱{parseFloat(item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <span className="text-xs text-red-600">
                                                ₱{parseFloat(item.charge_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <span className="font-semibold text-indigo-600 text-xs">
                                                ₱{(parseFloat(item.net || 0) || (parseFloat(item.win_amount || 0) - parseFloat(item.charge_amount || 0))).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{item.mode || 'N/A'}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.payment_type === 'Full Payment'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                {item.payment_type === 'Full Payment' ? 'Full' : 'Partial'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{item.franchise_name || 'N/A'}</td>
                                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{item.area || 'N/A'}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'Unclaimed'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : item.status === 'Collected'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                {item.status === 'Unclaimed' && hasPermission(user, PERMISSIONS.MARK_AS_COLLECTED) && (
                                                    <button
                                                        onClick={() => handleMarkAsCollected(item.id)}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Mark as Collected"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {canPerformAction(user, PERMISSIONS.UPDATE_UNCLAIMED, item) && (
                                                    <button
                                                        onClick={() => handleOpenModal(item)}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {hasPermission(user, PERMISSIONS.DELETE_UNCLAIMED) && (
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
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
                                                    ? 'bg-indigo-600 text-white'
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

            {/* Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between sticky top-0 z-10">
                                <h2 className="text-xl font-bold">{editingItem ? 'Edit Unclaimed Item' : 'Add Unclaimed Item'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label htmlFor="modal-agent" className="text-xs font-semibold text-gray-700">Agent Name</label>
                                        <input
                                            id="modal-agent"
                                            name="teller_name"
                                            required
                                            value={formData.teller_name}
                                            onChange={(e) => setFormData({ ...formData, teller_name: e.target.value })}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            placeholder="Enter agent name"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="modal-bet" className="text-xs font-semibold text-gray-700">Bet Number</label>
                                        <input
                                            id="modal-bet"
                                            name="bet_number"
                                            required
                                            value={formData.bet_number}
                                            onChange={(e) => setFormData({ ...formData, bet_number: e.target.value })}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            placeholder="BET-000"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="modal-draw-date" className="text-xs font-semibold text-gray-700">Draw Date</label>
                                        <input
                                            id="modal-draw-date"
                                            name="draw_date"
                                            type="date"
                                            required
                                            value={formData.draw_date}
                                            onChange={(e) => setFormData({ ...formData, draw_date: e.target.value })}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="modal-win-amount" className="text-xs font-semibold text-gray-700">Win Amount</label>
                                        <input
                                            id="modal-win-amount"
                                            name="win_amount"
                                            type="number"
                                            step="0.01"
                                            required
                                            value={formData.win_amount}
                                            onChange={(e) => setFormData({ ...formData, win_amount: e.target.value })}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="modal-charge-amount" className="text-xs font-semibold text-gray-700">Charge Amount</label>
                                        <input
                                            id="modal-charge-amount"
                                            name="charge_amount"
                                            type="number"
                                            step="0.01"
                                            value={formData.charge_amount}
                                            onChange={(e) => setFormData({ ...formData, charge_amount: e.target.value })}
                                            disabled={formData.mode === 'Cash'}
                                            className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${formData.mode === 'Cash' ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
                                            placeholder="0.00"
                                        />
                                        {formData.mode === 'Cash' && (
                                            <p className="text-xs text-gray-500">No charge for Cash mode</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-semibold text-gray-700">Net Amount (Calculated)</span>
                                        <div className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-semibold">
                                            ₱{((parseFloat(formData.win_amount || 0) - parseFloat(formData.charge_amount || 0))).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </div>
                                        <p className="text-xs text-gray-500">Win Amount - Charge Amount</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="modal-mode" className="text-xs font-semibold text-gray-700">Mode</label>
                                        <select
                                            id="modal-mode"
                                            name="mode"
                                            value={formData.mode}
                                            onChange={(e) => {
                                                const newMode = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    mode: newMode,
                                                    charge_amount: newMode === 'Cash' ? '0' : formData.charge_amount
                                                });
                                            }}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        >
                                            <option value="Cash">Cash</option>
                                            <option value="Back Transfer">Back Transfer</option>
                                            <option value="Cebuana">Cebuana</option>
                                            <option value="Gcash">Gcash</option>
                                            <option value="Palawan">Palawan</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="modal-payment-type" className="text-xs font-semibold text-gray-700">Payment Type</label>
                                        <select
                                            id="modal-payment-type"
                                            name="payment_type"
                                            value={formData.payment_type}
                                            onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        >
                                            <option value="Full Payment">Full Payment</option>
                                            <option value="Partial Payment">Partial Payment</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="modal-franchise" className="text-xs font-semibold text-gray-700">Franchise</label>
                                        <select
                                            id="modal-franchise"
                                            name="franchise_name"
                                            required
                                            value={formData.franchise_name}
                                            onChange={(e) => setFormData({ ...formData, franchise_name: e.target.value })}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        >
                                            {franchises.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="modal-area" className="text-xs font-semibold text-gray-700">Area</label>
                                        <select
                                            id="modal-area"
                                            name="area"
                                            value={formData.area}
                                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        >
                                            <option value="">Select Area</option>
                                            {areas.map(area => <option key={area} value={area}>{area}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="modal-collector" className="text-xs font-semibold text-gray-700">Collector</label>
                                        <input
                                            id="modal-collector"
                                            name="collector"
                                            type="text"
                                            value={formData.collector}
                                            onChange={(e) => setFormData({ ...formData, collector: e.target.value })}
                                            className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${user?.role?.toLowerCase() === 'collector' ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
                                            placeholder="Enter collector name"
                                            readOnly={user?.role?.toLowerCase() === 'collector'}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="modal-return-date" className="text-xs font-semibold text-gray-700">Return Date & Time</label>
                                        <input
                                            id="modal-return-date"
                                            name="return_date"
                                            type="datetime-local"
                                            value={formData.return_date}
                                            onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="pt-3 flex gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 text-sm border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-all">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        {editingItem ? 'Update Record' : 'Save Record'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default Unclaimed
