import { useEffect, useState } from 'react'
import { MapPin, Search, Plus, Trash2, Edit, X } from 'lucide-react'
import { dataHelpers } from '../lib/supabase'
import { hasPermission, PERMISSIONS } from '../utils/permissions'

function Areas({ user }) {
    const [areas, setAreas] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingArea, setEditingArea] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active'
    })

    useEffect(() => {
        loadAreas()
    }, [filterStatus])

    const loadAreas = async () => {
        try {
            setLoading(true)
            const filters = {}
            if (filterStatus) filters.status = filterStatus

            const data = await dataHelpers.getAreas(filters)
            setAreas(data)
        } catch (error) {
            console.error('Error loading areas:', error)
            alert('Error loading areas')
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (area = null) => {
        if (area) {
            setEditingArea(area)
            setFormData({
                name: area.name,
                description: area.description || '',
                status: area.status
            })
        } else {
            setEditingArea(null)
            setFormData({
                name: '',
                description: '',
                status: 'active'
            })
        }
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            if (editingArea) {
                await dataHelpers.updateArea(editingArea.id, formData)
                alert('Area updated successfully!')
            } else {
                await dataHelpers.createArea(formData)
                alert('Area added successfully!')
            }
            setShowModal(false)
            loadAreas()
        } catch (error) {
            console.error('Error saving area:', error)
            const errorMsg = error.message || error.error_description || error.details || 'Check your internet connection or try again.'
            alert('Error saving area: ' + errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this area?')) return

        try {
            setLoading(true)
            await dataHelpers.deleteArea(id)
            alert('Area deleted successfully!')
            loadAreas()
        } catch (error) {
            console.error('Error deleting area:', error)
            alert('Error deleting area: ' + (error.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    const filteredAreas = areas.filter(area =>
        area.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        area.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading && areas.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading areas...</p>
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
                        <MapPin className="w-8 h-8 text-indigo-600" />
                        Service Areas
                    </h1>
                    <p className="text-gray-600 mt-1">Manage service areas for the system</p>
                </div>
                {hasPermission(user, PERMISSIONS.MANAGE_USERS) && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                    >
                        <Plus className="w-5 h-5" />
                        Add Area
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search areas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Area Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                                {hasPermission(user, PERMISSIONS.MANAGE_USERS) && (
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAreas.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No areas found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAreas.map((area) => (
                                    <tr key={area.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{area.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">{area.description || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${area.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {area.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(area.created_at).toLocaleDateString()}
                                        </td>
                                        {hasPermission(user, PERMISSIONS.MANAGE_USERS) && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(area)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(area.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-xl font-bold">{editingArea ? 'Edit Area' : 'Add Area'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="area-name" className="text-sm font-semibold text-gray-700">Area Name *</label>
                                <input
                                    id="area-name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter area name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="area-description" className="text-sm font-semibold text-gray-700">Description</label>
                                <textarea
                                    id="area-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter description (optional)"
                                    rows="3"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="area-status" className="text-sm font-semibold text-gray-700">Status *</label>
                                <select
                                    id="area-status"
                                    required
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : editingArea ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Areas
