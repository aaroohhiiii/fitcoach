'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import type { ChatMessage } from '@/lib/chat'
import type { Theme } from '@/lib/theme'

type Props = { theme: Theme }

export default function ChatWidget({ theme }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadError, setLoadError] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  const border =
    theme === 'dark' ? 'border-[#1c1c1c]' : 'border-[#e5e7eb]'
  const panelBg =
    theme === 'dark' ? 'bg-[#0c0c0c]' : 'bg-white'
  const headerBorder =
    theme === 'dark' ? 'border-[#1c1c1c]' : 'border-[#e5e7eb]'
  const logoMain =
    theme === 'dark' ? 'text-white' : 'text-[#111827]'
  const logoAccent =
    theme === 'dark' ? 'text-[#00ff87]' : 'text-[#059669]'
  const subCls =
    theme === 'dark' ? 'text-[10px] text-neutral-500' : 'text-[10px] text-gray-500'
  const userBubble =
    theme === 'dark'
      ? 'bg-[#00ff87] text-black'
      : 'bg-[#059669] text-black'
  const aiBubble =
    theme === 'dark'
      ? 'border border-[#1c1c1c] bg-[#080808] text-neutral-300'
      : 'border border-[#e5e7eb] bg-gray-50 text-gray-700'
  const inputCls =
    theme === 'dark'
      ? `min-w-0 flex-1 rounded-lg border ${border} bg-[#080808] px-3 py-2 text-sm text-white transition-colors duration-200 focus:border-[#00ff87] focus:outline-none focus:ring-1 focus:ring-[#00ff87]`
      : `min-w-0 flex-1 rounded-lg border ${border} bg-[#f9fafb] px-3 py-2 text-sm text-[#111827] transition-colors duration-200 focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]`
  const sendBtn =
    theme === 'dark'
      ? 'rounded-lg bg-[#00ff87] px-3 py-2 text-xs font-black uppercase tracking-wider text-black transition-colors duration-200 hover:bg-[#00e67a] disabled:opacity-50'
      : 'rounded-lg bg-[#059669] px-3 py-2 text-xs font-black uppercase tracking-wider text-black transition-colors duration-200 hover:bg-[#047857] disabled:opacity-50'
  const fabBg =
    theme === 'dark'
      ? 'bg-[#00ff87] text-black hover:bg-[#00e67a]'
      : 'bg-[#059669] text-black hover:bg-[#047857]'
  const typingBg =
    theme === 'dark' ? 'border border-[#1c1c1c] bg-[#080808]' : 'border border-[#e5e7eb] bg-gray-50'
  const dotColor =
    theme === 'dark' ? 'bg-[#00ff87]' : 'bg-[#059669]'

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!open) return
    scrollToBottom()
  }, [messages, open, sending, scrollToBottom])

  useEffect(() => {
    let cancelled = false
    setLoadingList(true)
    setLoadError('')
    fetch('/api/chat')
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) {
          throw new Error(typeof data.error === 'string' ? data.error : 'Failed to load chat')
        }
        return Array.isArray(data) ? (data as ChatMessage[]) : []
      })
      .then((list) => {
        if (!cancelled) {
          setMessages(list)
          setLoadingList(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load chat')
          setLoadingList(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setSendError('')
    setSending(true)
    setInput('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Send failed')
      }
      const user = data.userMessage as ChatMessage | undefined
      const assistant = data.assistantMessage as ChatMessage | undefined
      if (user && assistant) {
        setMessages((prev) => [...prev, user, assistant])
      }
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Send failed')
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div
          className={`flex h-[420px] w-[320px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border shadow-2xl transition-colors duration-200 ${border} ${panelBg}`}
          role="dialog"
          aria-label="FitCoach chat"
        >
          <div
            className={`flex shrink-0 items-center justify-between border-b px-4 py-3 transition-colors duration-200 ${headerBorder}`}
          >
            <div>
              <p className={`text-xs font-black uppercase tracking-[0.15em] ${logoMain}`}>
                FIT
                <span className={logoAccent}>COACH</span> AI
              </p>
           
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`rounded-lg p-2 text-sm transition-colors duration-200 ${
                theme === 'dark'
                  ? 'text-neutral-400 hover:bg-[#1c1c1c]'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            {loadingList ? (
              <p
                className={`py-8 text-center text-sm transition-colors duration-200 ${
                  theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'
                }`}
              >
                Loading conversation…
              </p>
            ) : loadError ? (
              <p
                className={`rounded-lg border px-3 py-2 text-sm ${
                  theme === 'dark'
                    ? 'border-red-900/50 bg-red-950/30 text-red-300'
                    : 'border-red-100 bg-red-50 text-red-700'
                }`}
                role="alert"
              >
                {loadError}
              </p>
            ) : messages.length === 0 && !sending ? (
              <p
                className={`py-8 text-center text-sm transition-colors duration-200 ${
                  theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'
                }`}
              >
                Ask about training, recovery, or streaks.
              </p>
            ) : (
              <ul className="space-y-3">
                {messages.map((m) => (
                  <li
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed transition-colors duration-200 ${
                        m.role === 'user' ? userBubble : aiBubble
                      }`}
                    >
                      {m.content}
                    </div>
                  </li>
                ))}
                {sending && (
                  <li className="flex justify-start">
                    <div
                      className={`flex items-center gap-1.5 rounded-2xl px-4 py-3 transition-colors duration-200 ${typingBg}`}
                      aria-label="Coach is typing"
                    >
                      <span className={`chat-dot inline-block h-2 w-2 rounded-full ${dotColor}`} />
                      <span className={`chat-dot inline-block h-2 w-2 rounded-full ${dotColor}`} />
                      <span className={`chat-dot inline-block h-2 w-2 rounded-full ${dotColor}`} />
                    </div>
                  </li>
                )}
                <div ref={endRef} />
              </ul>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className={`shrink-0 border-t p-3 transition-colors duration-200 ${headerBorder}`}
          >
            {sendError && (
              <p
                className={`mb-2 text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}
                role="alert"
              >
                {sendError}
              </p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={sending ? 'Waiting…' : 'Message…'}
                disabled={sending || loadingList || !!loadError}
                className={inputCls}
                aria-label="Message"
              />
              <button
                type="submit"
                disabled={sending || !input.trim() || loadingList || !!loadError}
                className={sendBtn}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors duration-200 ${fabBg}`}
        aria-expanded={open}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <X className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        ) : (
          <MessageCircle className="h-5 w-5 opacity-90" strokeWidth={2.25} aria-hidden />
        )}
      </button>
    </div>
  )
}
