import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for authentication
export const authHelpers = {
    signIn: async (username, password) => {
        // For now, we'll use a simple query to the Users table
        // In production, you should use Supabase Auth
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .eq('status', 'active')
            .maybeSingle()

        if (error) throw error
        return data
    },

    signOut: async () => {
        // Clear local storage
        localStorage.removeItem('user')
        return { success: true }
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    },

    setCurrentUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user))
    }
}

// Helper functions for data operations
export const dataHelpers = {
    // Unclaimed operations
    getUnclaimed: async (filters = {}) => {
        let query = supabase
            .from('Unclaimed')
            .select('*')
            .order('id', { ascending: false })

        if (filters.status) {
            if (Array.isArray(filters.status)) {
                query = query.in('status', filters.status)
            } else {
                query = query.eq('status', filters.status)
            }
        }
        if (filters.franchise_name) query = query.eq('franchise_name', filters.franchise_name)
        if (filters.area) query = query.eq('area', filters.area)
        if (filters.collector) query = query.eq('collector', filters.collector)

        const { data, error } = await query
        if (error) throw error
        return data
    },


    markAsCollected: async (id, collectorName, userRole = null) => {
        // 1. Get current item to ensure it exists and potentially get default collector
        const { data: item, error: fetchError } = await supabase
            .from('Unclaimed')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        if (fetchError) throw fetchError

        // Check if item exists
        if (!item) {
            throw new Error('Item not found. It may have been deleted or you may not have permission to access it.')
        }

        const returnDate = new Date().toISOString()

        // Determine status based on user role
        // Cashiers mark as "Uncollected" (pending admin verification)
        // Admin/Specialist mark as "Collected" (final status)
        const newStatus = userRole?.toLowerCase() === 'cashier' ? 'Uncollected' : 'Collected'

        // 2. Update Unclaimed status
        // This update will fire the database trigger 'on_unclaimed_collected'
        // which automatically handles insertions into OverAllCollections and Reports.
        const { error: updateError } = await supabase
            .from('Unclaimed')
            .update({
                status: newStatus,
                return_date: returnDate,
                // Prioritize the original assigned collector. 
                // Only use the person marking it (collectorName) if it was empty.
                collector: item.collector || collectorName || 'Collector'
            })
            .eq('id', id)

        if (updateError) throw updateError

        return { success: true }
    },

    updateUnclaimed: async (id, updates) => {
        const { data, error } = await supabase
            .from('Unclaimed')
            .update(updates)
            .eq('id', id)
            .select()

        if (error) throw error
        return data
    },

    createUnclaimed: async (item) => {
        const { data, error } = await supabase
            .from('Unclaimed')
            .insert([item])
            .select()

        if (error) throw error
        return data
    },

    deleteUnclaimed: async (id) => {
        // 1. Attempt to delete from OverAllCollections 
        // We use silent fail (warning only) in case the column doesn't exist yet
        const { error: collError } = await supabase
            .from('OverAllCollections')
            .delete()
            .eq('unclaimed_id', id)

        if (collError) console.warn('Could not delete from OverAllCollections (might be missing unclaimed_id):', collError.message)

        // 2. Attempt to delete from Reports
        // We use silent fail (warning only) in case the column doesn't exist yet
        const { error: reportError } = await supabase
            .from('Reports')
            .delete()
            .eq('unclaimed_id', id)

        if (reportError) console.warn('Could not delete from Reports (might be missing unclaimed_id):', reportError.message)

        // 3. Delete the main record from Unclaimed
        // This is the critical operation
        const { error } = await supabase
            .from('Unclaimed')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { success: true }
    },

    uploadReceiptImage: async (file) => {
        if (!file) return null

        try {
            // Create a unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `receipts/${fileName}`

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('unclaimed-receipts')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) {
                // Provide helpful error message if bucket doesn't exist
                if (error.message.includes('Bucket not found')) {
                    throw new Error(
                        'Storage bucket "unclaimed-receipts" not found. Please create it in Supabase Dashboard:\n' +
                        '1. Go to Storage → New bucket\n' +
                        '2. Name: unclaimed-receipts\n' +
                        '3. Make it Public\n' +
                        '4. Click Create'
                    )
                }
                throw error
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('unclaimed-receipts')
                .getPublicUrl(filePath)

            return publicUrl
        } catch (error) {
            console.error('Upload error:', error)
            throw error
        }
    },

    // Cash deposit operations for cashiers
    depositCash: async (id, depositData, cashierName) => {
        const { data, error } = await supabase
            .from('Unclaimed')
            .update({
                cash_deposited: true,
                deposit_date: new Date().toISOString(),
                deposit_amount: depositData.deposit_amount,
                deposit_receipt: depositData.deposit_receipt,
                cashier_name: cashierName,
                bank_name: depositData.bank_name,
                receiver_contact: depositData.receiver_contact,
                deposit_reference: depositData.deposit_reference
            })
            .eq('id', id)
            .select()

        if (error) throw error
        return data
    },

    getPendingCashDeposits: async (filters = {}) => {
        let query = supabase
            .from('Unclaimed')
            .select('*')
            .in('status', ['Collected', 'Uncollected']) // Include both Collected and Uncollected
            .eq('mode', 'Cash')
            .or('cash_deposited.is.null,cash_deposited.eq.false')
            .order('return_date', { ascending: false })

        if (filters.franchise_name) query = query.eq('franchise_name', filters.franchise_name)
        if (filters.area) query = query.eq('area', filters.area)
        if (filters.collector) query = query.eq('collector', filters.collector)

        const { data, error } = await query
        if (error) throw error
        return data
    },

    uploadDepositReceipt: async (file) => {
        if (!file) return null

        try {
            // Create a unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `deposits/${fileName}`

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('unclaimed-receipts')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) {
                // Provide helpful error message if bucket doesn't exist
                if (error.message.includes('Bucket not found')) {
                    throw new Error(
                        'Storage bucket "unclaimed-receipts" not found. Please create it in Supabase Dashboard:\n' +
                        '1. Go to Storage → New bucket\n' +
                        '2. Name: unclaimed-receipts\n' +
                        '3. Make it Public\n' +
                        '4. Click Create'
                    )
                }
                throw error
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('unclaimed-receipts')
                .getPublicUrl(filePath)

            return publicUrl
        } catch (error) {
            console.error('Upload error:', error)
            throw error
        }
    },

    // Verify/approve deposit (admin only) - changes status from Uncollected to Collected
    verifyDeposit: async (id, adminName) => {
        const { data, error } = await supabase
            .from('Unclaimed')
            .update({
                status: 'Collected',
                verified_by: adminName,
                verified_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('status', 'Uncollected') // Only verify items that are Uncollected
            .select()

        if (error) throw error
        return data
    },

    // Pending operations
    getPending: async (filters = {}) => {
        let query = supabase
            .from('Pending')
            .select('*')
            .order('days_overdue', { ascending: false })

        if (filters.franchise_name) query = query.eq('franchise_name', filters.franchise_name)
        if (filters.collector) query = query.eq('collector', filters.collector)

        const { data, error } = await query
        if (error) throw error
        return data
    },

    // Collections operations
    getCollections: async (filters = {}) => {
        let query = supabase
            .from('OverAllCollections')
            .select('*')
            .order('id', { ascending: false })

        if (filters.franchise_name) query = query.eq('franchise_name', filters.franchise_name)
        if (filters.collector) query = query.eq('collector', filters.collector)

        const { data, error } = await query
        if (error) throw error
        return data
    },

    // Reports operations
    getReports: async (filters = {}) => {
        let query = supabase
            .from('Reports')
            .select('*')
            .order('id', { ascending: false })

        if (filters.collector) query = query.eq('collector', filters.collector)
        if (filters.area) query = query.eq('area', filters.area)

        const { data, error } = await query
        if (error) throw error
        return data
    },

    createReport: async (report) => {
        const { data, error } = await supabase
            .from('Reports')
            .insert([report])
            .select()

        if (error) throw error
        return data
    },

    // Users operations
    getUsers: async (filters = {}) => {
        let query = supabase
            .from('users')
            .select('*')
            .order('id', { ascending: true })

        if (filters.role) query = query.eq('role', filters.role)
        if (filters.status) query = query.eq('status', filters.status)

        const { data, error } = await query
        if (error) throw error
        return data
    },

    createUser: async (user) => {
        const { data, error } = await supabase
            .from('users')
            .insert([user])
            .select()

        if (error) throw error
        return data
    },

    updateUser: async (id, updates) => {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()

        if (error) throw error
        return data
    },

    deleteUser: async (id) => {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { success: true }
    },

    deleteAllUsers: async () => {
        // Delete all users except for maybe protected IDs if needed, 
        // but user asked for "all"
        const { error } = await supabase
            .from('users')
            .delete()
            .neq('id', 0) // Delete everything where id is not 0

        if (error) throw error
        return { success: true }
    },

    // Dashboard statistics
    getDashboardStats: async (user = null) => {
        // For cashiers, only count cash items
        const isCashier = user?.role?.toLowerCase() === 'cashier'

        const [unclaimed, pending, collections, reports] = await Promise.all([
            isCashier
                ? supabase.from('Unclaimed').select('*', { count: 'exact', head: true }).eq('status', 'Unclaimed').eq('mode', 'Cash')
                : supabase.from('Unclaimed').select('*', { count: 'exact', head: true }).eq('status', 'Unclaimed'),
            isCashier
                ? supabase.from('Pending').select('*', { count: 'exact', head: true }).eq('mode', 'Cash')
                : supabase.from('Pending').select('*', { count: 'exact', head: true }),
            isCashier
                ? supabase.from('OverAllCollections').select('net').eq('mode', 'Cash')
                : supabase.from('OverAllCollections').select('net'),
            supabase.from('Reports').select('amount')
        ])

        const totalRevenue = collections.data?.reduce((sum, item) => sum + parseFloat(item.net || 0), 0) || 0
        const totalReports = reports.data?.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) || 0

        return {
            totalUnclaimed: unclaimed.count || 0,
            totalPending: pending.count || 0,
            totalCollections: collections.data?.length || 0,
            totalRevenue,
            totalReports
        }
    }
}
