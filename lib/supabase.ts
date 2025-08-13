import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Debug function to check connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    console.log("Supabase connection test:", { data: !!data, error })
    return !error
  } catch (err) {
    console.error("Supabase connection failed:", err)
    return false
  }
}

export const getUserFilePath = (userId: string, fileName: string) => {
  return `${userId}/${fileName}`
}

export const getOriginalFileName = (storedPath: string) => {
  const parts = storedPath.split("/")
  return parts[parts.length - 1]
}
