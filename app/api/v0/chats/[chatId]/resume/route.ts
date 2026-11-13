import { v0 } from 'v0'
import { streamOptions, v0ErrorResponse } from '@/lib/v0-config'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params
  try {
    const result = await v0.chats.resume({ chatId }, streamOptions(request))
    return result.toResponse()
  } catch (error) {
    return v0ErrorResponse(error)
  }
}
