import { v0, type MessagesSendStreamData } from 'v0'
import {
  modelConfiguration,
  streamOptions,
  v0ErrorResponse,
} from '@/lib/v0-config'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params
  const body = (await request.json()) as MessagesSendStreamData['body']
  try {
    const result = await v0.messages.sendStream(
      {
        chatId,
        ...body,
        modelConfiguration,
      },
      streamOptions(request),
    )
    return result.toResponse()
  } catch (error) {
    return v0ErrorResponse(error)
  }
}
