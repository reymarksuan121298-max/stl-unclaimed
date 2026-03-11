import { createClient } from '@supabase/supabase-js';

// Fallback memory storage to bypass "Native module is null" 
// caused by Expo Go and SDK 54 version native module mismatch
const memoryStorage = {
  getItem: (key) => Promise.resolve(memoryStorage[key] || null),
  setItem: (key, value) => Promise.resolve(memoryStorage[key] = value),
  removeItem: (key) => Promise.resolve(delete memoryStorage[key]),
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: memoryStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Google Sheets Integration Service
const GOOGLE_SCRIPT_URLS = [
    process.env.EXPO_PUBLIC_GOOGLE_SCRIPT_URL_1,
    process.env.EXPO_PUBLIC_GOOGLE_SCRIPT_URL_2,
    process.env.EXPO_PUBLIC_GOOGLE_SCRIPT_URL_3,
    process.env.EXPO_PUBLIC_GOOGLE_SCRIPT_URL_4,
    process.env.EXPO_PUBLIC_GOOGLE_SCRIPT_URL_5,
    process.env.EXPO_PUBLIC_GOOGLE_SCRIPT_URL_6,
    process.env.EXPO_PUBLIC_GOOGLE_SCRIPT_URL_7,
    process.env.EXPO_PUBLIC_GOOGLE_SCRIPT_URL_8,
    process.env.EXPO_PUBLIC_GOOGLE_SCRIPT_URL_9,
    process.env.EXPO_PUBLIC_GOOGLE_SCRIPT_URL_10
].filter(url => url && url.trim() !== '');

function calculateDaysOverdue(drawDate) {
    if (!drawDate) return 0;
    try {
        let finalDate = new Date();
        if (typeof drawDate === 'string' && drawDate.includes(' ')) {
            const parts = drawDate.split(' ');
            const timePart = parts[0].toUpperCase();
            const datePart = parts[1];
            const [year, month, day] = datePart.split('-').map(Number);
            
            let hour = 0;
            let minute = 0;
            const isPM = timePart.endsWith('PM');
            const isAM = timePart.endsWith('AM');
            const timeDigits = timePart.replace(/[AP]M/, '');

            if (timeDigits.includes(':')) {
                const [h, m] = timeDigits.split(':').map(Number);
                hour = h;
                minute = m;
            } else {
                hour = Number(timeDigits);
            }

            if (isPM && hour < 12) hour += 12;
            if (isAM && hour === 12) hour = 0;

            finalDate = new Date(year, month - 1, day, hour, minute);
        } else {
            finalDate = new Date(drawDate);
        }
        
        const now = new Date();
        const diffTime = now - finalDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return Math.floor(diffDays);
    } catch (error) {
        console.error('Error calculating days overdue:', error);
        return 0;
    }
}

export const googleSheetsHelpers = {
    getPendingFromSheets: async (user = null) => {
        if (GOOGLE_SCRIPT_URLS.length === 0) {
            console.warn('No Google Script URLs configured.');
            return [];
        }

        try {
            const fetchPromises = GOOGLE_SCRIPT_URLS.map(async (url, index) => {
                try {
                    let targetUrl = url;
                    if (user?.role?.toLowerCase() === 'collector' && user?.username) {
                        targetUrl += (targetUrl.includes('?') ? '&' : '?') + `collector=${encodeURIComponent(user.username)}`;
                    }

                    const response = await fetch(targetUrl, {
                        method: 'GET',
                        redirect: 'follow',
                        headers: { 'Accept': 'application/json' }
                    });

                    if (!response.ok) return [];
                    const result = await response.json();
                    if (!result.success) return [];
                    return result.data || [];
                } catch (error) {
                    console.error(`Source ${index + 1} fetch error:`, error.message);
                    return [];
                }
            });

            const allResults = await Promise.all(fetchPromises);
            const mergedData = allResults.flat();

            let transformedData = mergedData.map(item => ({
                id: item.transCode,
                teller_name: item.tellerName,
                trans_id: item.transCode,
                draw_date: item.drawTime,
                bet_number: item.betNumber,
                bet_code: item.betCode,
                bet_amount: parseFloat(item.betAmount) || 0,
                win_amount: parseFloat(item.winAmount) || 0,
                collector: item.collector,
                status: item.status,
                notification: item.notification,
                days_overdue: calculateDaysOverdue(item.drawTime),
                source: 'google_sheets'
            }));

            if (user?.role?.toLowerCase() === 'cashier' && user?.assigned_collectors && Array.isArray(user.assigned_collectors)) {
                const assignedCollectorsLower = user.assigned_collectors.map(c => c.toLowerCase().split('@')[0].trim());
                transformedData = transformedData.filter(item => {
                    const itemCollectorLower = (item.collector || '').toLowerCase().split('@')[0].trim();
                    return assignedCollectorsLower.includes(itemCollectorLower);
                });
            }

            return transformedData;
        } catch (error) {
            console.error('Error fetching from Google Sheets:', error);
            throw error;
        }
    }
};

export const authHelpers = {
    signIn: async (username, password) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .eq('status', 'active')
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    signOut: async () => {
        await memoryStorage.removeItem('user');
        return { success: true };
    },

    getCurrentUser: async () => {
        try {
            const user = await memoryStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    },

    setCurrentUser: async (user, saveLogin = true) => {
        try {
            if (saveLogin) {
                await memoryStorage.setItem('user', JSON.stringify(user));
            } else {
                // To keep the user authenticated during this session but not persist across app reloads,
                // we technically can still rely on Supabase tokens and/or internal state in App.js.
                // Here we just skip storing it in the persistent memory layout.
                await memoryStorage.removeItem('user');
            }
        } catch (e) {
            console.error("Error saving user to memory");
        }
    }
};

export const dataHelpers = {
    getPending: async (filters = {}) => {
        let query = supabase
            .from('Pending')
            .select('*')
            .order('days_overdue', { ascending: false });

        if (filters.franchise_name) query = query.eq('franchise_name', filters.franchise_name);

        if (filters.collector) {
            query = query.eq('collector', filters.collector);
        } else if (filters.collectors && Array.isArray(filters.collectors)) {
            query = query.in('collector', filters.collectors);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }
};
