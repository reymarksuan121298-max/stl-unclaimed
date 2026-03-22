import React, { useState, useRef } from 'react'
import { User, Mail, Shield, MapPin, Calendar, Edit3, Save, X, Key, Briefcase, Users as UsersIcon, Camera, Loader2, Eye, EyeOff } from 'lucide-react'
import { authHelpers, dataHelpers } from '../lib/supabase'

function Profile({ user }) {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        fullname: user?.fullname || '',
        username: user?.username || '',
        franchising_name: user?.franchising_name || 'Glowing Fortune OPC',
        contact_number: user?.contact_number || '',
        profile_url: user?.profile_url || null,
    })
    const [isUploading, setIsUploading] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const fileInputRef = useRef(null)

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setIsUploading(true)
            const publicUrl = await dataHelpers.uploadProfilePicture(file)
            setFormData(prev => ({ ...prev, profile_url: publicUrl }))
            alert('Profile picture uploaded! Click Save to apply.')
        } catch (error) {
            console.error('Upload failed:', error)
            alert('Upload failed: ' + error.message)
        } finally {
            setIsUploading(false)
        }
    }

    const handleSave = async () => {
        try {
            // Filter out fields that don't exist in the database yet (like profile_url)
            // to prevent "Could not find column" errors
            const dbPayload = {
                fullname: formData.fullname,
                username: formData.username,
                franchising_name: formData.franchising_name,
                contact_number: formData.contact_number,
                profile_url: formData.profile_url
            }

            if (user?.id) {
                await dataHelpers.updateUser(user.id, dbPayload)
            }
            
            const updatedUser = { ...user, ...formData }
            authHelpers.setCurrentUser(updatedUser)
            
            setIsEditing(false)
            alert('Profile updated successfully!')
        } catch (error) {
            console.error('Save failed:', error)
            alert('Save failed: ' + error.message)
        }
    }

    const handlePasswordUpdate = async (e) => {
        e.preventDefault()
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match!')
            return
        }

        if (passwordData.newPassword.length < 4) {
            alert('Password must be at least 4 characters long.')
            return
        }

        try {
            if (user?.id) {
                await dataHelpers.updateUser(user.id, { password: passwordData.newPassword })
            }
            
            const updatedUser = { ...user, password: passwordData.newPassword }
            authHelpers.setCurrentUser(updatedUser)
            
            setShowPasswordModal(false)
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            alert('Password updated successfully!')
        } catch (error) {
            console.error('Password update failed:', error)
            alert('Failed to update password: ' + error.message)
        }
    }

    const roles = {
        admin: { color: 'bg-red-100 text-red-800', icon: Shield },
        specialist: { color: 'bg-purple-100 text-purple-800', icon: Briefcase },
        cashier: { color: 'bg-green-100 text-green-800', icon: UsersIcon },
        collector: { color: 'bg-blue-100 text-blue-800', icon: MapPin },
        checker: { color: 'bg-yellow-100 text-yellow-800', icon: Shield },
    }

    const userRole = user?.role?.toLowerCase() || 'staff'
    const RoleIcon = roles[userRole]?.icon || User

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
            {/* Header / Cover */}
            <div className="relative">
                <div className="h-48 md:h-64 bg-gradient-to-r from-brand-teal to-brand-gold rounded-3xl shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
                </div>
                <div className="absolute -bottom-1 left-8 w-32 h-32 md:w-40 md:h-40 bg-white rounded-full p-2 shadow-2xl flex items-center justify-center translate-y-1/2 group">
                    <div className="w-full h-full bg-indigo-50 rounded-full flex items-center justify-center overflow-hidden border-4 border-white relative">
                        {formData.profile_url ? (
                            <img src={formData.profile_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl md:text-5xl font-bold text-brand-teal">
                                {user?.fullname?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        )}
                        
                        {isEditing && (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                ) : (
                                    <Camera className="w-8 h-8 text-white" />
                                )}
                            </button>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*" 
                        />
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <div className="pt-16 md:pt-20 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{formData.fullname || 'User'}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${roles[userRole]?.color || 'bg-gray-100 text-gray-800'}`}>
                                <RoleIcon className="w-3 h-3" />
                                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                            </span>
                            <span className="text-gray-500 text-sm flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {formData.franchising_name || 'Glowing Fortune OPC'}
                            </span>
                        </div>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-brand-teal text-white rounded-xl hover:bg-brand-teal/90 transition-all shadow-lg hover:shadow-brand-teal/20"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
                            >
                                <X className="w-4 h-4 inline mr-2" />
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl shadow-md p-6 space-y-6 flex-1">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-3">
                            <User className="w-5 h-5 text-indigo-500" />
                            Basic Information
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.fullname}
                                        onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all font-medium text-slate-800"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-semibold">{formData.fullname || 'N/A'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Username</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all font-medium text-slate-800"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-semibold">{formData.username || 'N/A'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Contact Number</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.contact_number}
                                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all font-medium text-slate-800"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-semibold">{formData.contact_number || 'N/A'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Role</label>
                                <p className="text-gray-900 font-semibold capitalize">{userRole}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 block mb-1">Franchise</label>
                                {isEditing ? (
                                    <select
                                        value={formData.franchising_name}
                                        onChange={(e) => setFormData({ ...formData, franchising_name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal transition-all font-medium text-slate-800"
                                    >
                                        <option value="5A Royal Gaming OPC">5A Royal Gaming OPC</option>
                                        <option value="Imperial Gnaing OPC">Imperial Gnaing OPC</option>
                                        <option value="Glowing Fortune OPC">Glowing Fortune OPC</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-900 font-semibold">{formData.franchising_name}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="bg-white rounded-2xl shadow-md p-6 space-y-6 flex-1">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-3">
                            <Shield className="w-5 h-5 text-indigo-500" />
                            Account Settings
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <label className="text-sm font-medium text-gray-500 block mb-2">Security</label>
                                <button 
                                    onClick={() => setShowPasswordModal(true)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 text-brand-teal font-bold rounded-lg hover:bg-brand-teal/5 hover:border-brand-teal transition-all text-sm shadow-sm group"
                                >
                                    <span className="flex items-center gap-2">
                                        <Key className="w-4 h-4" />
                                        Change Password
                                    </span>
                                    <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                            
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <label className="text-sm font-medium text-gray-500 block mb-2">Member Details</label>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Joined On</p>
                                            <p className="text-gray-900 font-semibold text-sm">January 2026</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-md border border-green-200 uppercase tracking-tighter">Verified Account</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assigned Collectors Section for Cashiers */}
                {userRole === 'cashier' && user?.assigned_collectors && (
                    <div className="bg-white rounded-2xl shadow-md p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <UsersIcon className="w-5 h-5 text-indigo-500" />
                                My Assigned Collectors
                            </h2>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                                {user.assigned_collectors.length} Total
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {user.assigned_collectors.length > 0 ? (
                                user.assigned_collectors.map((collector, index) => (
                                    <div 
                                        key={collector} 
                                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all cursor-default group"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 font-bold text-sm group-hover:scale-110 transition-transform">
                                            {collector.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-700">{collector}</span>
                                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Field Agent</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-500 italic text-sm">No collectors assigned yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Account Status Card */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <Shield className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-indigo-900">Your account is ACTIVE</h3>
                            <p className="text-sm text-indigo-700">You have all permissions assigned to your {userRole} role.</p>
                        </div>
                    </div>
                    <div className="text-indigo-900 font-bold text-xs bg-white px-3 py-1 rounded-full shadow-sm border border-indigo-100 self-start md:self-center uppercase tracking-wider">
                        Secure Account
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowPasswordModal(false)}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-brand-teal to-brand-gold px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Key className="w-5 h-5" />
                                Change Security Password
                            </h3>
                            <button 
                                onClick={() => setShowPasswordModal(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handlePasswordUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-10"
                                        placeholder="Min. 4 characters"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Confirm New Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="Repeat new password"
                                    required
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profile
