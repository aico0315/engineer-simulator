import Anthropic from '@anthropic-ai/sdk'
import type { AiPersona, ChatMessage } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// クライアントAIのシステムプロンプトを構築
function buildSystemPrompt(persona: AiPersona, projectDescription: string): string {
  return `あなたは「${persona.name}」という架空のクライアントです。
会社: ${persona.company}
性格: ${persona.personality}
口調: ${persona.tone}

あなたが依頼した案件の要件定義は以下の通りです:
---
${projectDescription}
---

ルール:
1. 上記の口調とキャラクターを一貫して保ってください。
2. 開発者からのヒアリング（質問）に対して、追加の要件・背景・制約を具体的に答えてください。
3. 要件定義に書いていない細かい仕様を自然に補足してください。
4. 実際のクライアントらしく、時には曖昧な回答や追加要望をすることもあります。
5. コードについての技術的な詳細は分からないキャラクターとして振る舞ってください。
6. 返答は200文字以内で端的にお願いします。`
}

// ヒアリングチャットのレスポンスを生成（ストリーミング対応）
export async function generateChatResponse(
  persona: AiPersona,
  projectDescription: string,
  messages: ChatMessage[]
): Promise<string> {
  // Supabaseのメッセージ形式をAnthropicのメッセージ形式に変換
  const anthropicMessages: Anthropic.MessageParam[] = messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }))

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001', // チャットは高速なHaikuを使用
    max_tokens: 512,
    system: buildSystemPrompt(persona, projectDescription),
    messages: anthropicMessages,
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

// ストリーミング版（Server-Sent Events用）
export async function* streamChatResponse(
  persona: AiPersona,
  projectDescription: string,
  messages: ChatMessage[]
): AsyncGenerator<string> {
  const anthropicMessages: Anthropic.MessageParam[] = messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }))

  const stream = anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: buildSystemPrompt(persona, projectDescription),
    messages: anthropicMessages,
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text
    }
  }
}
