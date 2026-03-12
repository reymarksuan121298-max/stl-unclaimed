
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qzfgworrkrosgzfwcfcy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Zmd3b3Jya3Jvc2d6ZndjZmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0Mjg1MzYsImV4cCI6MjA4MjAwNDUzNn0.diGZlxL_9ioS74i-slVFkzg3HbWGl-hyyxY4yQ-ITiA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkColumns() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1)
        
        if (error) {
            console.error('Error fetching users:', error)
            return
        }
        
        if (data && data.length > 0) {
            console.log('--- COLUMNS IN USERS TABLE ---')
            console.log(Object.keys(data[0]).join(', '))
            console.log('------------------------------')
        } else {
            console.log('No users found to inspect columns.')
        }
    } catch (err) {
        console.error('Fatal error:', err)
    }
}

checkColumns()
