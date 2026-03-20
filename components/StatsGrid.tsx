'use client'

import { useEffect, useState } from 'react'
import {
  CalendarDays,
  Flame,
  type LucideIcon,
  Timer,
  Trophy,
} from 'lucide-react'
import { computeStats, type Workout } from '@/lib/stats'
import type { Theme } from '@/lib/theme'

function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    setValue(0)
    let start: number | null = null
    let raf = 0
    const ease = (t: number) => 1 - (1 - t) ** 3
    const tick = (now: number) => {
      if (start === null) start = now
      const t = Math.min((now - start) / duration, 1)
      setValue(Math.round(target * ease(t)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

const cards: {
  key: 'streak' | 'weekCount' | 'topActivity' | 'totalMinutes'
  label: string
  Icon: LucideIcon
}[] = [
  { key: 'streak', label: 'Streak', Icon: Flame },
  { key: 'weekCount', label: 'This Week', Icon: CalendarDays },
  { key: 'topActivity', label: 'Top Activity', Icon: Trophy },
  { key: 'totalMinutes', label: 'Total Mins', Icon: Timer },
]

function statValueClass(
  theme: Theme,
  kind: 'streak' | 'week' | 'top' | 'mins',
): string {
  if (theme === 'dark') {
    if (kind === 'streak') return 'text-[#00ff87]'
    if (kind === 'week') return 'text-[#60a5fa]'
    if (kind === 'top') return 'text-[#f59e0b]'
    return 'text-[#f472b6]'
  }
  if (kind === 'streak') return 'text-[#059669]'
  if (kind === 'week') return 'text-[#2563eb]'
  if (kind === 'top') return 'text-[#d97706]'
  return 'text-[#db2777]'
}

type Props = { workouts: Workout[]; theme: Theme }

export default function StatsGrid({ workouts, theme }: Props) {
  const stats = computeStats(workouts)
  const streakN = useCountUp(stats.streak)
  const weekN = useCountUp(stats.weekCount)
  const minsN = useCountUp(stats.totalMinutes)

  const border =
    theme === 'dark' ? 'border-[#1c1c1c]' : 'border-[#e5e7eb]'
  const cardBg =
    theme === 'dark' ? 'bg-[#0c0c0c]' : 'bg-white'
  const labelMuted =
    theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'
  const hintMuted =
    theme === 'dark' ? 'text-neutral-600' : 'text-gray-500'

  const values = {
    streak: streakN,
    weekCount: weekN,
    topActivity: stats.topActivity,
    totalMinutes: minsN,
  }

  return (
    <div className="space-y-3 transition-colors duration-200">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card) => {
          const { Icon } = card
          const kind =
            card.key === 'streak'
              ? 'streak'
              : card.key === 'weekCount'
                ? 'week'
                : card.key === 'topActivity'
                  ? 'top'
                  : 'mins'
          const display =
            card.key === 'topActivity'
              ? String(values.topActivity)
              : String(values[card.key])

          return (
            <div
              key={card.key}
              className={`rounded-2xl border p-6 transition-colors duration-200 ${border} ${cardBg}`}
            >
              <p
                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${labelMuted}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                {card.label}
              </p>
              <p
                className={`mt-2 text-3xl font-black tabular-nums transition-colors duration-200 ${statValueClass(theme, kind)}`}
              >
                {display}
              </p>
            </div>
          )
        })}
      </div>
      {workouts.length === 0 && (
        <p
          className={`text-center text-sm transition-colors duration-200 ${hintMuted}`}
        >
          Log a workout to light up your streak and weekly stats.
        </p>
      )}
    </div>
  )
}
