import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { reviewCode } from '@/lib/ai/reviewer'
import type { DifficultyLevel } from '@/types'

const CodeFileSchema = z.object({
  name: z.string().min(1).max(200),
  content: z.string().max(100000),
  language: z.string().min(1).max(50),
})

const ReviewSchema = z.object({
  userProjectId: z.string().uuid(),
  requirements: z.string().min(1).max(10000),
  files: z.array(CodeFileSchema).min(1).max(20),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = ReviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: '入力が不正です' }, { status: 400 })
    }
    const { userProjectId, files, requirements } = parsed.data

    // 所有者確認
    const { data: userProject } = await supabase
      .from('user_projects')
      .select('id, project_id')
      .eq('id', userProjectId)
      .eq('user_id', user.id)
      .single()

    if (!userProject) {
      return NextResponse.json({ success: false, error: '権限がありません' }, { status: 403 })
    }

    // プロジェクトの難易度と報酬を取得
    const { data: projectData } = await supabase
      .from('projects')
      .select('difficulty, reward_amount')
      .eq('id', userProject.project_id)
      .single()

    const difficulty = ((projectData?.difficulty) ?? 'junior') as DifficultyLevel

    // 全ファイルを連結して code_content に保存（後方互換 + 全文検索用）
    const code_content = files
      .map((f) => `// === ${f.name} ===\n${f.content}`)
      .join('\n\n')
    const language = files.map((f) => f.language).join(',')

    // コード提出をDBに保存
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        user_project_id: userProjectId,
        code_content,
        language,
        files,
      })
      .select()
      .single()

    if (submissionError || !submission) {
      return NextResponse.json({ success: false, error: '提出の保存に失敗しました' }, { status: 500 })
    }

    // AIレビューを実行（全ファイルをまとめて渡す）
    const reviewData = await reviewCode(files, requirements, difficulty)

    // レビュー結果をDBに保存
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({ submission_id: submission.id, ...reviewData })
      .select()
      .single()

    if (reviewError || !review) {
      return NextResponse.json({ success: false, error: 'レビューの保存に失敗しました' }, { status: 500 })
    }

    // user_projectsのステータスを更新
    await supabase
      .from('user_projects')
      .update({ status: 'reviewed', submitted_at: new Date().toISOString() })
      .eq('id', userProjectId)

    // 納品条件: error件数 === 0 かつ overall_score >= 70
    const errorCount = review.detailed_comments.filter(
      (c: { severity: string }) => c.severity === 'error'
    ).length
    const isDeliverable = errorCount === 0 && review.overall_score >= 70

    if (isDeliverable) {
      // すでに completed なら報酬の重複付与をしない
      const { data: currentProject } = await supabase
        .from('user_projects')
        .select('status')
        .eq('id', userProjectId)
        .single()

      const alreadyCompleted = currentProject?.status === 'completed'

      if (projectData) {
        await supabase
          .from('user_projects')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            earned_reward: projectData.reward_amount,
          })
          .eq('id', userProjectId)

        if (!alreadyCompleted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('total_earnings')
            .eq('id', user.id)
            .single()

          if (profile) {
            await supabase
              .from('profiles')
              .update({ total_earnings: profile.total_earnings + projectData.reward_amount })
              .eq('id', user.id)
          }
        }
      }
    }

    return NextResponse.json({ success: true, review })
  } catch (err) {
    console.error('Review error:', err)
    return NextResponse.json({ success: false, error: 'レビューに失敗しました' }, { status: 500 })
  }
}
