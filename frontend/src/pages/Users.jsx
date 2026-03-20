import { useEffect, useState } from 'react'
import { Users as UsersIcon, Search, Filter, Plus, Edit, Trash2, UserCheck, UserX, X, Eye } from 'lucide-react'
import { dataHelpers, authHelpers } from '../lib/supabase'

function Users({ user }) {
    const [users, setUsers] = useState([])
    const [municipalities, setMunicipalities] = useState([])
    const [collectors, setCollectors] = useState([])
    const [cashiers, setCashiers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterMunicipality, setFilterMunicipality] = useState('')

    const [showUserModal, setShowUserModal] = useState(false)
    const [viewingUser, setViewingUser] = useState(null)
    const [showViewModal, setShowViewModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullname: '',
        contact_number: '',
        role: 'staff',
        franchising_name: '',
        municipality: '',
        assigned_areas: [],
        assigned_collectors: [],
        assigned_cashiers: [],
        status: 'active'
    })

    useEffect(() => {
        loadUsers()
        loadMunicipalities()
        loadCollectors()
        loadCashiers()
    }, [filterRole, filterStatus, filterMunicipality])

    useEffect(() => {
        setCurrentPage(1) // Reset to first page when search/filter changes
    }, [searchTerm, filterRole, filterStatus])

    const loadUsers = async () => {
        try {
            setLoading(true)
            const filters = {}
            if (filterRole) filters.role = filterRole
            if (filterStatus) filters.status = filterStatus
            if (filterMunicipality) filters.municipality = filterMunicipality

            const data = await dataHelpers.getUsers(filters)
            setUsers(data)
        } catch (error) {
            console.error('Error loading users:', error)
            alert('Error loading users')
        } finally {
            setLoading(false)
        }
    }

    const loadMunicipalities = async () => {
        try {
            const data = await dataHelpers.getAreas({ status: 'active' })
            setMunicipalities(data)
        } catch (error) {
            console.error('Error loading municipalities:', error)
        }
    }

    const loadCollectors = async () => {
        try {
            const data = await dataHelpers.getUsers({ role: 'collector', status: 'active' })
            setCollectors(data)
        } catch (error) {
            console.error('Error loading collectors:', error)
        }
    }

    const loadCashiers = async () => {
        try {
            const data = await dataHelpers.getUsers({ role: 'cashier', status: 'active' })
            setCashiers(data)
        } catch (error) {
            console.error('Error loading cashiers:', error)
        }
    }

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
        if (!confirm(`Change user status to ${newStatus}?`)) return

        try {
            await dataHelpers.updateUser(id, { status: newStatus })
            loadUsers()
            alert('User status updated!')
        } catch (error) {
            console.error('Error updating user:', error)
            alert('Error updating user')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this user?')) return

        try {
            await dataHelpers.deleteUser(id)
            loadUsers()
            alert('User deleted successfully!')
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Error deleting user')
        }
    }

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user)
            setFormData({
                username: user.username,
                password: user.password,
                fullname: user.fullname,
                contact_number: user.contact_number || '',
                role: user.role,
                franchising_name: user.franchising_name || '',
                municipality: user.municipality || '',
                assigned_areas: user.assigned_areas || [],
                assigned_collectors: user.assigned_collectors || [],
                assigned_cashiers: user.assigned_cashiers || [],
                status: user.status
            })
        } else {
            setEditingUser(null)
            setFormData({
                username: '',
                password: '',
                fullname: '',
                contact_number: '',
                role: 'staff',
                franchising_name: '',
                municipality: '',
                assigned_areas: [],
                assigned_collectors: [],
                assigned_cashiers: [],
                status: 'active'
            })
        }
        setShowUserModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            if (editingUser) {
                await dataHelpers.updateUser(editingUser.id, formData)
                alert('User updated successfully!')
            } else {
                await dataHelpers.createUser(formData)
                alert('User created successfully!')
            }
            setShowUserModal(false)
            loadUsers()
        } catch (error) {
            console.error('Error saving user:', error)
            alert('Error saving user: ' + error.message)
        } finally {
            setLoading(false)
        }
    }



    const filteredUsers = users.filter(user =>
        user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.contact_number?.includes(searchTerm)
    )

    // Pagination calculations
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)

    const paginate = (pageNumber) => setCurrentPage(pageNumber)
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

    const roles = ['admin', 'cashier', 'checker', 'general manager', 'specialist', 'collector', 'staff']
    const franchises = ['5A Royal Gaming OPC', 'Imperial Gnaing OPC', 'Glowing Fortune OPC']
    const statuses = ['active', 'inactive', 'suspended']

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading users...</p>
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
                        <UsersIcon className="w-8 h-8 text-indigo-600" />
                        User Management
                    </h1>
                    <p className="text-gray-600 mt-1">Manage system users and permissions</p>
                </div>
                <div className="flex gap-4">

                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                    >
                        <Plus className="w-5 h-5" />
                        Add User
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <label htmlFor="users-search" className="sr-only">Search users</label>
                        <input
                            id="users-search"
                            name="search"
                            type="text"
                            placeholder="Search by name, username, or contact..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <label htmlFor="role-filter" className="sr-only">Filter by role</label>
                        <select
                            id="role-filter"
                            name="role"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                        >
                            <option value="">All Roles</option>
                            {roles.map(role => (
                                <option key={role} value={role} className="capitalize">{role}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <label htmlFor="municipality-filter" className="sr-only">Filter by municipality</label>
                        <select
                            id="municipality-filter"
                            name="municipality"
                            value={filterMunicipality}
                            onChange={(e) => setFilterMunicipality(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                        >
                            <option value="">All Municipalities</option>
                            {municipalities.map(m => (
                                <option key={m.id} value={m.name}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                        <select
                            id="status-filter"
                            name="status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                        >
                            <option value="">All Statuses</option>
                            {statuses.map(status => (
                                <option key={status} value={status} className="capitalize">{status}</option>
                            ))}
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Username</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Fullname</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ContactNumber</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">FranchisingName</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Municipality</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No users found</p>
                                    </td>
                                </tr>
                            ) : (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{user.username}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{user.fullname}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.contact_number || ''}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 capitalize">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.franchising_name || ''}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {user.assigned_areas && user.assigned_areas.length > 0 ? (
                                                    user.assigned_areas.map(area => (
                                                        <span key={area} className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium">{area}</span>
                                                    ))
                                                ) : (
                                                    user.municipality || '-'
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${user.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : user.status === 'inactive'
                                                    ? 'bg-gray-100 text-gray-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setViewingUser(user)
                                                        setShowViewModal(true)
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Profile"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, user.status)}
                                                    className={`p-2 rounded-lg transition-colors ${user.status === 'active'
                                                        ? 'text-orange-600 hover:bg-orange-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                    title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                                                >
                                                    {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(user)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
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

            {/* User Modal */}
            {showUserModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
                    onClick={() => setShowUserModal(false)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden my-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
                            <h2 className="text-xl font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                            <button onClick={() => setShowUserModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label htmlFor="user-username" className="text-sm font-medium text-gray-700">Username</label>
                                    <input
                                        id="user-username"
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                        placeholder="Enter username"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="user-password" className="text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        id="user-password"
                                        name="password"
                                        required
                                        type="text"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                        placeholder="Enter password"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="user-fullname" className="text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        id="user-fullname"
                                        name="fullname"
                                        required
                                        value={formData.fullname}
                                        onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="user-contact" className="text-sm font-medium text-gray-700">Contact Number</label>
                                    <input
                                        id="user-contact"
                                        name="contact_number"
                                        value={formData.contact_number}
                                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                        placeholder="Enter contact number"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="user-role" className="text-sm font-medium text-gray-700">Role</label>
                                    <select
                                        id="user-role"
                                        name="role"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                    >
                                        {roles.map(role => (
                                            <option key={role} value={role} className="capitalize">{role}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="user-franchise" className="text-sm font-medium text-gray-700">Franchise Name</label>
                                    <select
                                        id="user-franchise"
                                        name="franchising_name"
                                        value={formData.franchising_name}
                                        onChange={(e) => setFormData({ ...formData, franchising_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                    >
                                        <option value="">Select Franchise</option>
                                        {franchises.map(franchise => (
                                            <option key={franchise} value={franchise}>{franchise}</option>
                                        ))}
                                    </select>
                                </div>
                                {['staff', 'checker'].includes(formData.role) && (
                                    <div className="space-y-1 col-span-2">
                                        <label htmlFor="user-municipality" className="text-sm font-medium text-gray-700">Designated Municipality</label>
                                        <select
                                            id="user-municipality"
                                            name="municipality"
                                            value={formData.municipality}
                                            onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                        >
                                            <option value="">Select Municipality</option>
                                            {municipalities.map(m => (
                                                <option key={m.id} value={m.name}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {formData.role === 'collector' && (
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Designated Areas/Municipalities (Check All That Apply)</label>
                                        <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50 flex flex-col gap-2">
                                            {municipalities.map(m => (
                                                <label key={m.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.assigned_areas.includes(m.name)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormData({
                                                                    ...formData,
                                                                    assigned_areas: [...formData.assigned_areas, m.name]
                                                                })
                                                            } else {
                                                                setFormData({
                                                                    ...formData,
                                                                    assigned_areas: formData.assigned_areas.filter(a => a !== m.name)
                                                                })
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-gray-700 font-medium">{m.name}</span>
                                                </label>
                                            ))}
                                            {municipalities.length === 0 && <p className="text-sm text-center text-gray-400 py-4">No areas defined</p>}
                                        </div>
                                    </div>
                                )}
                                {formData.role === 'checker' && (
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-sm font-medium text-gray-700">Assigned Cashiers</label>
                                        <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50 flex flex-col gap-2">
                                            {cashiers.map(cashier => (
                                                <label key={cashier.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.assigned_cashiers.includes(cashier.username)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormData({
                                                                    ...formData,
                                                                    assigned_cashiers: [...formData.assigned_cashiers, cashier.username]
                                                                })
                                                            } else {
                                                                setFormData({
                                                                    ...formData,
                                                                    assigned_cashiers: formData.assigned_cashiers.filter(c => c !== cashier.username)
                                                                })
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-gray-700 font-medium">{cashier.fullname} (@{cashier.username})</span>
                                                </label>
                                            ))}
                                            {cashiers.length === 0 && <p className="text-sm text-center text-gray-400 py-4">No cashiers available</p>}
                                        </div>
                                    </div>
                                )}
                                {formData.role === 'cashier' && (
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Assigned Collectors</label>
                                        <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                                            {collectors.length === 0 ? (
                                                <p className="text-sm text-gray-500 text-center py-2">No collectors available</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {collectors.map(collector => (
                                                        <label key={collector.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.assigned_collectors.includes(collector.fullname)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setFormData({
                                                                            ...formData,
                                                                            assigned_collectors: [...formData.assigned_collectors, collector.fullname]
                                                                        })
                                                                    } else {
                                                                        setFormData({
                                                                            ...formData,
                                                                            assigned_collectors: formData.assigned_collectors.filter(c => c !== collector.fullname)
                                                                        })
                                                                    }
                                                                }}
                                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                            />
                                                            <span className="text-sm text-gray-700">{collector.fullname}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">Select collectors this cashier can view pending items for</p>
                                    </div>
                                )}
                                <div className={`space-y-1 ${(formData.role === 'collector' || formData.role === 'cashier') ? '' : 'col-span-2'}`}>
                                    <label htmlFor="user-status" className="text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        id="user-status"
                                        name="status"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                    >
                                        {statuses.map(status => (
                                            <option key={status} value={status} className="capitalize">{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowUserModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm"
                                >
                                    {editingUser ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Profile Modal */}
            {showViewModal && viewingUser && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
                    onClick={() => setShowViewModal(false)}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transition-all transform scale-100 my-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header/Cover */}
                        <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-purple-700">
                            <button 
                                onClick={() => setShowViewModal(false)}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="absolute -bottom-10 left-8">
                                <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center p-1">
                                    <div className="w-full h-full bg-indigo-50 rounded-xl flex items-center justify-center border-2 border-indigo-100">
                                        <span className="text-3xl font-bold text-indigo-600">
                                            {viewingUser.fullname?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-12 px-8 pb-8 space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{viewingUser.fullname}</h1>
                                <p className="text-indigo-600 font-medium text-sm flex items-center gap-1 mt-1">
                                    @{viewingUser.username}
                                    <span className="mx-2 text-gray-300">•</span>
                                    {viewingUser.role.toUpperCase()}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-2 border-t border-gray-100">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Contact Number</p>
                                    <p className="text-gray-900 font-medium">{viewingUser.contact_number || 'No contact provided'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Status</p>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                                        viewingUser.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {viewingUser.status}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Franchise</p>
                                    <p className="text-gray-800 font-medium text-sm">{viewingUser.franchising_name || 'N/A'}</p>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Municipality/Area Assignments</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {viewingUser.assigned_areas && viewingUser.assigned_areas.length > 0 ? (
                                            viewingUser.assigned_areas.map(a => (
                                                <span key={a} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-full border border-indigo-100">{a}</span>
                                            ))
                                        ) : (
                                            <p className="text-gray-800 font-medium text-sm">{viewingUser.municipality || 'No specific areas'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {viewingUser.role === 'checker' && viewingUser.assigned_cashiers && (
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Assigned Cashiers</p>
                                    <div className="flex flex-wrap gap-2">
                                        {viewingUser.assigned_cashiers.length > 0 ? (
                                            viewingUser.assigned_cashiers.map(c => (
                                                <span key={c} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-lg border border-purple-100 font-medium">
                                                    @{c}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm italic">None assigned</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {viewingUser.role === 'cashier' && viewingUser.assigned_collectors && (
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Assigned Collectors</p>
                                    <div className="flex flex-wrap gap-2">
                                        {viewingUser.assigned_collectors.length > 0 ? (
                                            viewingUser.assigned_collectors.map(c => (
                                                <span key={c} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-lg border border-indigo-100 font-medium">
                                                    {c}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No collectors assigned</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowViewModal(false)
                                        handleOpenModal(viewingUser)
                                    }}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Details
                                </button>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                    <p className="text-blue-100 text-sm mb-1">Total Users</p>
                    <p className="text-3xl font-bold">{filteredUsers.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                    <p className="text-green-100 text-sm mb-1">Active Users</p>
                    <p className="text-3xl font-bold">
                        {filteredUsers.filter(u => u.status === 'active').length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg p-6 text-white">
                    <p className="text-gray-100 text-sm mb-1">Inactive Users</p>
                    <p className="text-3xl font-bold">
                        {filteredUsers.filter(u => u.status === 'inactive').length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
                    <p className="text-red-100 text-sm mb-1">Suspended Users</p>
                    <p className="text-3xl font-bold">
                        {filteredUsers.filter(u => u.status === 'suspended').length}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Users
