'use client'

import ActivityIcon from '@/components/ActivityIcon'
import type { Workout } from '@/lib/stats'
import type { Theme } from '@/lib/theme'

function rowAccent(theme: Theme, activity: string): string {
  if (theme === 'dark') {
    const m: Record<string, string> = {
      Running: 'border-l-[#00ff87]',
      Gym: 'border-l-[#60a5fa]',
      Yoga: 'border-l-[#f472b6]',
      Cycling: 'border-l-[#facc15]',
      Swimming: 'border-l-[#22d3ee]',
      Hiking: 'border-l-[#fb923c]',
      Football: 'border-l-[#a78bfa]',
    }
    return m[activity] ?? 'border-l-neutral-600'
  }
  const m: Record<string, string> = {
    Running: 'border-l-[#059669]',
    Gym: 'border-l-[#2563eb]',
    Yoga: 'border-l-[#db2777]',
    Cycling: 'border-l-[#ca8a04]',
    Swimming: 'border-l-[#0891b2]',
    Hiking: 'border-l-[#ea580c]',
    Football: 'border-l-[#7c3aed]',
  }
  return m[activity] ?? 'border-l-gray-400'
}

type Props = { workouts: Workout[]; theme: Theme }

export default function WorkoutList({ workouts, theme }: Props) {
  const border =
    theme === 'dark' ? 'border-[#1c1c1c]' : 'border-[#e5e7eb]'
  const cardBg =
    theme === 'dark' ? 'bg-[#0c0c0c]' : 'bg-white'
  const titleCls =
    theme === 'dark'
      ? 'text-xs font-bold uppercase tracking-widest text-[#333]'
      : 'text-xs font-bold uppercase tracking-widest text-gray-400'
  const rowBorder =
    theme === 'dark' ? 'border-[#1c1c1c]/80' : 'border-gray-100'
  const nameCls =
    theme === 'dark'
      ? 'text-sm font-semibold text-white'
      : 'text-sm font-semibold text-[#111827]'
  const dateCls =
    theme === 'dark' ? 'text-xs text-neutral-500' : 'text-xs text-gray-500'
  const durCls =
    theme === 'dark'
      ? 'text-sm font-bold tabular-nums text-[#00ff87]'
      : 'text-sm font-bold tabular-nums text-[#059669]'
  const emptyCls =
    theme === 'dark' ? 'text-sm text-neutral-500' : 'text-sm text-gray-500'
  const iconMuted =
    theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'

  if (workouts.length === 0) {
    return (
      <div
        className={`rounded-2xl border p-6 text-center transition-colors duration-200 ${border} ${cardBg}`}
      >
        <h2 className={`mb-2 ${titleCls}`}>Recent workouts</h2>
        <p className={emptyCls}>No workouts yet — log your first one!</p>
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl border p-6 transition-colors duration-200 ${border} ${cardBg}`}
    >
      <h2 className={`mb-4 ${titleCls}`}>Recent workouts</h2>
      <ul>
        {workouts.map((w) => (
          <li
            key={w.id}
            className={`border-b border-l-[3px] py-3 pl-3 transition-colors duration-200 last:border-b-0 ${rowAccent(theme, w.activity)} ${rowBorder}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className={`flex shrink-0 pt-0.5 ${iconMuted}`}>
                  <ActivityIcon activity={w.activity} className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <p className={nameCls}>{w.activity}</p>
                  <p className={dateCls}>{w.date}</p>
                </div>
              </div>
              <span className={durCls}>{w.duration} min</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
