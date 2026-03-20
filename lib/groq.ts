export type GroqChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

function getGroqCredentials(): { apiKey: string; baseURL: string } {
  const apiKey =
    process.env.GROQ_API_KEY?.trim() ||
    process.env.XAI_API_KEY?.trim() ||
    process.env.GROK_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      'Missing GROQ_API_KEY. Create a key at https://console.groq.com/keys and add it in Vercel env (or .env.local).',
    )
  }
  const baseURL =
    process.env.GROQ_API_BASE?.trim() || 'https://api.groq.com/openai/v1'
  return { apiKey, baseURL: baseURL.replace(/\/$/, '') }
}

/** Groq OpenAI-compatible model id; override with GROQ_MODEL in env. */
export const GROQ_MODEL =
  process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile'

function parseAssistantText(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  const choices = (data as { choices?: unknown }).choices
  if (!Array.isArray(choices) || choices.length === 0) return ''
  const first = choices[0] as { message?: { content?: unknown } }
  const raw = first?.message?.content
  if (raw == null) return ''
  return typeof raw === 'string' ? raw : ''
}

/**
 * Calls Groq's POST /v1/chat/completions (OpenAI-compatible). No `openai` npm package required.
 */
export async function groqChatCompletion(params: {
  model: string
  max_tokens: number
  messages: GroqChatMessage[]
}): Promise<string> {
  const { apiKey, baseURL } = getGroqCredentials()
  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      max_tokens: params.max_tokens,
      messages: params.messages,
    }),
  })

  const bodyText = await res.text()
  let parsed: unknown
  try {
    parsed = bodyText ? JSON.parse(bodyText) : null
  } catch {
    throw new Error(`Groq returned non-JSON (HTTP ${res.status})`)
  }

  if (!res.ok) {
    const detail =
      parsed &&
      typeof parsed === 'object' &&
      parsed !== null &&
      'error' in parsed
        ? JSON.stringify((parsed as { error: unknown }).error)
        : bodyText.slice(0, 200)
    throw new Error(`Groq API error ${res.status}: ${detail}`)
  }

  return parseAssistantText(parsed)
}

/** OpenAI-style response shape for legacy `choiceText(completion)`. */
export function choiceText(completion: unknown): string {
  return parseAssistantText(completion)
}

/**
 * Minimal OpenAI-client-shaped wrapper so older routes can keep
 * `client.chat.completions.create(...)` + `choiceText(completion)`.
 */
export function getGroqClient() {
  return {
    chat: {
      completions: {
        create: async (params: {
          model: string
          max_tokens: number
          messages: GroqChatMessage[]
        }) => {
          const content = await groqChatCompletion(params)
          return {
            choices: [
              { message: { role: 'assistant' as const, content } },
            ],
          }
        },
      },
    },
  }
}
