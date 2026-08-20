import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://kiguyyxnarphgdajzgha.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpZ3V5eXhuYXJwaGdkYWp6Z2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMTAxMTAsImV4cCI6MjA5NDc4NjExMH0.2uP2vBNl0fnL41uRkELr6BWv5A4uiIKkaSiO5GEpJQ0',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)