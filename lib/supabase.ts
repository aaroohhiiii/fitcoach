import { createClient, SupabaseClient } from '@supabase/supabase-js'

const CONFIG_SCRIPT_ID = 'fitcoach-supabase-config'

function readInjectedPublicConfig(): { url: string; key: string } | null {
  if (typeof window === 'undefined') return null
  const el = document.getElementById(CONFIG_SCRIPT_ID)
  const raw = el?.textContent?.trim()
  if (!raw) return null
  try {
    const j = JSON.parse(raw) as { url?: unknown; key?: unknown }
    const url = typeof j.url === 'string' ? j.url.trim() : ''
    const key = typeof j.key === 'string' ? j.key.trim() : ''
    if (url && key) return { url, key }
  } catch {
    /* ignore */
  }
  return null
}

function resolveConfig() {
  const injected = readInjectedPublicConfig()
  if (injected) return injected

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim()
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim()
  return { url, key }
}

let client: SupabaseClient | null = null


export function getSupabase(): SupabaseClient {
  if (client) return client
  const { url, key } = resolveConfig()
  if (!url || !key) {
    const vercelHint =
      process.env.VERCEL === '1'
        ? ' Vercel: Project Settings → Environment Variables — set NEXT_PUBLIC_SUPABASE_URL (project URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY (anon/publishable), for Production and Preview.'
        : ''
    throw new Error(
      `Missing Supabase env.${vercelHint} Locally: add them to .env.local next to package.json (Supabase → Settings → API), then restart next dev.`
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
