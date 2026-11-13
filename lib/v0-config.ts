export const MODEL_ID = 'anthropic/claude-sonnet-5.5'

export const modelConfiguration = {
  modelId: MODEL_ID,
  imageGenerations: false,
}

export const systemPrompt =
  'You are being used as a plain chat assistant inside a custom chat app. Answer the user directly in text. Do not create, edit, or run any files, apps, or projects unless the user explicitly asks you to build something.'

// Without V0_API_KEY the SDK authenticates with the project's Vercel OIDC token,
// and the v0 API only lets OIDC principals create 'team' or 'team-edit' chats.
// 'team-edit' keeps follow-up messages writable for the project principal.
export const chatPrivacy: 'private' | 'team-edit' = process.env.V0_API_KEY
  ? 'private'
  : 'team-edit'

type ApiFailure = { status: number; message: string }

type StreamState = { failure?: ApiFailure }

async function readErrorMessage(response: Response) {
  const text = await response.text().catch(() => '')
  try {
    const data = JSON.parse(text) as { message?: unknown; error?: unknown }
    if (typeof data.message === 'string') return data.message
    if (typeof data.error === 'string') return data.error
  } catch {}
  return text || response.statusText || `v0 API responded with ${response.status}`
}

function describeFailure({ status, message }: ApiFailure) {
  const usingOidc = !process.env.V0_API_KEY
  if (usingOidc && (status === 401 || status === 403 || status >= 500)) {
    return `${message} (HTTP ${status}). The v0 API rejected this project's Vercel OIDC token. Add a V0_API_KEY environment variable from https://v0.app/chat/settings/keys.`
  }
  return `${message} (HTTP ${status})`
}

// The SDK's SSE client retries failed requests forever by default, which turns
// API errors (out of credits, forbidden) into a request that never finishes.
// It also drops the API's error body, so a wrapped fetch records it.
export function streamOptions(request: Request) {
  const state: StreamState = {}
  const options = {
    sseMaxRetryAttempts: 1,
    signal: request.signal,
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await fetch(input, init)
      if (!response.ok) {
        state.failure = {
          status: response.status,
          message: await readErrorMessage(response.clone()),
        }
      }
      return response
    }) as typeof fetch,
  }
  return { options, state }
}

// Waits for the first event so an API failure becomes a JSON error with the
// real status instead of a generic "stream ended" event inside a 200 response.
export async function toStreamResponse(
  result: { toResponse(): Response },
  state: StreamState,
) {
  const response = result.toResponse()
  if (!response.body) return response
  const reader = response.body.getReader()
  const first = await reader.read()

  if (state.failure) {
    await reader.cancel().catch(() => {})
    return v0ErrorResponse(state.failure)
  }

  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      if (first.done) controller.close()
      else controller.enqueue(first.value)
    },
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) controller.close()
      else controller.enqueue(value)
    },
    cancel(reason) {
      return reader.cancel(reason)
    },
  })
  return new Response(body, { status: response.status, headers: response.headers })
}

export function v0ErrorResponse(error: unknown) {
  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number'
      ? error.status
      : 500
  const rawMessage =
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
      ? error.message
      : 'v0 API request failed'
  const message = describeFailure({ status, message: rawMessage })
  console.error('[v0] API error:', message)
  return Response.json({ error: message, message }, { status })
}
