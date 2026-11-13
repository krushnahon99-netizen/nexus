import { v0 } from 'v0'
import { streamOptions, toStreamResponse, v0ErrorResponse } from '@/lib/v0-config'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params
  const { options, state } = streamOptions(request)
  try {
    const result = await v0.chats.resume({ chatId }, options)
    return await toStreamResponse(result, state)
  } catch (error) {
    return v0ErrorResponse(state.failure ?? error)
  }
}
