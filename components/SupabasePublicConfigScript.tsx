/**
 * Embeds public Supabase config into the HTML so client code can read it at runtime.
 * Vercel injects env at request time on the server; NEXT_PUBLIC_* in client bundles is
 * only inlined at build time, which breaks if env was added after deploy.
 */
export default function SupabasePublicConfigScript() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    ''
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    ''
  const payload = JSON.stringify({ url, key })
  return (
    <script
      id="fitcoach-supabase-config"
      type="application/json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  )
}
