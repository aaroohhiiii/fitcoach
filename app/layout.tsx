import type { Metadata } from 'next'
import './globals.css'

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
