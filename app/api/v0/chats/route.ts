import { v0, type ChatsCreateStreamData } from 'v0'
import {
  chatPrivacy,
  modelConfiguration,
  streamOptions,
  systemPrompt,
  toStreamResponse,
  v0ErrorResponse,
} from '@/lib/v0-config'

export async function POST(request: Request) {
  const body = (await request.json()) as ChatsCreateStreamData['body']
  const { options, state } = streamOptions(request)
  try {
    const result = await v0.chats.createStream(
      {
        ...body,
        systemPrompt,
        modelConfiguration,
        privacy: chatPrivacy,
      },
      options,
    )
    return await toStreamResponse(result, state)
  } catch (error) {
    return v0ErrorResponse(state.failure ?? error)
  }
}
