import { useEffect, useState } from 'react'
import { DollarSign, Search, Filter, TrendingUp, Image as ImageIcon, X, Download } from 'lucide-react'
import { dataHelpers } from '../lib/supabase'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

function Collections({ user }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterFranchise, setFilterFranchise] = useState('')
    const [filterCollector, setFilterCollector] = useState('')
    const [showReceiptModal, setShowReceiptModal] = useState(false)
    const [receiptImageUrl, setReceiptImageUrl] = useState('')
    const [selectedReceiptItem, setSelectedReceiptItem] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    useEffect(() => {
        loadCollections()
    }, [filterFranchise, filterCollector])

    useEffect(() => {
        setCurrentPage(1) // Reset to first page when search/filter changes
    }, [searchTerm, filterFranchise, filterCollector])

    const loadCollections = async () => {
        try {
            setLoading(true)
            const filters = {}
            if (filterFranchise) filters.franchise_name = filterFranchise
            if (filterCollector) filters.collector = filterCollector

            const data = await dataHelpers.getCollections(filters)
            setItems(data)
        } catch (error) {
            console.error('Error loading collections:', error)
            alert('Error loading collections')
        } finally {
            setLoading(false)
        }
    }

    const filteredItems = items.filter(item => {
        // Text search filter
        const matchesSearch = item.teller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.bet_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.collector?.toLowerCase().includes(searchTerm.toLowerCase())

        // Cashier role filter - only show cash transactions
        const isCashier = user?.role?.toLowerCase() === 'cashier'
        const matchesCashierFilter = !isCashier || item.mode?.toLowerCase() === 'cash'

        return matchesSearch && matchesCashierFilter
    })

    const handleExportExcel = async () => {
        if (filteredItems.length === 0) {
            alert('No data to export.')
            return
        }

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Collections')

        // Define columns
        worksheet.columns = [
            { header: 'Agent Name', key: 'teller_name', width: 20 },
            { header: 'Bet Number', key: 'bet_number', width: 15 },
            { header: 'Bet Code', key: 'bet_code', width: 10 },
            { header: 'Draw Date', key: 'draw_date', width: 15 },
            { header: 'Return Timestamp', key: 'return_date', width: 20 },
            { header: 'Bet Amt', key: 'bet_amount', width: 12 },
            { header: 'Win Amount', key: 'amount', width: 12 },
            { header: 'Charge', key: 'charge_amount', width: 12 },
            { header: 'Net Amount', key: 'net', width: 12 },
            { header: 'Payment Mode', key: 'mode', width: 15 },
            { header: 'Payment Status', key: 'payment_type', width: 15 },
            { header: 'Collector', key: 'collector', width: 15 },
            { header: 'Created By', key: 'created_by', width: 15 },
            { header: 'Area', key: 'area', width: 15 }
        ]

        // Add rows
        filteredItems.forEach(item => {
            worksheet.addRow({
                teller_name: item.teller_name,
                bet_number: item.bet_number || 'N/A',
                bet_code: item.bet_code || 'N/A',
                draw_date: new Date(item.draw_date).toLocaleDateString(),
                return_date: item.return_date ? new Date(item.return_date).toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A',
                bet_amount: parseFloat(item.bet_amount || 0),
                amount: parseFloat(item.amount || item.win_amount || 0),
                charge_amount: parseFloat(item.charge_amount || 0),
                net: parseFloat(item.net || 0),
                mode: item.mode || 'N/A',
                payment_type: item.payment_type === 'Full Payment' ? 'Full' : item.payment_type === 'Partial Payment' ? 'Partial' : 'N/A',
                collector: item.collector || 'N/A',
                created_by: item.created_by || 'N/A',
                area: item.area || 'N/A'
            })
        })

        // Bold the header row
        worksheet.getRow(1).font = { bold: true }

        // Formatting for numbers
        worksheet.getColumn('bet_amount').numFmt = '₱#,##0.00'
        worksheet.getColumn('amount').numFmt = '₱#,##0.00'
        worksheet.getColumn('charge_amount').numFmt = '₱#,##0.00'
        worksheet.getColumn('net').numFmt = '₱#,##0.00'

        // Build filename based on filters
        let filename = 'Collections_Report'
        if (filterFranchise) filename += `_${filterFranchise.replace(/\s+/g, '_')}`
        if (filterCollector) filename += `_${filterCollector.replace(/\s+/g, '_')}`
        filename += `_${new Date().toISOString().split('T')[0]}.xlsx`

        // Write and save
        const buffer = await workbook.xlsx.writeBuffer()
        saveAs(new Blob([buffer]), filename)
    }

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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        Collections
                    </h1>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transform transition-all duration-200"
                    >
                        <Download className="w-5 h-5" />
                        Export to Excel
                    </button>
                </div>
                <p className="text-gray-600 mt-1">All collected winnings across franchises</p>
            </div>

            {/* Filters */}
            {user?.role?.toLowerCase() !== 'collector' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <label htmlFor="collections-search" className="sr-only">Search items</label>
                            <input
                                id="collections-search"
                                name="search"
                                type="text"
                                placeholder="Search by name or bet number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <label htmlFor="collections-franchise-filter" className="sr-only">Filter by franchise</label>
                            <select
                                id="collections-franchise-filter"
                                name="franchise"
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

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <label htmlFor="collections-collector-filter" className="sr-only">Filter by collector</label>
                            <select
                                id="collections-collector-filter"
                                name="collector"
                                value={filterCollector}
                                onChange={(e) => setFilterCollector(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
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
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Agent Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Bet Number</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Bet Code</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Draw Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Return Timestamp</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Bet Amt</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Charge</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Net</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Mode</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Payment</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Collector</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Created By</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Area</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="14" className="px-6 py-12 text-center">
                                        <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No collections found</p>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-medium text-gray-900 text-xs">{item.teller_name}</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{item.bet_number || 'N/A'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-900 whitespace-nowrap">
                                            {item.bet_code || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                                            {new Date(item.draw_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                                            {item.return_date ? new Date(item.return_date).toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="font-medium text-gray-900 text-xs">
                                                ₱{parseFloat(item.bet_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="font-medium text-gray-900 text-xs">
                                                ₱{parseFloat(item.amount || item.win_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-xs text-gray-900">
                                                ₱{parseFloat(item.charge_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="font-bold text-gray-900 text-xs">
                                                ₱{parseFloat(item.net || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <span>{item.mode || 'N/A'}</span>
                                                {(item.receipt_image || item.deposit_receipt) && (
                                                    <button
                                                        onClick={() => {
                                                            const imageUrl = item.receipt_image || item.deposit_receipt
                                                            console.log('Opening receipt modal for item:', item.id, 'URL:', imageUrl)
                                                            setReceiptImageUrl(imageUrl)
                                                            setSelectedReceiptItem(item)
                                                            setShowReceiptModal(true)
                                                        }}
                                                        title="View receipt"
                                                        className="text-green-600 hover:text-green-800 transition-colors"
                                                    >
                                                        <ImageIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                                            {item.payment_type === 'Full Payment' ? 'Full' : item.payment_type === 'Partial Payment' ? 'Partial' : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{item.collector || 'N/A'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{item.created_by || 'N/A'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{item.area || 'N/A'}</td>
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
                                                    ? 'bg-green-600 text-white'
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
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                    <p className="text-blue-100 text-sm mb-1">Total Collections</p>
                    <p className="text-3xl font-bold">{filteredItems.length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                    <p className="text-purple-100 text-sm mb-1">Total Amount</p>
                    <p className="text-2xl font-bold">
                        ₱{filteredItems.reduce((sum, item) => sum + parseFloat(item.amount || item.win_amount || 0), 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
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

            {/* Receipt Image Modal */}
            {showReceiptModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={() => setShowReceiptModal(false)}
                >
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-between flex-shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ImageIcon className="w-6 h-6" />
                                Transaction Receipt
                            </h2>
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Image */}
                        <div className="p-3 bg-gray-50 overflow-y-auto flex-1">
                            <div className="flex items-center justify-center mb-3">
                                {receiptImageUrl ? (
                                    <img
                                        src={receiptImageUrl}
                                        alt="Transaction Receipt"
                                        className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                                        onError={(e) => {
                                            console.error('Failed to load receipt image:', receiptImageUrl)
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3EImage not available%3C/text%3E%3C/svg%3E'
                                        }}
                                        onLoad={() => console.log('Receipt image loaded successfully:', receiptImageUrl)}
                                    />
                                ) : (
                                    <div className="text-center">
                                        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No receipt image available</p>
                                    </div>
                                )}
                            </div>

                            {/* Mode and Reference Info */}
                            {selectedReceiptItem && (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-white p-2 rounded border border-gray-200">
                                            <p className="text-[10px] text-gray-500 mb-0.5">Payment Mode</p>
                                            <p className="font-semibold text-gray-900">{selectedReceiptItem.mode || 'Cash'}</p>
                                        </div>
                                        {selectedReceiptItem.mode !== 'Cash' ? (
                                            <>
                                                <div className="bg-white p-2 rounded border border-gray-200">
                                                    <p className="text-[10px] text-gray-500 mb-0.5">Reference #</p>
                                                    <p className="font-semibold text-gray-900">{selectedReceiptItem.reference_number || 'N/A'}</p>
                                                </div>
                                                <div className="bg-white p-2 rounded border border-gray-200">
                                                    <p className="text-[10px] text-gray-500 mb-0.5">Receiver Contact</p>
                                                    <p className="font-semibold text-gray-900">{selectedReceiptItem.receiver_contact || 'N/A'}</p>
                                                </div>
                                                <div className="bg-green-50 p-2 rounded border border-green-200 col-span-2">
                                                    <p className="text-[10px] text-green-600 mb-0.5">Total Net Amount</p>
                                                    <p className="text-lg font-bold text-green-700">
                                                        ₱{parseFloat(selectedReceiptItem.net || selectedReceiptItem.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="bg-white p-2 rounded border border-gray-200">
                                                    <p className="text-[10px] text-gray-500 mb-0.5">Bank</p>
                                                    <p className="font-semibold text-gray-900">{selectedReceiptItem.bank_name || 'N/A'}</p>
                                                </div>
                                                <div className="bg-white p-2 rounded border border-gray-200">
                                                    <p className="text-[10px] text-gray-500 mb-0.5">Account Number</p>
                                                    <p className="font-semibold text-gray-900">{selectedReceiptItem.receiver_contact || 'N/A'}</p>
                                                </div>
                                                <div className="bg-white p-2 rounded border border-gray-200 col-span-2">
                                                    <p className="text-[10px] text-gray-500 mb-0.5">Deposit Reference</p>
                                                    <p className="font-semibold text-gray-900">{selectedReceiptItem.deposit_reference || 'N/A'}</p>
                                                </div>
                                                <div className="bg-green-50 p-2 rounded border border-green-200 col-span-2">
                                                    <p className="text-[10px] text-green-600 mb-0.5">Total Net Amount</p>
                                                    <p className="text-lg font-bold text-green-700">
                                                        ₱{parseFloat(selectedReceiptItem.net || selectedReceiptItem.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Collections
