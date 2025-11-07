import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Supabase Client Config:", {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "MISSING",
    keyPresent: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length || 0,
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase environment variables!", {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
    })
    throw new Error(
      "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
