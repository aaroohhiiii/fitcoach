'use client'

import { useState } from 'react'
import {
  ArrowRight,
  ChartColumn,
  Flame,
  type LucideIcon,
  Smile,
  Swords,
} from 'lucide-react'
import type { Theme } from '@/lib/theme'

type ToneId = 'tough' | 'friendly' | 'nerd' | 'rival'

const TONES: { id: ToneId; label: string; Icon: LucideIcon }[] = [
  { id: 'tough', label: 'Tough Coach', Icon: Flame },
  { id: 'friendly', label: 'Friendly Buddy', Icon: Smile },
  { id: 'nerd', label: 'Data Nerd', Icon: ChartColumn },
  { id: 'rival', label: 'Rival', Icon: Swords },
]

type Props = { theme: Theme }

export default function MotivationCard({ theme }: Props) {
  const [tone, setTone] = useState<ToneId>('tough')
  const [message, setMessage] = useState('')
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
  const inactive =
    theme === 'dark'
      ? 'border border-[#1c1c1c] bg-[#0c0c0c] text-neutral-500 hover:border-neutral-600'
      : 'border border-[#e5e7eb] bg-[#f9fafb] text-gray-500 hover:border-gray-300'
  const active =
    theme === 'dark'
      ? 'border border-[#00ff87] bg-[#00ff87] text-black'
      : 'border border-[#059669] bg-[#059669] text-black'
  const btnBg =
    theme === 'dark'
      ? 'bg-[#00ff87] text-black hover:bg-[#00e67a]'
      : 'bg-[#059669] text-black hover:bg-[#047857]'
  const msgBorder =
    theme === 'dark' ? 'border-l-[#00ff87]' : 'border-l-[#059669]'
  const msgText =
    theme === 'dark' ? 'text-neutral-300' : 'text-gray-600'
  const skel =
    theme === 'dark' ? 'bg-[#1c1c1c]' : 'bg-gray-200'
  const errCls =
    theme === 'dark' ? 'text-sm text-red-400' : 'text-sm text-red-600'

  async function handleMotivate() {
    setError('')
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/motivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Request failed')
      }
      setMessage(typeof data.message === 'string' ? data.message : '')
    } catch (e) {
      setMessage('')
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className={`space-y-4 rounded-2xl border p-6 transition-colors duration-200 ${border} ${cardBg}`}
    >
      <h2 className={titleCls}>AI motivation</h2>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TONES.map((t) => {
          const { Icon } = t
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTone(t.id)}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide transition-colors duration-200 sm:text-xs ${
                tone === t.id ? active : inactive
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
              {t.label}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={handleMotivate}
        disabled={loading}
        className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-xs font-black uppercase tracking-widest transition-colors duration-200 disabled:opacity-50 ${btnBg}`}
      >
        {loading ? (
          'Loading…'
        ) : (
          <>
            Get Motivation
            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
          </>
        )}
      </button>

      {error && (
        <p className={errCls} role="alert">
          {error}
        </p>
      )}

      {loading && (
        <div
          className={`space-y-2 rounded-xl border p-4 ${border} animate-pulse`}
          aria-busy
        >
          <div className={`h-3 rounded ${skel} w-full`} />
          <div className={`h-3 rounded ${skel} w-4/5`} />
          <div className={`h-3 rounded ${skel} w-3/5`} />
        </div>
      )}

      {!loading && message && (
        <div
          className={`rounded-xl border border-transparent border-l-[2px] py-3 pl-4 transition-colors duration-200 ${msgBorder} ${
            theme === 'dark' ? 'bg-[#080808]' : 'bg-gray-50'
          }`}
        >
          <p className={`text-sm leading-relaxed transition-colors duration-200 ${msgText}`}>
            {message}
          </p>
        </div>
      )}
    </section>
  )
}
