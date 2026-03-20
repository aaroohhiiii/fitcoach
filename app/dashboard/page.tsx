'use client'

import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import ChatWidget from '@/components/ChatWidget'
import MotivationCard from '@/components/MotivationCard'
import PrismBackground from '@/components/PrismBackground'
import StatsGrid from '@/components/StatsGrid'
import WorkoutForm from '@/components/WorkoutForm'
import WorkoutList from '@/components/WorkoutList'
import type { Workout } from '@/lib/stats'
import type { Theme } from '@/lib/theme'

export default function DashboardPage() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [weeklyPct, setWeeklyPct] = useState(0)
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pageBg =
    theme === 'dark' ? 'bg-[#080808]' : 'bg-[#f9fafb]'
  const navBorder =
    theme === 'dark' ? 'border-[#1c1c1c]' : 'border-[#e5e7eb]'
  const logoMain =
    theme === 'dark' ? 'text-white' : 'text-[#111827]'
  const logoAccent =
    theme === 'dark' ? 'text-[#00ff87]' : 'text-[#059669]'
  const modeLabel =
    theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'
  const toggleTrack =
    theme === 'dark'
      ? 'border border-[#1c1c1c] bg-[#0c0c0c]'
      : 'border border-[#e5e7eb] bg-gray-200'
  const toggleKnob =
    theme === 'dark'
      ? 'bg-[#00ff87] shadow-[0_0_12px_rgba(0,255,135,0.35)]'
      : 'bg-[#059669]'
  const loadText =
    theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'
  const errBanner =
    theme === 'dark'
      ? 'border border-red-900/40 bg-red-950/40 text-red-200'
      : 'border border-red-100 bg-red-50 text-red-800'

  useEffect(() => {
    let cancelled = false
    setLoadError('')
    fetch('/api/workouts')
      .then(async (r) => {
        const text = await r.text()
        let parsed: unknown = null
        if (text.trim()) {
          try {
            parsed = JSON.parse(text)
          } catch {
            /* non-JSON */
          }
        }
        if (!r.ok) {
          const msg =
            parsed &&
            typeof parsed === 'object' &&
            parsed !== null &&
            'error' in parsed &&
            typeof (parsed as { error: unknown }).error === 'string'
              ? (parsed as { error: string }).error
              : `Could not load workouts (${r.status})`
          throw new Error(msg)
        }
        return Array.isArray(parsed) ? (parsed as Workout[]) : []
      })
      .then((data) => {
        if (!cancelled) {
          setWorkouts(data)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setWorkouts([])
          setLoadError(e instanceof Error ? e.message : 'Failed to load workouts')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => setWeeklyPct(71))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  function showWorkoutToast() {
    setToastVisible(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2500)
  }

  function handleWorkoutAdded(newWorkout: Workout) {
    setWorkouts((prev) => [newWorkout, ...prev])
    showWorkoutToast()
  }

  return (
    <div className={`relative min-h-screen pb-28 transition-colors duration-200 ${pageBg}`}>
      <div className="absolute inset-0 w-full h-full">
        <PrismBackground />
      </div>

      <div className="relative z-10">
        <nav
          className={`border-b px-4 py-4 transition-colors duration-200 ${navBorder} ${
            theme === 'dark' ? 'bg-[#080808]' : 'bg-[#f9fafb]'
          }`}
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <h1
              className={`text-xs font-black uppercase tracking-[0.2em] sm:text-sm md:text-base ${logoMain}`}
            >
              FIT<span className={logoAccent}>COACH</span> AI
            </h1>
            <div className="flex items-center gap-3">
              <span
                className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 ${modeLabel}`}
              >
                {theme === 'dark' ? 'DARK' : 'LIGHT'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={theme === 'light'}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${toggleTrack}`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full transition-transform duration-200 ${
                    theme === 'light' ? 'translate-x-5' : 'translate-x-0'
                  } ${toggleKnob}`}
                />
              </button>
            </div>
          </div>
        </nav>

        <div
          className={`h-[3px] w-full overflow-hidden transition-colors duration-200 ${
            theme === 'dark' ? 'bg-[#1c1c1c]' : 'bg-[#e5e7eb]'
          }`}
        >
          <div
            className={`h-full transition-[width] duration-700 ease-out ${
              theme === 'dark' ? 'bg-[#00ff87]' : 'bg-[#059669]'
            }`}
            style={{ width: `${weeklyPct}%` }}
          />
        </div>

        <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
          {loading ? (
            <p className={`text-center text-sm transition-colors duration-200 ${loadText}`}>
              Loading your dashboard…
            </p>
          ) : (
            <>
              {loadError && (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm transition-colors duration-200 ${errBanner}`}
                  role="alert"
                >
                  {loadError}
                </div>
              )}
              <StatsGrid workouts={workouts} theme={theme} />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <WorkoutForm onWorkoutAdded={handleWorkoutAdded} theme={theme} />
                <WorkoutList workouts={workouts} theme={theme} />
              </div>
              <MotivationCard theme={theme} />
            </>
          )}
        </div>

        <div
          className={`pointer-events-none fixed bottom-24 right-6 z-[60] rounded-xl border px-4 py-3 text-sm font-bold transition-all duration-300 ${
            toastVisible
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'translate-y-8 opacity-0'
          } ${
            theme === 'dark'
              ? 'border-[#00ff87] bg-[#0c0c0c] text-[#00ff87]'
              : 'border-[#059669] bg-white text-[#059669]'
          }`}
          role="status"
          aria-live="polite"
        >
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
            Workout logged!
          </span>
        </div>

        <ChatWidget theme={theme} />
      </div>
    </div>
  )
}
