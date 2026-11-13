import { v0, type MessagesSendStreamData } from 'v0'
import { modelConfiguration } from '@/lib/v0-config'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params
  const body = (await request.json()) as MessagesSendStreamData['body']
  const result = await v0.messages.sendStream({
    chatId,
    ...body,
    modelConfiguration,
  })

  return result.toResponse()
}
