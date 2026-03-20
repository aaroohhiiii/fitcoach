import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Client components (e.g. landing auth) bundle `NEXT_PUBLIC_*` at **build** time.
 * On Vercel: set those vars, then redeploy — editing env alone does not update old bundles.
 */
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
    const vercelHint =
      process.env.VERCEL === '1'
        ? ' Vercel: add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (exact names) for Production *and* Preview if you use preview URLs. Then run Deployments → … → Redeploy — client-side code only picks up NEXT_PUBLIC_* when the project is rebuilt.'
        : ''
    throw new Error(
      `Missing Supabase env.${vercelHint} Locally: set those two in .env.local next to package.json (Project URL + anon/publishable key from Supabase → Settings → API), then restart next dev.`
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


const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    const c = getSupabase()
    const value = Reflect.get(c, prop, c)
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(c) : value
  },
})

export default supabase
