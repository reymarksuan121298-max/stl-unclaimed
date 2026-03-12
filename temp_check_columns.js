
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkColumns() {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1)
    
    if (error) {
        console.error('Error:', error)
        return
    }
    
    if (data && data.length > 0) {
        console.log('Columns in users table:', Object.keys(data[0]))
    } else {
        console.log('No users found in the table.')
    }
}

checkColumns()
