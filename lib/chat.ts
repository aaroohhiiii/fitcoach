export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export function rowToChatMessage(row: {
  id: string
  role: string
  content: string
  created_at: string
}): ChatMessage | null {
  if (row.role !== 'user' && row.role !== 'assistant') return null
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    created_at: row.created_at,
  }
}
