import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateProject } from '@/lib/ai/project-generator'
import type { DifficultyLevel, ProjectCategory } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const difficulty: DifficultyLevel = body.difficulty ?? 'junior'
    const category: ProjectCategory = body.category ?? 'lp'

    // AIで案件を生成
    const projectData = await generateProject(difficulty, category)

    // Supabaseに保存
    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ success: false, error: '案件の保存に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: project })
  } catch (err) {
    console.error('Generate project error:', err)
    return NextResponse.json({ success: false, error: '案件の生成に失敗しました' }, { status: 500 })
  }
}
