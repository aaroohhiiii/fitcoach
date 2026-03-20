import OpenAI from 'openai'

/**
 * Groq exposes an OpenAI-compatible HTTP API.
 * Keys: https://console.groq.com/keys
 */
export function getGroqClient(): OpenAI {
  const apiKey =
    process.env.GROQ_API_KEY?.trim() ||
    process.env.XAI_API_KEY?.trim() ||
    process.env.GROK_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      'Missing GROQ_API_KEY. Create a key at https://console.groq.com/keys and add it to .env.local.',
    )
  }
  const baseURL =
    process.env.GROQ_API_BASE?.trim() || 'https://api.groq.com/openai/v1'
  return new OpenAI({ apiKey, baseURL })
}

/** Override with GROQ_MODEL in .env.local (see Groq docs for current model ids). */
export const GROQ_MODEL =
  process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile'

export function choiceText(completion: OpenAI.Chat.ChatCompletion): string {
  const raw = completion.choices[0]?.message?.content
  if (raw == null) return ''
  return typeof raw === 'string' ? raw : ''
}
