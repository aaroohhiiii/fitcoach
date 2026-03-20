import { createClient, SupabaseClient } from '@supabase/supabase-js'

function resolveConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim()
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim()
  return { url, key }
}

let client: SupabaseClient | null = null

/**
 * Lazy client so env from .env.local is read when the handler runs, not only at cold import.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client
  const { url, key } = resolveConfig()
  if (!url || !key) {
    throw new Error(
      'Missing Supabase env. In fitcoach/.env.local set NEXT_PUBLIC_SUPABASE_URL (https://YOUR_REF.supabase.co from Project Settings → API) and NEXT_PUBLIC_SUPABASE_ANON_KEY (publishable or anon key), then restart `next dev`.'
    )
  }
  if (url.startsWith('sb_publishable_') || url.startsWith('sb_secret_')) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is set to an API key. Use your Project URL there (https://….supabase.co from Dashboard → Settings → API). Put sb_publishable_… in NEXT_PUBLIC_SUPABASE_ANON_KEY instead.'
    )
  }
  if (!/^https?:\/\//i.test(url)) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL must be an https URL like https://abcdefgh.supabase.co (Dashboard → Settings → API → Project URL).'
    )
  }
  client = createClient(url, key)
  return client
}

/**
 * Default import for client components: `import supabase from '@/lib/supabase'`
 * Forwards to the same singleton as getSupabase().
 */
const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    const c = getSupabase()
    const value = Reflect.get(c, prop, c)
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(c) : value
  },
})

export default supabase
