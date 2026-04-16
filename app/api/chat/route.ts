import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateChatResponse } from '@/lib/ai/chat-client'

const ChatSchema = z.object({
  userProjectId: z.string().uuid(),
  projectId: z.string().uuid(),
  message: z.string().min(1).max(4000),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = ChatSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: '入力が不正です' }, { status: 400 })
    }
    const { userProjectId, message, projectId } = parsed.data

    // user_projectsの所有者確認（RLSでも守られているが明示的にチェック）
    const { data: userProject } = await supabase
      .from('user_projects')
      .select('id')
      .eq('id', userProjectId)
      .eq('user_id', user.id)
      .single()

    if (!userProject) {
      return NextResponse.json({ success: false, error: '権限がありません' }, { status: 403 })
    }

    // 案件情報を取得（AIペルソナと要件定義）
    const { data: project } = await supabase
      .from('projects')
      .select('description, ai_persona')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ success: false, error: '案件が見つかりません' }, { status: 404 })
    }

    // 既存のチャット履歴を取得
    const { data: existingMessages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_project_id', userProjectId)
      .order('created_at', { ascending: true })

    // ユーザーメッセージをDBに保存
    await supabase.from('chat_messages').insert({
      user_project_id: userProjectId,
      role: 'user',
      content: message,
    })

    // AIの返答を生成
    const allMessages = [...(existingMessages ?? []), {
      id: 'temp',
      user_project_id: userProjectId,
      role: 'user' as const,
      content: message,
      created_at: new Date().toISOString(),
    }]

    const aiResponse = await generateChatResponse(
      project.ai_persona,
      project.description,
      allMessages
    )

    // AIの返答をDBに保存
    await supabase.from('chat_messages').insert({
      user_project_id: userProjectId,
      role: 'assistant',
      content: aiResponse,
    })

    // 最新のメッセージ一覧を返す
    const { data: updatedMessages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_project_id', userProjectId)
      .order('created_at', { ascending: true })

    return NextResponse.json({ success: true, messages: updatedMessages })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ success: false, error: 'チャットの送信に失敗しました' }, { status: 500 })
  }
}
