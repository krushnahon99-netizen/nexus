import { v0, type ChatsCreateStreamData } from 'v0'
import {
  chatPrivacy,
  modelConfiguration,
  streamOptions,
  systemPrompt,
  v0ErrorResponse,
} from '@/lib/v0-config'

export async function POST(request: Request) {
  const body = (await request.json()) as ChatsCreateStreamData['body']
  try {
    const result = await v0.chats.createStream(
      {
        ...body,
        systemPrompt,
        modelConfiguration,
        privacy: chatPrivacy,
      },
      streamOptions(request),
    )
    return result.toResponse()
  } catch (error) {
    return v0ErrorResponse(error)
  }
}
