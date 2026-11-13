import { v0, type MessagesSendStreamData } from 'v0'
import {
  modelConfiguration,
  streamOptions,
  toStreamResponse,
  v0ErrorResponse,
} from '@/lib/v0-config'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params
  const body = (await request.json()) as MessagesSendStreamData['body']
  const { options, state } = streamOptions(request)
  try {
    const result = await v0.messages.sendStream(
      {
        chatId,
        ...body,
        modelConfiguration,
      },
      options,
    )
    return await toStreamResponse(result, state)
  } catch (error) {
    return v0ErrorResponse(state.failure ?? error)
  }
}
