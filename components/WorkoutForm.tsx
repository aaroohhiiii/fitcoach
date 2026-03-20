'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import ActivityIcon, { ACTIVITY_ORDER, type ActivityName } from '@/components/ActivityIcon'
import type { Workout } from '@/lib/stats'
import type { Theme } from '@/lib/theme'

const today = () => new Date().toISOString().split('T')[0]

type Props = { onWorkoutAdded: (workout: Workout) => void; theme: Theme }

export default function WorkoutForm({ onWorkoutAdded, theme }: Props) {
  const [activity, setActivity] = useState<ActivityName>('Running')
  const [duration, setDuration] = useState('')
  const [date, setDate] = useState(today())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const border =
    theme === 'dark' ? 'border-[#1c1c1c]' : 'border-[#e5e7eb]'
  const cardBg =
    theme === 'dark' ? 'bg-[#0c0c0c]' : 'bg-white'
  const titleCls =
    theme === 'dark'
      ? 'text-xs font-bold uppercase tracking-widest text-[#333]'
      : 'text-xs font-bold uppercase tracking-widest text-gray-400'
  const labelCls =
    theme === 'dark' ? 'text-sm text-neutral-400' : 'text-sm text-gray-600'
  const fieldCls =
    theme === 'dark'
      ? `w-full rounded-lg border ${border} bg-[#080808] py-2 pl-10 pr-3 text-sm text-white transition-colors duration-200 focus:border-[#00ff87] focus:outline-none focus:ring-1 focus:ring-[#00ff87]`
      : `w-full rounded-lg border ${border} bg-[#f9fafb] py-2 pl-10 pr-3 text-sm text-[#111827] transition-colors duration-200 focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]`
  const iconWrap =
    theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
  const btnBg =
    theme === 'dark'
      ? 'bg-[#00ff87] text-black hover:bg-[#00e67a]'
      : 'bg-[#059669] text-black hover:bg-[#047857]'
  const errCls =
    theme === 'dark' ? 'text-red-400 text-sm' : 'text-red-600 text-sm'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!duration || Number(duration) <= 0) {
      setError('Please enter a valid duration')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity, duration: Number(duration), date }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onWorkoutAdded(data)
      setDuration('')
      setDate(today())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 rounded-2xl border p-6 transition-colors duration-200 ${border} ${cardBg}`}
    >
      <h2 className={titleCls}>Workout log</h2>

      <div className="space-y-1">
        <label className={labelCls}>Activity</label>
        <div className="relative">
          <span
            className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${iconWrap}`}
          >
            <ActivityIcon activity={activity} className="h-4 w-4" strokeWidth={2} />
          </span>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as ActivityName)}
            className={fieldCls}
          >
            {ACTIVITY_ORDER.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Duration (minutes)</label>
        <input
          type="number"
          min={1}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g. 30"
          className={
            theme === 'dark'
              ? `w-full rounded-lg border ${border} bg-[#080808] px-3 py-2 text-sm text-white transition-colors duration-200 focus:border-[#00ff87] focus:outline-none focus:ring-1 focus:ring-[#00ff87]`
              : `w-full rounded-lg border ${border} bg-[#f9fafb] px-3 py-2 text-sm text-[#111827] transition-colors duration-200 focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]`
          }
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Date</label>
        <input
          type="date"
          value={date}
          max={today()}
          onChange={(e) => setDate(e.target.value)}
          className={
            theme === 'dark'
              ? `w-full rounded-lg border ${border} bg-[#080808] px-3 py-2 text-sm text-white transition-colors duration-200 focus:border-[#00ff87] focus:outline-none focus:ring-1 focus:ring-[#00ff87]`
              : `w-full rounded-lg border ${border} bg-[#f9fafb] px-3 py-2 text-sm text-[#111827] transition-colors duration-200 focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]`
          }
        />
      </div>

      {error && <p className={errCls}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-xs font-black uppercase tracking-widest transition-colors duration-200 disabled:opacity-50 ${btnBg}`}
      >
        {loading ? (
          'Logging…'
        ) : (
          <>
            Log workout
            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
          </>
        )}
      </button>
    </form>
  )
}
