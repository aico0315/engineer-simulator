import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reviewCode } from '@/lib/ai/reviewer'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const { userProjectId, code, language, requirements } = await request.json()

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

    // コード提出をDBに保存
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        user_project_id: userProjectId,
        code_content: code,
        language,
      })
      .select()
      .single()

    if (submissionError || !submission) {
      return NextResponse.json({ success: false, error: '提出の保存に失敗しました' }, { status: 500 })
    }

    // AIレビューを実行
    const reviewData = await reviewCode(code, language, requirements)

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

    // 高スコア（80点以上）なら完了扱いにして擬似報酬を付与
    if (review.overall_score >= 80) {
      const { data: project } = await supabase
        .from('projects')
        .select('reward_amount')
        .eq('id', userProject.project_id)
        .single()

      if (project) {
        await supabase
          .from('user_projects')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            earned_reward: project.reward_amount,
          })
          .eq('id', userProjectId)

        // プロフィールの累計報酬を加算
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_earnings')
          .eq('id', user.id)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({ total_earnings: profile.total_earnings + project.reward_amount })
            .eq('id', user.id)
        }
      }
    }

    return NextResponse.json({ success: true, review })
  } catch (err) {
    console.error('Review error:', err)
    return NextResponse.json({ success: false, error: 'レビューに失敗しました' }, { status: 500 })
  }
}
