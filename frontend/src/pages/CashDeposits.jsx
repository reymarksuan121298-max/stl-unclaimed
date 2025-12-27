import { useEffect, useState } from 'react'
import { Wallet, Search, Filter, Upload, Image as ImageIcon, X, Check, DollarSign } from 'lucide-react'
import { dataHelpers } from '../lib/supabase'
import { hasPermission, PERMISSIONS } from '../utils/permissions'

function CashDeposits({ user }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterFranchise, setFilterFranchise] = useState('')
    const [filterArea, setFilterArea] = useState('')
    const [showDepositModal, setShowDepositModal] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [showReceiptModal, setShowReceiptModal] = useState(false)
    const [receiptImageUrl, setReceiptImageUrl] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [depositFormData, setDepositFormData] = useState({
        deposit_amount: '',
        total_charges: '',
        bank_name: '',
        deposit_reference: '',
        deposit_receipt_file: null
    })

    useEffect(() => {
        loadPendingDeposits()
    }, [filterFranchise, filterArea])

    useEffect(() => {
        setCurrentPage(1) // Reset to first page when search/filter changes
    }, [searchTerm, filterFranchise, filterArea])

    const loadPendingDeposits = async () => {
        try {
            setLoading(true)
            const filters = {}
            if (filterFranchise) filters.franchise_name = filterFranchise
            if (filterArea) filters.area = filterArea

            // Get ALL cash collections (both pending and deposited)
            const allUnclaimed = await dataHelpers.getUnclaimed()

            // Filter for cash mode items that are collected
            const cashItems = allUnclaimed.filter(item =>
                item.mode === 'Cash' &&
                (item.status === 'Collected' || item.status === 'Uncollected')
            )

            // Apply franchise and area filters if set
            let filteredData = cashItems
            if (filterFranchise) {
                filteredData = filteredData.filter(item => item.franchise_name === filterFranchise)
            }
            if (filterArea) {
                filteredData = filteredData.filter(item => item.area === filterArea)
            }

            setItems(filteredData)
        } catch (error) {
            console.error('Error loading deposits:', error)
            alert('Error loading deposits')
        } finally {
            setLoading(false)
        }
    }

    const handleDepositSubmit = async (e) => {
        e.preventDefault()
        if (!selectedItem) return

        try {
            setLoading(true)

            // Upload deposit receipt if provided
            let depositReceiptUrl = null
            if (depositFormData.deposit_receipt_file) {
                depositReceiptUrl = await dataHelpers.uploadDepositReceipt(depositFormData.deposit_receipt_file)
            }

            const depositData = {
                deposit_amount: depositFormData.deposit_amount,
                bank_name: depositFormData.bank_name,
                deposit_reference: depositFormData.deposit_reference,
                deposit_receipt: depositReceiptUrl
            }

            // Check if this is a batch deposit (all items)
            if (selectedItem === 'ALL') {
                // Deposit only pending items (not already deposited)
                const itemsToDeposit = filteredItems.filter(item => !item.cash_deposited)

                // Calculate charge per item (divide total charges equally)
                const totalCharges = parseFloat(depositFormData.total_charges) || 0
                const chargePerItem = itemsToDeposit.length > 0 ? totalCharges / itemsToDeposit.length : 0

                // Update each item with deposit info AND charge amount
                const depositPromises = itemsToDeposit.map(async (item) => {
                    // First update the charge_amount for this item
                    await dataHelpers.updateUnclaimed(item.id, {
                        charge_amount: chargePerItem
                    })

                    // Then record the deposit
                    return dataHelpers.depositCash(item.id, depositData, user.fullname)
                })

                await Promise.all(depositPromises)
                alert(`Successfully deposited ${itemsToDeposit.length} items totaling ₱${depositFormData.deposit_amount}!\n\nCharges: ₱${totalCharges.toFixed(2)} (₱${chargePerItem.toFixed(2)} per item)`)
            } else {
                // Single item deposit
                await dataHelpers.depositCash(selectedItem.id, depositData, user.fullname)
                alert('Cash deposit recorded successfully!')
            }

            setShowDepositModal(false)
            setSelectedItem(null)
            loadPendingDeposits()
        } catch (error) {
            console.error('Error recording deposit:', error)
            const errorMsg = error.message || error.error_description || error.details || 'Check your internet connection or try again.'
            alert('Error recording deposit: ' + errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyDeposit = async (item) => {
        if (!confirm(`Verify and mark this deposit as collected?\n\nAgent: ${item.teller_name}\nBet #: ${item.bet_number}\nAmount: ₱${parseFloat(item.net || item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`)) return

        try {
            setLoading(true)
            await dataHelpers.verifyDeposit(item.id, user.fullname)
            setShowReceiptModal(false)
            setSelectedItem(null)
            loadPendingDeposits()
            alert('Deposit verified and marked as collected!')
        } catch (error) {
            console.error('Error verifying deposit:', error)
            const errorMsg = error.message || error.error_description || error.details || 'Check your internet connection or try again.'
            alert('Error verifying deposit: ' + errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const filteredItems = items.filter(item =>
        item.teller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.bet_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.collector?.toLowerCase().includes(searchTerm.toLowerCase())
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
    const banks = ['BDO', 'BPI', 'Metrobank', 'Landbank', 'PNB', 'UnionBank', 'Security Bank', 'RCBC']

    if (loading && items.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading pending deposits...</p>
                </div>
            </div>
        )
    }

    // Calculate totals for pending and deposited items
    const pendingItems = filteredItems.filter(item => !item.cash_deposited)
    const depositedItems = filteredItems.filter(item => item.cash_deposited)
    const totalPendingAmount = pendingItems.reduce((sum, item) => sum + parseFloat(item.net || item.win_amount || 0), 0)
    const totalDepositedAmount = depositedItems.reduce((sum, item) => sum + parseFloat(item.net || item.win_amount || 0), 0)

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Wallet className="w-8 h-8 text-emerald-600" />
                    Cash Deposits
                </h1>
                <p className="text-gray-600 mt-1">Manage cash collections and bank deposits</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Deposits Card */}
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-orange-100 text-sm mb-1">Pending Deposits</p>
                            <p className="text-4xl font-bold">
                                ₱{totalPendingAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-orange-100 text-sm mt-2">{pendingItems.length} items awaiting deposit</p>
                            {pendingItems.length > 0 && (
                                <button
                                    onClick={() => {
                                        const totalWinAmount = pendingItems.reduce((sum, item) => sum + parseFloat(item.win_amount || 0), 0)
                                        setSelectedItem('ALL')
                                        setDepositFormData({
                                            deposit_amount: totalWinAmount.toFixed(2),
                                            total_charges: '0',
                                            bank_name: '',
                                            deposit_reference: '',
                                            deposit_receipt_file: null
                                        })
                                        setShowDepositModal(true)
                                    }}
                                    className="mt-4 px-6 py-2.5 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                >
                                    <Upload className="w-5 h-5" />
                                    Deposit All Cash (₱{totalPendingAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })})
                                </button>
                            )}
                        </div>
                        <DollarSign className="w-20 h-20 text-orange-200 opacity-50" />
                    </div>
                </div>

                {/* Deposited Card */}
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-emerald-100 text-sm mb-1">Already Deposited</p>
                            <p className="text-4xl font-bold">
                                ₱{totalDepositedAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-emerald-100 text-sm mt-2">{depositedItems.length} items deposited</p>
                        </div>
                        <Check className="w-20 h-20 text-emerald-200 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <label htmlFor="deposits-search" className="sr-only">Search items</label>
                        <input
                            id="deposits-search"
                            name="search"
                            type="text"
                            placeholder="Search by name or bet number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <label htmlFor="deposits-franchise-filter" className="sr-only">Filter by franchise</label>
                        <select
                            id="deposits-franchise-filter"
                            name="franchise"
                            value={filterFranchise}
                            onChange={(e) => setFilterFranchise(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                        >
                            <option value="">All Franchises</option>
                            {franchises.map(franchise => (
                                <option key={franchise} value={franchise}>{franchise}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <label htmlFor="deposits-area-filter" className="sr-only">Filter by area</label>
                        <select
                            id="deposits-area-filter"
                            name="area"
                            value={filterArea}
                            onChange={(e) => setFilterArea(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                        >
                            <option value="">All Areas</option>
                            {[...new Set(items.map(i => i.area).filter(Boolean))].sort().map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-emerald-50 to-green-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Agent Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Bet Number</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Draw Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Collected Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Win Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Net Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Collector</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Area</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="px-6 py-12 text-center">
                                        <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No pending cash deposits found</p>
                                        <p className="text-gray-400 text-sm mt-1">All cash collections have been deposited</p>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-medium text-gray-900 text-xs">{item.teller_name}</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{item.bet_number || 'N/A'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                                            {new Date(item.draw_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                                            {item.return_date ? new Date(item.return_date).toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="font-semibold text-blue-600 text-xs">
                                                ₱{parseFloat(item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="font-bold text-emerald-600 text-xs">
                                                ₱{parseFloat(item.net || item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{item.collector || 'N/A'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{item.area || 'N/A'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.cash_deposited
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                {item.cash_deposited ? 'Deposited' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {item.deposit_receipt ? (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedItem(item)
                                                            setReceiptImageUrl(item.deposit_receipt)
                                                            setShowReceiptModal(true)
                                                        }}
                                                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors title='View Receipt'"
                                                    >
                                                        <ImageIcon className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedItem(item)
                                                            setShowDepositModal(true)
                                                        }}
                                                        className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors title='Deposit'"
                                                        disabled={user.role === 'admin' || user.role === 'specialist'}
                                                    >
                                                        <Upload className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {(user.role === 'admin' || user.role === 'specialist') && item.status === 'Uncollected' && (
                                                    <button
                                                        onClick={() => handleVerifyDeposit(item)}
                                                        className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors title='Verify and Mark as Collected'"
                                                    >
                                                        <Check className="w-4 h-4" />
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
                                                    ? 'bg-emerald-600 text-white'
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

            {/* Deposit Modal */}
            {showDepositModal && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white flex items-center justify-between sticky top-0 z-10">
                            <h2 className="text-xl font-bold">
                                {selectedItem === 'ALL' ? 'Deposit All Cash Collections' : 'Record Cash Deposit'}
                            </h2>
                            <button onClick={() => setShowDepositModal(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleDepositSubmit} className="p-6 space-y-4">
                            {/* Item Details */}
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
                                {selectedItem === 'ALL' ? (
                                    <>
                                        <h3 className="font-semibold text-emerald-900">Batch Deposit Summary</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div><span className="text-gray-600">Total Items:</span> <span className="font-bold text-emerald-700">{pendingItems.length}</span></div>
                                            <div><span className="text-gray-600">Total Amount:</span> <span className="font-bold text-blue-600">₱{pendingItems.reduce((sum, item) => sum + parseFloat(item.win_amount || 0), 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></div>
                                            <div><span className="text-gray-600">Total Charges:</span> <span className="font-bold text-red-600">₱{(parseFloat(depositFormData.total_charges) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></div>
                                            <div><span className="text-gray-600">Net Amount:</span> <span className="font-bold text-emerald-700">₱{(parseFloat(depositFormData.deposit_amount) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></div>
                                        </div>
                                        <div className="mt-3 p-3 bg-white rounded-lg border border-emerald-200">
                                            <p className="text-xs text-gray-600 mb-2 font-semibold">Items included in this deposit:</p>
                                            <div className="max-h-32 overflow-y-auto space-y-1">
                                                {pendingItems.map((item, index) => (
                                                    <div key={item.id} className="text-xs text-gray-700 flex justify-between">
                                                        <span>{index + 1}. {item.teller_name || 'N/A'} ({item.bet_number})</span>
                                                        <span className="font-semibold text-emerald-600">₱{parseFloat(item.net || item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="font-semibold text-emerald-900">Collection Details</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div><span className="text-gray-600">Agent:</span> <span className="font-medium">{selectedItem.teller_name}</span></div>
                                            <div><span className="text-gray-600">Bet #:</span> <span className="font-medium">{selectedItem.bet_number}</span></div>
                                            <div><span className="text-gray-600">Collector:</span> <span className="font-medium">{selectedItem.collector}</span></div>
                                            <div><span className="text-gray-600">Area:</span> <span className="font-medium">{selectedItem.area}</span></div>
                                            <div><span className="text-gray-600">Win Amount:</span> <span className="font-semibold text-blue-600">₱{parseFloat(selectedItem.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></div>
                                            <div><span className="text-gray-600">Net Amount:</span> <span className="font-bold text-emerald-600">₱{parseFloat(selectedItem.net || selectedItem.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span></div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Deposit Form */}
                            <div className="space-y-4">
                                {selectedItem === 'ALL' && (
                                    <div className="space-y-1">
                                        <label htmlFor="total-charges" className="text-sm font-semibold text-gray-700">Total Charges</label>
                                        <input
                                            id="total-charges"
                                            name="total_charges"
                                            type="number"
                                            step="0.01"
                                            value={depositFormData.total_charges}
                                            onChange={(e) => {
                                                const charges = parseFloat(e.target.value) || 0
                                                const totalWinAmount = pendingItems.reduce((sum, item) => sum + parseFloat(item.win_amount || 0), 0)
                                                const netAmount = totalWinAmount - charges
                                                setDepositFormData({
                                                    ...depositFormData,
                                                    total_charges: e.target.value,
                                                    deposit_amount: netAmount.toFixed(2)
                                                })
                                            }}
                                            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all bg-gray-50"
                                            placeholder="0.00"
                                        />
                                        <p className="text-xs text-gray-500">Enter total charges to auto-calculate net deposit amount</p>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label htmlFor="deposit-amount" className="text-sm font-semibold text-gray-700">
                                        {selectedItem === 'ALL' ? 'Deposit Amount (Net) *' : 'Deposit Amount *'}
                                    </label>
                                    <input
                                        id="deposit-amount"
                                        name="deposit_amount"
                                        type="number"
                                        step="0.01"
                                        required
                                        value={depositFormData.deposit_amount}
                                        onChange={(e) => setDepositFormData({ ...depositFormData, deposit_amount: e.target.value })}
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-gray-50"
                                        placeholder="0.00"
                                        readOnly={selectedItem === 'ALL'}
                                    />
                                    {selectedItem === 'ALL' && (
                                        <p className="text-xs text-gray-500">Auto-calculated: Total Amount - Total Charges</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="bank-name" className="text-sm font-semibold text-gray-700">Bank Name *</label>
                                    <select
                                        id="bank-name"
                                        name="bank_name"
                                        required
                                        value={depositFormData.bank_name}
                                        onChange={(e) => setDepositFormData({ ...depositFormData, bank_name: e.target.value })}
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-gray-50"
                                    >
                                        <option value="">Select Bank</option>
                                        {banks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="deposit-reference" className="text-sm font-semibold text-gray-700">Deposit Reference Number *</label>
                                    <input
                                        id="deposit-reference"
                                        name="deposit_reference"
                                        type="text"
                                        required
                                        value={depositFormData.deposit_reference}
                                        onChange={(e) => setDepositFormData({ ...depositFormData, deposit_reference: e.target.value })}
                                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-gray-50"
                                        placeholder="Enter deposit reference number"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="deposit-receipt" className="text-sm font-semibold text-gray-700">Deposit Receipt (Optional)</label>
                                    <div className="flex items-center gap-2">
                                        <label
                                            htmlFor="deposit-receipt"
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm bg-gradient-to-r from-blue-50 to-emerald-50 border-2 border-dashed border-emerald-300 rounded-lg cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                                        >
                                            <Upload className="w-5 h-5 text-emerald-600" />
                                            <span className="text-emerald-700 font-medium">
                                                {depositFormData.deposit_receipt_file ? depositFormData.deposit_receipt_file.name : 'Upload deposit receipt'}
                                            </span>
                                        </label>
                                        <input
                                            id="deposit-receipt"
                                            name="deposit_receipt"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    setDepositFormData({ ...depositFormData, deposit_receipt_file: file })
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">Upload a photo of the bank deposit receipt</p>
                                </div>
                            </div>

                            <div className="pt-3 flex gap-3">
                                <button type="button" onClick={() => setShowDepositModal(false)} className="flex-1 px-4 py-2 text-sm border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    <Check className="w-4 h-4 inline mr-1" />
                                    Confirm Deposit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Receipt Modal */}
            {showReceiptModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between flex-shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ImageIcon className="w-6 h-6" />
                                Deposit Receipt
                            </h2>
                            <button onClick={() => setShowReceiptModal(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            <div className="bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center border border-gray-200 shadow-inner">
                                {receiptImageUrl ? (
                                    <img
                                        src={receiptImageUrl}
                                        alt="Deposit Receipt"
                                        className="max-w-full max-h-[50vh] object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/400x600?text=Image+Not+Found';
                                        }}
                                    />
                                ) : (
                                    <div className="text-center p-8 text-gray-400">
                                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                        <p>No receipt image available</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Bank</p>
                                        <p className="font-semibold text-gray-800">{selectedItem?.bank_name || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Reference #</p>
                                        <p className="font-semibold text-gray-800">{selectedItem?.deposit_reference || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <p className="text-xs text-emerald-600 mb-1">Total Net Amount</p>
                                    <p className="text-xl font-bold text-emerald-700">
                                        ₱{parseFloat(selectedItem?.net || selectedItem?.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all text-sm shadow-sm"
                            >
                                Close
                            </button>
                            {(user.role === 'admin' || user.role === 'specialist') && selectedItem?.status === 'Uncollected' && (
                                <button
                                    onClick={() => handleVerifyDeposit(selectedItem)}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-sm shadow-emerald-200 flex items-center justify-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    Mark as Collected
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CashDeposits
