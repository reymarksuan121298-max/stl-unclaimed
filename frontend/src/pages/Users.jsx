import { useEffect, useState } from 'react'
import { Users as UsersIcon, Search, Filter, Plus, Edit, Trash2, UserCheck, UserX, X } from 'lucide-react'
import { dataHelpers, authHelpers } from '../lib/supabase'

function Users({ user }) {
    const [users, setUsers] = useState([])
    const [areas, setAreas] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('')
    const [filterStatus, setFilterStatus] = useState('')

    const [showUserModal, setShowUserModal] = useState(false)
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
        area: '',
        status: 'active'
    })

    useEffect(() => {
        loadUsers()
        loadAreas()
    }, [filterRole, filterStatus])

    useEffect(() => {
        setCurrentPage(1) // Reset to first page when search/filter changes
    }, [searchTerm, filterRole, filterStatus])

    const loadUsers = async () => {
        try {
            setLoading(true)
            const filters = {}
            if (filterRole) filters.role = filterRole
            if (filterStatus) filters.status = filterStatus

            const data = await dataHelpers.getUsers(filters)
            setUsers(data)
        } catch (error) {
            console.error('Error loading users:', error)
            alert('Error loading users')
        } finally {
            setLoading(false)
        }
    }

    const loadAreas = async () => {
        try {
            const data = await dataHelpers.getAreas({ status: 'active' })
            setAreas(data)
        } catch (error) {
            console.error('Error loading areas:', error)
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
                area: user.area || '',
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
                area: '',
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Area</th>
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
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.area || '-'}</td>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
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
                                {formData.role === 'collector' && (
                                    <div className="space-y-1">
                                        <label htmlFor="user-area" className="text-sm font-medium text-gray-700">Designated Area</label>
                                        <select
                                            id="user-area"
                                            name="area"
                                            value={formData.area}
                                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                        >
                                            <option value="">Select Area</option>
                                            {areas.map(area => (
                                                <option key={area.id} value={area.name}>{area.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className={`space-y-1 ${formData.role === 'collector' ? '' : 'col-span-2'}`}>
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
