'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project, UserProject, ChatMessage } from '@/types'

type Props = {
  userProject: UserProject
  project: Project
  messages: ChatMessage[]
  onMessagesUpdate: (messages: ChatMessage[]) => void
}

export default function ChatPanel({ userProject, project, messages, onMessagesUpdate }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // 新しいメッセージが来たら自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // ユーザーメッセージを楽観的UI更新（即座に画面に反映）
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      user_project_id: userProject.id,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    }
    onMessagesUpdate([...messages, tempUserMsg])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProjectId: userProject.id,
          message: userMessage,
          projectId: project.id,
        }),
      })

      const data = await res.json()
      if (data.success) {
        onMessagesUpdate(data.messages)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* チャット履歴 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-2xl mb-3">{project.ai_persona.avatar_emoji}</p>
            <p className="font-medium">{project.ai_persona.name}さんに質問してみましょう</p>
            <p className="text-sm mt-1">要件の不明点や背景、細かい仕様を確認できます</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
          >
            {msg.role === 'assistant' && (
              <div className="text-xl shrink-0 mt-1">{project.ai_persona.avatar_emoji}</div>
            )}
            <div
              className={cn(
                'max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="text-xl">{project.ai_persona.avatar_emoji}</div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 入力フォーム */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="クライアントに質問する..."
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
