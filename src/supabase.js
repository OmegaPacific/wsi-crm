import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://gcgmtqjhnlqisxghomnt.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZ210cWpobmxxaXN4Z2hvbW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDk2NTUsImV4cCI6MjA4Nzc4NTY1NX0.9g8jIFH4jk-0mK4-eyL6nPTiquqeZPkPXsvdPDBDGWc"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)