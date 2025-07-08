import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bfykvhtnzxwcaearrirn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmeWt2aHRuenh3Y2FlYXJyaXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MzIwODEsImV4cCI6MjA2NzUwODA4MX0.7wGXEj8LKGLBiCEuNqy6FddnYa8ECsyBnlMCrkSse-Q'

// Add debugging
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseAnonKey ? 'Key exists' : 'No key')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)