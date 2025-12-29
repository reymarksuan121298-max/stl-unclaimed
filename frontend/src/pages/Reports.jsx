import { useState, useEffect } from 'react'
import { FileText, Search, Filter, Download, Image as ImageIcon } from 'lucide-react'
import { dataHelpers } from '../lib/supabase'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

function Reports({ user }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCollector, setFilterCollector] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const data = await dataHelpers.getCollections()
            setItems(data)
        } catch (error) {
            console.error('Error loading report data:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredItems = items.filter(item => {
        const matchesSearch = item.teller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.collector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.area?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCollector = !filterCollector || item.collector === filterCollector

        return matchesSearch && matchesCollector
    })

    const collectors = [...new Set(items.map(i => i.collector).filter(Boolean))].sort()

    // Calculations based on 10/10/30/50 distribution
    const calculateDistribution = (amount) => {
        const base = parseFloat(amount || 0)
        return {
            staff: base * 0.10,
            collector: base * 0.10,
            agent: base * 0.30,
            admin: base * 0.50
        }
    }

    const totals = filteredItems.reduce((acc, item) => {
        const amount = parseFloat(item.amount || item.win_amount || 0)
        const dist = calculateDistribution(amount)
        const charges = parseFloat(item.charge_amount || 0)

        acc.amount += amount
        acc.staff += dist.staff
        acc.collector += dist.collector
        acc.agent += dist.agent
        acc.admin += dist.admin
        acc.charges += charges
        return acc
    }, { amount: 0, staff: 0, collector: 0, agent: 0, admin: 0, charges: 0 })

    const handleExportExcel = async () => {
        if (filteredItems.length === 0) {
            alert('No data to export.')
            return
        }

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Distribution Report')

        worksheet.columns = [
            { header: 'Agent Name', key: 'teller_name', width: 25 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Collector', key: 'collector', width: 20 },
            { header: 'Area', key: 'area', width: 15 },
            { header: 'Staff (10%)', key: 'staff', width: 15 },
            { header: 'Collector (10%)', key: 'coll_cut', width: 15 },
            { header: 'Agent (30%)', key: 'agent', width: 15 },
            { header: 'Admin (50%)', key: 'admin', width: 15 },
            { header: 'Charges', key: 'charges', width: 15 }
        ]

        filteredItems.forEach(item => {
            const amount = parseFloat(item.amount || item.win_amount || 0)
            const dist = calculateDistribution(amount)
            worksheet.addRow({
                teller_name: item.teller_name,
                amount: amount,
                collector: item.collector || 'N/A',
                area: item.area || 'N/A',
                staff: dist.staff,
                coll_cut: dist.collector,
                agent: dist.agent,
                admin: dist.admin,
                charges: parseFloat(item.charge_amount || 0)
            })
        })

        // Style header
        worksheet.getRow(1).font = { bold: true }
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F4F8' }
        }

        // Format currencies
        const currencyCols = ['amount', 'staff', 'coll_cut', 'agent', 'admin', 'charges']
        currencyCols.forEach(col => {
            worksheet.getColumn(col).numFmt = '₱#,##0.00'
        })

        // Add totals row
        const totalRow = worksheet.addRow({
            teller_name: 'TOTALS',
            amount: totals.amount,
            staff: totals.staff,
            coll_cut: totals.collector,
            agent: totals.agent,
            admin: totals.admin,
            charges: totals.charges
        })
        totalRow.font = { bold: true }

        const buffer = await workbook.xlsx.writeBuffer()
        saveAs(new Blob([buffer]), `Distribution_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">Loading reports...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-3 bg-indigo-100 rounded-2xl">
                            <FileText className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Distribution Reports</h1>
                            <p className="text-gray-600 mt-1">Winning distribution across staff, collectors, agents, and admin</p>
                        </div>
                    </div>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transform transition-all duration-200"
                    >
                        <Download className="w-5 h-5" />
                        Export to Excel
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or collector..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={filterCollector}
                            onChange={(e) => setFilterCollector(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-slate-50/50"
                        >
                            <option value="">All Collectors</option>
                            {collectors.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#FFF0F4F8]">
                            <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Agent Name</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Amount</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Collector</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Area</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Staff (10%)</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Collector (10%)</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Agent (30%)</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Admin (50%)</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Charges</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <FileText className="w-16 h-16 text-slate-200" />
                                            <p className="text-slate-400 font-medium text-lg">No reports found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const amount = parseFloat(item.amount || item.win_amount || 0)
                                    const dist = calculateDistribution(amount)
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-semibold text-gray-900">{item.teller_name}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">₱{amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">{item.collector || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">{item.area || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">₱{dist.staff.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">₱{dist.collector.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">₱{dist.agent.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">₱{dist.admin.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">₱{parseFloat(item.charge_amount || 0).toLocaleString()}</td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Total Amount', value: totals.amount, color: 'bg-[#A855F7]' },
                    { label: 'Staff Total', value: totals.staff, color: 'bg-[#2563EB]' },
                    { label: 'Collector Total', value: totals.collector, color: 'bg-[#22C55E]' },
                    { label: 'Agent Total', value: totals.agent, color: 'bg-[#F97316]' },
                    { label: 'Admin Total', value: totals.admin, color: 'bg-[#DB2777]' },
                    { label: 'Total Charges', value: totals.charges, color: 'bg-[#E11D48]' }
                ].map((card, idx) => (
                    <div key={idx} className={`${card.color} rounded-2xl p-5 text-white shadow-lg shadow-black/5`}>
                        <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider mb-1">{card.label}</p>
                        <p className="text-xl font-black">₱{card.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Reports
