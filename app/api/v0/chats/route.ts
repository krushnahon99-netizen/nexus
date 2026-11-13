import { v0, type ChatsCreateStreamData } from 'v0'
import { modelConfiguration, systemPrompt } from '@/lib/v0-config'

export async function POST(request: Request) {
  const body = (await request.json()) as ChatsCreateStreamData['body']
  const result = await v0.chats.createStream({
    ...body,
    systemPrompt,
    modelConfiguration,
    privacy: 'private',
  })

  return result.toResponse()
}
