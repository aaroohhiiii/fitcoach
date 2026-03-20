'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bike,
  Check,
  Dumbbell,
  Flame,
  Flower2,
  Waves,
  X,
  Zap,
} from 'lucide-react'
import PrismBackground from '@/components/PrismBackground'
import { getSupabase } from '@/lib/supabase'

const LIVE_STATS: { Icon: LucideIcon; text: string }[] = [
  { Icon: Activity, text: 'In the last 5 minutes, 47 people logged a running session' },
  { Icon: Dumbbell, text: 'FitCoach users average a 12-day streak in their first month' },
  {
    Icon: BarChart3,
    text: 'Did you know? Logging workouts makes you 3x more likely to stay consistent',
  },
  { Icon: Flame, text: '127 workouts have been logged in the last hour' },
  { Icon: Flower2, text: 'Yoga is the fastest growing activity on FitCoach this week' },
  { Icon: Zap, text: 'Users who check their streak daily work out 40% more often' },
  { Icon: Bike, text: 'The longest active streak on FitCoach is 284 days' },
  {
    Icon: Waves,
    text: 'Did you know? 30 mins of swimming burns as much as 60 mins of walking',
  },
]

export default function LandingPage() {
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [showModal, setShowModal] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [statIndex, setStatIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    let fadeTimeout: ReturnType<typeof setTimeout> | undefined
    const interval = setInterval(() => {
      setFadeIn(false)
      if (fadeTimeout) clearTimeout(fadeTimeout)
      fadeTimeout = setTimeout(() => {
        setStatIndex((prev) => (prev + 1) % LIVE_STATS.length)
        setFadeIn(true)
      }, 400)
    }, 4000)
    return () => {
      clearInterval(interval)
      if (fadeTimeout) clearTimeout(fadeTimeout)
    }
  }, [])

  const openModal = useCallback((signup: boolean) => {
    setShowModal(true)
    setIsSignup(signup)
    setError('')
    setSuccess(false)
    setPassword('')
  }, [])

  const closeModal = useCallback(() => {
    setShowModal(false)
    setError('')
    setLoading(false)
    setSuccess(false)
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (authError) {
        setError(authError.message)
        return
      }
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      if (authError) {
        setError(authError.message)
        return
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-[#1c1c1c] bg-[#111] px-3 py-2.5 text-sm text-white placeholder:text-[#333] transition-colors focus:border-[#00ff87] focus:outline-none'
  const labelClass = 'text-xs font-bold uppercase tracking-widest text-[#333]'

  const { Icon: StatIcon, text: statText } = LIVE_STATS[statIndex]

  return (
    <div className="relative min-h-screen bg-[#050508] text-white">
      <div className="absolute inset-0 h-full w-full">
        <PrismBackground />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <nav className="flex items-center justify-between px-6 py-5 md:px-10">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white md:text-sm">
            FIT<span className="text-[#00ff87]">COACH</span> AI
          </span>
          <button
            type="button"
            onClick={() => openModal(false)}
            className="text-sm text-white transition-opacity hover:opacity-80"
          >
            Sign in
          </button>
        </nav>

        <main className="flex flex-1 flex-col items-center px-6 pb-20 pt-8 md:px-10 md:pt-12">
          <div className="flex w-full max-w-2xl flex-col items-center text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ff87] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00ff87]" />
              </span>
              <span className="text-xs font-medium text-[#00ff87]">
                AI-powered fitness coaching
              </span>
            </div>

            <div className="mb-10 max-w-2xl w-full">
              <div
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center transition-all duration-[400ms]"
                style={{
                  opacity: fadeIn ? 1 : 0,
                  transform: fadeIn ? 'translateY(0)' : 'translateY(6px)',
                }}
              >
                <div className="flex items-center justify-center gap-2.5">
                  <StatIcon
                    className="h-4 w-4 shrink-0 text-[#00ff87]"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <p className="text-xs font-medium text-[#00ff87] text-center">{statText}</p>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {LIVE_STATS.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setStatIndex(i)}
                      className="cursor-pointer rounded-full transition-all duration-300"
                      style={{
                        width: i === statIndex ? '20px' : '6px',
                        height: '6px',
                        background: i === statIndex ? '#00ff87' : '#333',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <h1 className="text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
              Train like it counts.
              <br />
              <span className="text-[#00ff87]">Because it does.</span>
            </h1>

            <p className="mt-6 max-w-md text-sm leading-relaxed bg-white/5 rounded-lg p-4 md:text-base">
              Log workouts, track your streak, and get brutally honest AI coaching tailored to
              your actual data.
            </p>

            <div className="mt-10 flex w-full max-w-xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
              <button
                type="button"
                onClick={() => openModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00ff87] px-8 py-4 text-xs font-black uppercase tracking-wide text-black transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                Get started
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() =>
                  bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
                }
                className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Learn more
              </button>
            </div>

            <p className="mt-6 text-[10px] font-medium uppercase tracking-wider text-[#444]">
              Free to start .
            </p>

            <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:items-stretch">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00ff87] text-xs font-black text-black">
                  S
                </div>
                <div>
                  <p className="text-sm font-medium leading-snug text-black">
                    &ldquo;I haven&apos;t missed a workout in 47 days.&rdquo;
                  </p>
                  <p className="mt-0.5 text-xs text-[#555]">Sarah K. · Marathon runner</p>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#60a5fa] text-xs font-black text-black">
                  M
                </div>
                <div>
                  <p className="text-sm font-medium leading-snug text-black">
                    &ldquo;The AI coach actually calls me out. I love it.&rdquo;
                  </p>
                  <p className="mt-0.5 text-xs text-[#555]">Marcus T. · Gym enthusiast</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <div
          ref={bottomRef}
          className="h-px w-full bg-gradient-to-r from-transparent via-[#00ff87]/30 to-transparent"
        />
      </div>

      {showModal && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 bg-black/70"
          style={{ backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="absolute left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#1c1c1c] bg-[#0c0c0c] p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-5 top-5 rounded-lg p-1 text-[#666] transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>

            <div className="mb-6 text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white">
                FIT<span className="text-[#00ff87]">COACH</span> AI
              </p>
              <h2 id="auth-modal-title" className="mt-4 text-lg font-semibold text-white">
                {success
                  ? 'Check your email'
                  : isSignup
                    ? 'Create your account'
                    : 'Welcome back'}
              </h2>
            </div>

            {success ? (
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00ff87]/15 text-[#00ff87]">
                  <Check className="h-8 w-8" strokeWidth={2.5} />
                </div>
                <p className="text-sm text-[#666]">
                  We sent a confirmation link to{' '}
                  <span className="font-medium text-white">{email}</span>
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-2 text-sm text-[#00ff87] underline-offset-2 hover:underline"
                >
                  Close
                </button>
              </div>
            ) : isSignup ? (
              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <div
                    className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300"
                    role="alert"
                  >
                    {error}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label htmlFor="signup-email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="signup-password" className={labelClass}>
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#00ff87] py-3.5 text-xs font-black uppercase tracking-wide text-black disabled:opacity-60"
                >
                  {loading ? 'Loading...' : 'Create account'}
                  {!loading && <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />}
                </button>
                <p className="pt-2 text-center text-sm text-[#666]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="text-[#00ff87] underline-offset-2 hover:underline"
                    onClick={() => {
                      setIsSignup(false)
                      setError('')
                    }}
                  >
                    Sign in
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div
                    className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300"
                    role="alert"
                  >
                    {error}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label htmlFor="login-email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="login-password" className={labelClass}>
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#00ff87] py-3.5 text-xs font-black uppercase tracking-wide text-black disabled:opacity-60"
                >
                  {loading ? 'Loading...' : 'Sign in'}
                  {!loading && <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />}
                </button>
                <p className="pt-2 text-center text-sm text-[#666]">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    className="text-[#00ff87] underline-offset-2 hover:underline"
                    onClick={() => {
                      setIsSignup(true)
                      setError('')
                    }}
                  >
                    Sign up
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
