import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://elnoxznopennasugdjxx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbm94em5vcGVubmFzdWdkanh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjQ0NzMsImV4cCI6MjA5MzI0MDQ3M30.ER81DWasvfw2VhH5wms7j-fVOpV3msBHY2I6JPUlFl0'

export const supabase = createClient(supabaseUrl, supabaseKey)