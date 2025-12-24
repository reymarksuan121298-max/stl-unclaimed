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

        if (filters.status) query = query.eq('status', filters.status)
        if (filters.franchise_name) query = query.eq('franchise_name', filters.franchise_name)
        if (filters.area) query = query.eq('area', filters.area)
        if (filters.collector) query = query.eq('collector', filters.collector)

        const { data, error } = await query
        if (error) throw error
        return data
    },

    markAsCollected: async (id, collectorName) => {
        // 1. Get the current item data
        const { data: item, error: fetchError } = await supabase
            .from('Unclaimed')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError

        const returnDate = new Date().toISOString()

        // 2. Update Unclaimed status
        const { error: updateError } = await supabase
            .from('Unclaimed')
            .update({
                status: 'Collected',
                return_date: returnDate,
                collector: collectorName || item.collector
            })
            .eq('id', id)

        if (updateError) throw updateError

        // 3. Insert into OverAllCollections
        const { error: collError } = await supabase
            .from('OverAllCollections')
            .insert([{
                unclaimed_id: id,
                teller_name: item.teller_name,
                bet_number: item.bet_number,
                draw_date: item.draw_date,
                return_date: returnDate,
                amount: item.win_amount,
                charge_amount: item.charge_amount || 0,
                net: item.net || item.win_amount,
                mode: item.mode || 'Cash',
                payment_type: item.payment_type || 'Full Payment',
                collector: collectorName || item.collector || 'System',
                area: item.area,
                franchise_name: item.franchise_name
            }])

        if (collError) throw collError

        // 4. Insert into Reports (Optional but recommended based on schema)
        const { error: reportError } = await supabase
            .from('Reports')
            .insert([{
                teller_name: item.teller_name,
                amount: item.win_amount,
                collector: collectorName || item.collector || 'System',
                area: item.area,
                staff_amount: item.win_amount * 0.10,
                collector_amount: item.win_amount * 0.10,
                agent_amount: item.win_amount * 0.30,
                admin_amount: item.win_amount * 0.50
            }])

        if (reportError) throw reportError

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
        // First delete from OverAllCollections because it has a foreign key to Unclaimed
        // This ensures the collection record is also removed as requested
        const { error: collError } = await supabase
            .from('OverAllCollections')
            .delete()
            .eq('unclaimed_id', id)

        if (collError) throw collError

        const { error } = await supabase
            .from('Unclaimed')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { success: true }
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
    getDashboardStats: async () => {
        const [unclaimed, pending, collections, reports] = await Promise.all([
            supabase.from('Unclaimed').select('*', { count: 'exact', head: true }),
            supabase.from('Pending').select('*', { count: 'exact', head: true }),
            supabase.from('OverAllCollections').select('net'),
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
