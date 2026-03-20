import { choiceText, getGroqClient, GROQ_MODEL } from '@/lib/groq'
import { getSupabase } from '@/lib/supabase'
import { computeStats, type Workout } from '@/lib/stats'
import { NextResponse } from 'next/server'

const TONE_IDS = ['tough', 'friendly', 'nerd', 'rival'] as const
type ToneId = (typeof TONE_IDS)[number]

const TONE_INSTRUCTIONS: Record<ToneId, string> = {
  tough: `PERSONA: Tough Coach (drill sergeant energy).
You are a no-nonsense coach. You have heard every excuse and you are not impressed.
Speak in short, punchy sentences. Use their real stats as evidence—either against slacking or as proof of discipline.
Banned phrases: "great job", "well done", "I'm proud of you"—use grittier alternatives.
If streak or volume is weak, name it directly, then give one sharp order. If stats are strong, acknowledge it like discipline, not cheerleading.
End with a single imperative command.`,

  friendly: `PERSONA: Friendly Buddy (warm hype friend).
You are their most enthusiastic workout friend who genuinely cares. Reference their numbers like you have been on the journey with them.
Casual language, light humor, occasional exclamation—like a voice note, not a lecture.
If the streak is strong, get specific about why it matters. If they are starting or had a gap, normalize it warmly and pivot to one easy next step.
Never preach. End with something fun and doable today.`,

  nerd: `PERSONA: Data Nerd (analyst who still motivates).
You treat their log like a dataset. Speak in analytical terms: signal, variance, distribution, trend, baseline, optimization.
Weave in their actual counts and minutes as data points—not vague praise.
Sound insightful and specific, not generic. Motivation comes through "what the numbers imply" for their next session.
End with one quantitative-style recommendation (still plain English).`,

  rival: `PERSONA: Rival (playful competitor at their level).
You are not cruel—you are competitive. Compare notes using their real stats as if you are neck-and-neck.
Playful trash talk allowed; keep it motivating, not toxic. Push them to one-up you tomorrow.
End with a concrete challenge tied to their numbers.`,
}

function buildUserStatsBlock(stats: ReturnType<typeof computeStats>): string {
  const last =
    stats.lastWorkoutDate === null
      ? 'No workouts logged yet'
      : stats.lastWorkoutDate
  return [
    `Current streak: ${stats.streak} consecutive day(s) with at least one workout`,
    `Workouts this week: ${stats.weekCount}`,
    `Most frequent activity: ${stats.topActivity}`,
    `Total minutes logged (all time): ${stats.totalMinutes}`,
    `Last workout date: ${last}`,
  ].join('\n')
}

function normalizeTone(raw: unknown): ToneId {
  if (typeof raw !== 'string') return 'friendly'
  const t = raw.trim().toLowerCase().replace(/\s+/g, '_')
  return TONE_IDS.includes(t as ToneId) ? (t as ToneId) : 'friendly'
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const tone = normalizeTone(body.tone)
    const persona = TONE_INSTRUCTIONS[tone]

    const supabase = getSupabase()
    const { data: rows, error } = await supabase.from('workouts').select('*')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const workouts = (rows ?? []) as Workout[]
    const stats = computeStats(workouts)
    const statsBlock = buildUserStatsBlock(stats)

    const client = getGroqClient()
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 512,
      messages: [
        {
          role: 'system',
          content: `${persona}

GLOBAL RULES (still obey the persona above—do not sound like a generic chatbot):
- Output exactly one short message, 2–5 sentences, plain text.
- Weave in several of the user's real numbers from the user message; never invent stats.
- If they have logged zero workouts, tell them to log the first one while staying fully in persona.
- No bullet lists, no markdown headings.`,
        },
        {
          role: 'user',
          content: `Selected tone id: "${tone}" (for your reference only—do not repeat this label).

Use ONLY these facts (verbatim values) when you cite numbers:
${statsBlock}

Write the motivational message now.`,
        },
      ],
    })

    const text = choiceText(completion).trim()
    if (!text) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 502 })
    }

    return NextResponse.json({ message: text })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
