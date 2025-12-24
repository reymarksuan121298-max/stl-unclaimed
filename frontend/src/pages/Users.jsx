import { useEffect, useState } from 'react'
import { Users as UsersIcon, Search, Filter, Plus, Edit, Trash2, UserCheck, UserX, X } from 'lucide-react'
import { dataHelpers, authHelpers } from '../lib/supabase'

function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('')
    const [filterStatus, setFilterStatus] = useState('')

    const [showUserModal, setShowUserModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullname: '',
        contact_number: '',
        role: 'staff',
        franchising_name: '',
        status: 'active'
    })

    useEffect(() => {
        loadUsers()
    }, [filterRole, filterStatus])

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

    const handleDeleteAll = async () => {
        if (!confirm('CRITICAL WARNING: This will delete ALL users from the database. You will be logged out and unable to log back in until users are recreated. Are you absolutely sure?')) return

        try {
            setLoading(true)
            await dataHelpers.deleteAllUsers()
            // Clear session since the user is gone
            authHelpers.signOut()
            window.location.reload()
        } catch (error) {
            console.error('Error deleting all users:', error)
            alert('Error deleting all users: ' + error.message)
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(user =>
        user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.contact_number?.includes(searchTerm)
    )

    const roles = ['admin', 'checker', 'general manager', 'specialist', 'collector', 'staff']
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
                        onClick={handleDeleteAll}
                        className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-all duration-200"
                    >
                        <Trash2 className="w-5 h-5" />
                        Delete All Users
                    </button>
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
                        <input
                            type="text"
                            placeholder="Search by name, username, or contact..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
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
                        <select
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Username</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Password</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Fullname</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ContactNumber</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">FranchisingName</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center">
                                        <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No users found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{user.username}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 font-mono">{user.password}</div>
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
            </div>

            {/* User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
                            <h2 className="text-2xl font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                            <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Username</label>
                                    <input
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="Enter username"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Password</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="Enter password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                    <input
                                        required
                                        value={formData.fullname}
                                        onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Contact Number</label>
                                    <input
                                        value={formData.contact_number}
                                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="Enter contact number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    >
                                        {roles.map(role => (
                                            <option key={role} value={role} className="capitalize">{role}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Franchise Name</label>
                                    <input
                                        value={formData.franchising_name}
                                        onChange={(e) => setFormData({ ...formData, franchising_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="Enter franchise name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    >
                                        {statuses.map(status => (
                                            <option key={status} value={status} className="capitalize">{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowUserModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all font-medium"
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
