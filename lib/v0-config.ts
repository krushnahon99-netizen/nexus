export const MODEL_ID = 'anthropic/claude-sonnet-5.5'

export const modelConfiguration = {
  modelId: MODEL_ID,
  imageGenerations: false,
}

export const systemPrompt =
  'You are being used as a plain chat assistant inside a custom chat app. Answer the user directly in text. Do not create, edit, or run any files, apps, or projects unless the user explicitly asks you to build something.'

// Without V0_API_KEY the SDK authenticates with the project's Vercel OIDC token,
// and the v0 API only lets OIDC principals create 'team' or 'team-edit' chats.
export const chatPrivacy: 'private' | 'team' = process.env.V0_API_KEY
  ? 'private'
  : 'team'

export function v0ErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'v0 API request failed'
  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number'
      ? error.status
      : 500
  console.error('[v0] API error:', message)
  return Response.json({ error: message }, { status })
}
