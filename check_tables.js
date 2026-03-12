
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qzfgworrkrosgzfwcfcy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Zmd3b3Jya3Jvc2d6ZndjZmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0Mjg1MzYsImV4cCI6MjA4MjAwNDUzNn0.diGZlxL_9ioS74i-slVFkzg3HbWGl-hyyxY4yQ-ITiA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function listTables() {
    try {
        // This is a hacky way to list tables if we don't have direct access
        const tables = ['users', 'profiles', 'user_settings', 'Unclaimed', 'Pending']
        for (const table of tables) {
            const { data, error } = await supabase.from(table).select('*').limit(1)
            if (!error) {
                console.log(`Table exists: ${table}`)
                if (data && data.length > 0) {
                    console.log(`Columns in ${table}:`, Object.keys(data[0]).join(', '))
                }
            } else {
                console.log(`Table ${table} does not exist or error: ${error.message}`)
            }
        }
    } catch (err) {
        console.error(err)
    }
}

listTables()
