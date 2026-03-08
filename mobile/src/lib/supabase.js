import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ─── CONFIGURE THESE ───────────────────────────────────────────────────────────
// Paste your Supabase URL and anon key here (same as the web .env values)
const SUPABASE_URL = 'https://qzfgworrkrosgzfwcfcy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Zmd3b3Jya3Jvc2d6ZndjZmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0Mjg1MzYsImV4cCI6MjA4MjAwNDUzNn0.diGZlxL_9ioS74i-slVFkzg3HbWGl-hyyxY4yQ-ITiA'
// ───────────────────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})

// ── Auth helpers ───────────────────────────────────────────────────────────────
export const authHelpers = {
    signIn: async (username, password) => {
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

    getCurrentUser: async () => {
        try {
            const raw = await AsyncStorage.getItem('mobile_user')
            return raw ? JSON.parse(raw) : null
        } catch {
            return null
        }
    },

    setCurrentUser: async (user) => {
        await AsyncStorage.setItem('mobile_user', JSON.stringify(user))
    },

    signOut: async () => {
        await AsyncStorage.removeItem('mobile_user')
    },
}

// ── Data helpers ───────────────────────────────────────────────────────────────
export const dataHelpers = {
    // Pending items (from Supabase)
    getPending: async (filters = {}) => {
        let query = supabase
            .from('Pending')
            .select('*')
            .order('days_overdue', { ascending: false })

        if (filters.collector) {
            query = query.eq('collector', filters.collector)
        } else if (filters.collectors && Array.isArray(filters.collectors)) {
            query = query.in('collector', filters.collectors)
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
    },

    // Unclaimed items
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
        } else {
            query = query.in('status', ['Unclaimed', 'Uncollected'])
        }

        if (filters.collector) query = query.eq('collector', filters.collector)
        if (filters.mode) query = query.eq('mode', filters.mode)

        const { data, error } = await query
        if (error) throw error
        return data || []
    },

    // Mark as collected (cashier → Uncollected, others → Collected)
    markAsCollected: async (id, collectorName, userRole = null) => {
        const { data: item, error: fetchError } = await supabase
            .from('Unclaimed')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        if (fetchError) throw fetchError
        if (!item) throw new Error('Item not found.')

        const newStatus = userRole?.toLowerCase() === 'cashier' ? 'Uncollected' : 'Collected'

        const { error } = await supabase
            .from('Unclaimed')
            .update({
                status: newStatus,
                return_date: new Date().toISOString(),
                collector: item.collector || collectorName || 'Collector',
            })
            .eq('id', id)

        if (error) throw error
        return { success: true }
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
        return data || []
    },

    createUnclaimed: async (item) => {
        const { data, error } = await supabase
            .from('Unclaimed')
            .insert([item])
            .select()

        if (error) throw error
        return data
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

    batchDepositCash: async (ids, depositData, cashierName) => {
        const { data, error } = await supabase
            .from('Unclaimed')
            .update({
                cash_deposited: true,
                deposit_date: new Date().toISOString(),
                // For batch, we store the full deposited amount on each record for reference,
                // or we could split it. But usually, we just mark all as deposited with same Ref.
                deposit_amount: depositData.deposit_amount,
                deposit_receipt: depositData.deposit_receipt,
                cashier_name: cashierName,
                bank_name: depositData.bank_name,
                receiver_contact: depositData.receiver_contact,
                deposit_reference: depositData.deposit_reference
            })
            .in('id', ids)
            .select()

        if (error) throw error
        return { success: true, count: data?.length || 0 }
    },

    getPendingCashDeposits: async (filters = {}) => {
        let query = supabase
            .from('Unclaimed')
            .select('*')
            .in('status', ['Collected', 'Uncollected'])
            .eq('mode', 'Cash')
            .order('return_date', { ascending: false })

        if (filters.franchise_name) query = query.eq('franchise_name', filters.franchise_name)
        if (filters.area) query = query.eq('area', filters.area)
        if (filters.collector) query = query.eq('collector', filters.collector)

        const { data, error } = await query
        if (error) throw error
        return data || []
    },

    // Verify/approve deposit (admin only)
    verifyDeposit: async (id, adminName) => {
        const { data, error } = await supabase
            .from('Unclaimed')
            .update({
                status: 'Collected',
                verified_by: adminName,
                verified_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('status', 'Uncollected')
            .select()

        if (error) throw error
        return data
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

    // Dashboard stats
    getDashboardStats: async (user = null) => {
        const isCashier = user?.role?.toLowerCase() === 'cashier'
        const isCollector = user?.role?.toLowerCase() === 'collector'

        let unclaimedQ = supabase.from('Unclaimed').select('*', { count: 'exact', head: true }).in('status', ['Unclaimed', 'Uncollected'])
        let pendingQ = supabase.from('Pending').select('*', { count: 'exact', head: true })
        let collectionsQ = supabase.from('OverAllCollections').select('net')

        if (isCashier) {
            unclaimedQ = unclaimedQ.eq('mode', 'Cash')
            pendingQ = pendingQ.eq('mode', 'Cash')
            collectionsQ = collectionsQ.eq('mode', 'Cash')
        }

        if (isCollector && user?.username) {
            unclaimedQ = unclaimedQ.eq('collector', user.username)
            pendingQ = pendingQ.eq('collector', user.username)
            collectionsQ = collectionsQ.eq('collector', user.username)
        }

        const [unclaimed, pending, collections] = await Promise.all([unclaimedQ, pendingQ, collectionsQ])

        const totalRevenue = collections.data?.reduce((s, i) => s + parseFloat(i.net || 0), 0) || 0

        return {
            totalUnclaimed: unclaimed.count || 0,
            totalPending: pending.count || 0,
            totalCollections: collections.data?.length || 0,
            totalRevenue,
        }
    },
    // Generic user fetcher
    getUsers: async (filters = {}) => {
        let query = supabase.from('users').select('*')
        if (filters.role) query = query.eq('role', filters.role)
        if (filters.status) query = query.eq('status', filters.status)

        const { data, error } = await query
        if (error) throw error
        return data || []
    },

    // Dynamic lookup data for forms
    getLookupData: async () => {
        // Fetch from multiple sources to ensure we catch ALL areas in the system
        const [unclaimedRes, areasRes, collsRes, usersRes] = await Promise.all([
            supabase.from('Unclaimed').select('franchise_name, area, bet_code'),
            supabase.from('Areas').select('name'),
            supabase.from('OverAllCollections').select('area'),
            supabase.from('users').select('area')
        ])

        const uData = unclaimedRes.data || []
        const aData = areasRes.data || []
        const cData = collsRes.data || []
        const usData = usersRes.data || []

        const areaList = [
            ...new Set([
                ...aData.map(a => a.name),
                ...uData.map(i => i.area),
                ...cData.map(i => i.area),
                ...usData.map(i => i.area)
            ].filter(Boolean))
        ].sort()

        return {
            franchises: [...new Set(uData.map(i => i.franchise_name).filter(Boolean))].sort(),
            areas: areaList,
            betCodes: [...new Set(uData.map(i => i.bet_code).filter(Boolean))].sort()
        }
    },
    // Upload file to Supabase storage
    uploadFile: async (bucket, path, base64) => {
        const { decode } = require('base64-arraybuffer');
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, decode(base64), {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return publicUrl;
    },
}
