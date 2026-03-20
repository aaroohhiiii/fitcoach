import type { Metadata } from 'next'
import SupabasePublicConfigScript from '@/components/SupabasePublicConfigScript'
import './globals.css'

/** Ensures layout reads Supabase env on each request (not only at build). */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'FitCoach AI',
  description:
    'Fitness tracking with streaks, stats, and an AI coach powered by Groq.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SupabasePublicConfigScript />
        {children}
      </body>
    </html>
  )
}
