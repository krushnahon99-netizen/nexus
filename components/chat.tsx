'use client'

import { useChat } from '@ai-sdk/react'
import { V0Transport, type V0UIMessage } from '@v0-sdk/react'
import { useState } from 'react'

export function Chat() {
  const [input, setInput] = useState('')
  const [transport] = useState(
    () =>
      new V0Transport({
        urls: {
          create: '/api/v0/chats',
          send: (chatId) => `/api/v0/chats/${chatId}/messages`,
          resume: (chatId) => `/api/v0/chats/${chatId}/resume`,
        },
      }),
  )
  const { messages, sendMessage, status, error } = useChat<V0UIMessage>({ transport })
  const isBusy = status === 'submitted' || status === 'streaming'

  function submit() {
    const text = input.trim()
    if (!text || isBusy) return
    sendMessage({ text })
    setInput('')
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4">
      <header className="border-b py-3">
        <h1 className="text-sm font-medium">GPT-6 Luna test</h1>
      </header>

      <div className="flex flex-1 flex-col gap-4 py-4" aria-live="polite">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">Send a message to test the connection.</p>
        )}
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {message.role === 'user' ? 'You' : 'v0 (GPT-6 Luna)'}
            </span>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.parts.map((part, i) =>
                part.type === 'text' ? <span key={`${message.id}-${i}`}>{part.text}</span> : null,
              )}
            </div>
          </div>
        ))}
        {status === 'submitted' && <p className="text-sm text-muted-foreground">Thinking...</p>}
        {error && <p className="text-sm text-destructive">Error: {error.message}</p>}
      </div>

      <form
        className="sticky bottom-0 flex gap-2 border-t bg-background py-3"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <textarea
          id="message"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              e.preventDefault()
              submit()
            }
          }}
          placeholder="Message GPT-6 Luna"
          className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          disabled={isBusy || !input.trim()}
          className="rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </main>
  )
}
