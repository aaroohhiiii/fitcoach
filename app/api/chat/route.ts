import { choiceText, getGroqClient, GROQ_MODEL } from '@/lib/groq'
import { rowToChatMessage, type ChatMessage } from '@/lib/chat'
import { getSupabase } from '@/lib/supabase'
import { computeStats, type Workout } from '@/lib/stats'
import { NextResponse } from 'next/server'

const HISTORY_LIMIT = 40

function fitnessContextBlock(workouts: Workout[]): string {
  const stats = computeStats(workouts)
  const last =
    stats.lastWorkoutDate === null ? 'none yet' : stats.lastWorkoutDate
  return `User workout summary (use only as context; they may ask about it):
- Streak: ${stats.streak} day(s)
- Workouts this week: ${stats.weekCount}
- Top activity: ${stats.topActivity}
- Total minutes logged: ${stats.totalMinutes}
- Last workout date: ${last}`
}

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('chat_history')
      .select('id, role, content, created_at')
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const messages: ChatMessage[] = []
    for (const row of data ?? []) {
      const m = rowToChatMessage(row)
      if (m) messages.push(m)
    }

    return NextResponse.json(messages)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const raw = typeof body.message === 'string' ? body.message.trim() : ''
    if (!raw) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data: insertedUser, error: insertUserError } = await supabase
      .from('chat_history')
      .insert([{ role: 'user', content: raw }])
      .select('id, role, content, created_at')
      .single()

    if (insertUserError) {
      return NextResponse.json({ error: insertUserError.message }, { status: 500 })
    }

    const userMsg = rowToChatMessage(insertedUser)
    if (!userMsg) {
      return NextResponse.json({ error: 'Invalid user message row' }, { status: 500 })
    }

    const { data: historyRows, error: histError } = await supabase
      .from('chat_history')
      .select('role, content')
      .order('created_at', { ascending: false })
      .limit(HISTORY_LIMIT)

    if (histError) {
      return NextResponse.json({ error: histError.message }, { status: 500 })
    }

    const chronological = [...(historyRows ?? [])].reverse()

    const apiMessages = chronological
      .filter((r) => r.role === 'user' || r.role === 'assistant')
      .map((r) => ({
        role: r.role as 'user' | 'assistant',
        content: r.content,
      }))

    const { data: workoutRows, error: wErr } = await supabase
      .from('workouts')
      .select('*')

    if (wErr) return NextResponse.json({ error: wErr.message }, { status: 500 })

    const workouts = (workoutRows ?? []) as Workout[]
    const context = fitnessContextBlock(workouts)

    const client = getGroqClient()
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: `You are FitCoach AI, a concise fitness coach inside a workout tracking web app. Users log activities like Running, Cycling, Gym, Yoga, etc.

${context}

Rules:
- Give practical training, recovery, and habit advice. Keep replies focused; prefer short paragraphs over walls of text.
- Do not diagnose medical conditions or replace a doctor; encourage professional help when appropriate.
- If they ask something non-fitness, answer briefly then gently steer back to movement and health.`,
        },
        ...apiMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    })

    const reply = choiceText(completion).trim()
    if (!reply) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 502 })
    }

    const { data: insertedAssistant, error: insertAsstError } = await supabase
      .from('chat_history')
      .insert([{ role: 'assistant', content: reply }])
      .select('id, role, content, created_at')
      .single()

    if (insertAsstError) {
      return NextResponse.json({ error: insertAsstError.message }, { status: 500 })
    }

    const assistantMsg = rowToChatMessage(insertedAssistant)
    if (!assistantMsg) {
      return NextResponse.json({ error: 'Invalid assistant message row' }, { status: 500 })
    }

    return NextResponse.json({ userMessage: userMsg, assistantMessage: assistantMsg })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
