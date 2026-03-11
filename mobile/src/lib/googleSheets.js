// Google Sheets integration — mirrors the web googleSheets.js
// Load these from your environment or paste directly

const GOOGLE_SCRIPT_URLS = ['https://script.google.com/macros/s/AKfycbyOAfNPIkiD2tPPDzyufHFMYO_t2fgSzo_kzyay6Yu0oQZ8oOT2vAiXeXQoc8IjqWk-/exec']

/**
 * Strip @BRANCH suffix from collector name for comparison
 * e.g. "CAMILOJAYMINOZA@GFLDN" → "camilojayminoza"
 */
const normalizeCollector = (name) =>
    (name || '').toLowerCase().split('@')[0].trim()

export const googleSheetsHelpers = {
    markCollectorDeposited: async (collectorName) => {
        if (GOOGLE_SCRIPT_URLS.length === 0) return false;
        try {
            const formData = new URLSearchParams()
            formData.append('action', 'deposit_collector')
            formData.append('collector', collectorName)

            const res = await fetch(GOOGLE_SCRIPT_URLS[0], {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            })
            // If the script does not return JSON, just attempt to parse or assume success
            try {
                const result = await res.json()
                return !!result.success
            } catch {
                return true; // if it ran without network error, assume script did its job
            }
        } catch (err) {
            console.error('Sheets deposit error:', err)
            return false
        }
    },

    getPendingFromSheets: async (user = null) => {
        if (GOOGLE_SCRIPT_URLS.length === 0) return []

        try {
            const promises = GOOGLE_SCRIPT_URLS.map(async (url) => {
                try {
                    let target = url
                    if (user?.role?.toLowerCase() === 'collector' && user?.username) {
                        target += (target.includes('?') ? '&' : '?') + `collector=${encodeURIComponent(user.username)}`
                    }

                    const res = await fetch(target, { method: 'GET', redirect: 'follow' })
                    if (!res.ok) return []
                    const result = await res.json()
                    if (!result.success) return []
                    return result.data || []
                } catch {
                    return []
                }
            })

            const all = (await Promise.all(promises)).flat()

            let transformed = all.map((item) => ({
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
                source: 'google_sheets',
            }))

            // Filter for cashier — only their assigned collectors, strip @BRANCH suffix
            let assigned = user?.assigned_collectors || []
            if (typeof assigned === 'string') {
                try { assigned = JSON.parse(assigned) } catch { assigned = [] }
            }

            if (
                user?.role?.toLowerCase() === 'cashier' &&
                assigned &&
                Array.isArray(assigned)
            ) {
                const assignedLower = assigned.map(normalizeCollector)
                transformed = transformed.filter((item) =>
                    assignedLower.includes(normalizeCollector(item.collector))
                )
            }

            // Filter for collector — only their own items
            if (user?.role?.toLowerCase() === 'collector' && user?.username) {
                const myName = normalizeCollector(user.username)
                transformed = transformed.filter((item) =>
                    normalizeCollector(item.collector) === myName
                )
            }

            // Filter out completed items
            transformed = transformed.filter((item) => {
                const s = (item.status || '').toLowerCase()
                return s !== 'deposited' && s !== 'collected'
            })

            return transformed
        } catch (err) {
            console.error('Sheets fetch error:', err)
            return []
        }
    },
}

function calculateDaysOverdue(drawDate) {
    if (!drawDate) return 0
    try {
        let finalDate = new Date()
        if (typeof drawDate === 'string' && drawDate.includes(' ')) {
            const [timePart, datePart] = drawDate.split(' ')
            const [year, month, day] = datePart.split('-').map(Number)
            const upper = timePart.toUpperCase()
            const isPM = upper.endsWith('PM')
            const isAM = upper.endsWith('AM')
            const digits = upper.replace(/[AP]M/, '')
            let hour = 0, minute = 0
            if (digits.includes(':')) {
                const [h, m] = digits.split(':').map(Number)
                hour = h; minute = m
            } else { hour = Number(digits) }
            if (isPM && hour < 12) hour += 12
            if (isAM && hour === 12) hour = 0
            finalDate = new Date(year, month - 1, day, hour, minute)
        } else {
            finalDate = new Date(drawDate)
        }
        const diff = new Date() - finalDate
        return Math.floor(diff / (1000 * 60 * 60 * 24))
    } catch { return 0 }
}
