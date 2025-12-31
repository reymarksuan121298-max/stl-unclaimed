/**
 * Google Sheets Integration Service
 * Connects to Google Apps Script Web Apps to fetch pending data from Google Sheets
 * Supports up to 10 different Google Sheets sources
 */

// Load all Google Apps Script URLs from environment variables
const GOOGLE_SCRIPT_URLS = [
    import.meta.env.VITE_GOOGLE_SCRIPT_URL_1,
    import.meta.env.VITE_GOOGLE_SCRIPT_URL_2,
    import.meta.env.VITE_GOOGLE_SCRIPT_URL_3,
    import.meta.env.VITE_GOOGLE_SCRIPT_URL_4,
    import.meta.env.VITE_GOOGLE_SCRIPT_URL_5,
    import.meta.env.VITE_GOOGLE_SCRIPT_URL_6,
    import.meta.env.VITE_GOOGLE_SCRIPT_URL_7,
    import.meta.env.VITE_GOOGLE_SCRIPT_URL_8,
    import.meta.env.VITE_GOOGLE_SCRIPT_URL_9,
    import.meta.env.VITE_GOOGLE_SCRIPT_URL_10
].filter(url => url && url.trim() !== '') // Only keep valid URLs

export const googleSheetsHelpers = {
    /**
     * Fetch pending data from all configured Google Sheets via Apps Script
     * @returns {Promise<Array>} Array of pending items from all Google Sheets
     */
    getPendingFromSheets: async () => {
        if (GOOGLE_SCRIPT_URLS.length === 0) {
            console.warn('No Google Script URLs configured. Set VITE_GOOGLE_SCRIPT_URL_1 to VITE_GOOGLE_SCRIPT_URL_10 in .env')
            return []
        }

        console.log(`Fetching from ${GOOGLE_SCRIPT_URLS.length} Google Sheets source(s)...`)

        try {
            // Fetch from all URLs in parallel
            const fetchPromises = GOOGLE_SCRIPT_URLS.map(async (url, index) => {
                try {
                    const response = await fetch(url, {
                        method: 'GET',
                        redirect: 'follow',
                        headers: {
                            'Accept': 'application/json'
                        }
                    })

                    if (!response.ok) {
                        console.warn(`Source ${index + 1} HTTP error! status: ${response.status}`)
                        return []
                    }

                    const result = await response.json()

                    if (!result.success) {
                        console.warn(`Source ${index + 1} error:`, result.error)
                        return []
                    }

                    console.log(`✅ Source ${index + 1}: Fetched ${result.data?.length || 0} items`)
                    return result.data || []
                } catch (error) {
                    console.error(`Source ${index + 1} fetch error:`, error.message)
                    return []
                }
            })

            // Wait for all fetches to complete
            const allResults = await Promise.all(fetchPromises)

            // Flatten and merge all results
            const mergedData = allResults.flat()

            console.log(`📊 Total items from all sources: ${mergedData.length}`)

            // Debug: Log first item to see what we're getting
            if (mergedData.length > 0) {
                console.log('Sample item from Google Sheets:', mergedData[0])
                console.log('Sample drawTime value:', mergedData[0].drawTime)
                console.log('Sample drawTime type:', typeof mergedData[0].drawTime)
            }

            // Transform the data to match the expected format
            return mergedData.map(item => ({
                id: item.transCode, // Use transCode as unique ID
                teller_name: item.tellerName,
                trans_id: item.transCode,
                draw_date: item.drawTime, // Pass through as-is
                bet_number: item.betNumber,
                bet_code: item.betCode,
                bet_amount: parseFloat(item.betAmount) || 0,
                win_amount: parseFloat(item.winAmount) || 0,
                collector: item.collector,
                status: item.status,
                notification: item.notification,
                days_overdue: calculateDaysOverdue(item.drawTime),
                source: 'google_sheets' // Mark the data source
            }))
        } catch (error) {
            console.error('Error fetching from Google Sheets:', error)
            throw error
        }
    },

    /**
     * Add a new pending item to Google Sheets
     * @param {Object} item - The item to add
     * @returns {Promise<Object>} Response from the server
     */
    addPendingToSheets: async (item) => {
        if (GOOGLE_SCRIPT_URLS.length === 0) {
            throw new Error('Google Script URL not configured')
        }

        try {
            const response = await fetch(GOOGLE_SCRIPT_URLS[0], {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tellerName: item.teller_name,
                    transCode: item.trans_id,
                    drawTime: item.draw_date,
                    betNumber: item.bet_number,
                    betCode: item.bet_code,
                    betAmount: item.bet_amount,
                    winAmount: item.win_amount,
                    collector: item.collector,
                    status: item.status || 'pending',
                    notification: item.notification || ''
                })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Failed to add data to Google Sheets')
            }

            return result
        } catch (error) {
            console.error('Error adding to Google Sheets:', error)
            throw error
        }
    },

    /**
     * Delete a pending item from Google Sheets by transaction code
     * @param {string} transCode - The transaction code to delete
     * @returns {Promise<Object>} Response from the server
     */
    deletePendingFromSheets: async (transCode) => {
        if (GOOGLE_SCRIPT_URLS.length === 0) {
            throw new Error('Google Script URL not configured')
        }

        try {
            const url = `${GOOGLE_SCRIPT_URLS[0]}?action=delete&transCode=${encodeURIComponent(transCode)}`
            const response = await fetch(url, {
                method: 'GET',
                redirect: 'follow'
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Failed to delete from Google Sheets')
            }

            return result
        } catch (error) {
            console.error('Error deleting from Google Sheets:', error)
            throw error
        }
    },

    /**
     * Test the connection to Google Sheets
     * @returns {Promise<boolean>} True if connection is successful
     */
    testConnection: async () => {
        if (GOOGLE_SCRIPT_URLS.length === 0) {
            return false
        }

        try {
            const response = await fetch(GOOGLE_SCRIPT_URLS[0], {
                method: 'GET',
                redirect: 'follow'
            })
            return response.ok
        } catch (error) {
            console.error('Connection test failed:', error)
            return false
        }
    }
}

/**
 * Calculate days overdue from draw date
 * @param {string} drawDate - The draw date/time
 * @returns {number} Number of days overdue
 */
function calculateDaysOverdue(drawDate) {
    if (!drawDate) return 0

    try {
        const draw = new Date(drawDate)
        const now = new Date()
        const diffTime = now - draw
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        // Only count as overdue if more than 3 days
        return Math.max(0, diffDays - 3)
    } catch (error) {
        console.error('Error calculating days overdue:', error)
        return 0
    }
}

export default googleSheetsHelpers
