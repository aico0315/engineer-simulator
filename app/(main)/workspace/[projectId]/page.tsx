import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WorkspaceClient from '@/components/workspace/WorkspaceClient'

type Props = {
  params: Promise<{ projectId: string }>
}

export default async function WorkspacePage({ params }: Props) {
  const { projectId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 案件情報を取得
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (!project) notFound()

  // ユーザーの受注状況を確認
  let { data: userProject } = await supabase
    .from('user_projects')
    .select('*')
    .eq('user_id', user.id)
    .eq('project_id', projectId)
    .single()

  // 未受注なら自動で受注レコードを作成（案件ページを開いたタイミングで受注）
  if (!userProject) {
    const { data: newUserProject } = await supabase
      .from('user_projects')
      .insert({ user_id: user.id, project_id: projectId })
      .select()
      .single()
    userProject = newUserProject
  }

  if (!userProject) notFound()

  // チャット履歴を取得
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_project_id', userProject.id)
    .order('created_at', { ascending: true })

  // 最新の提出とレビューを取得
  const { data: latestSubmission } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_project_id', userProject.id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()

  const latestReview = latestSubmission
    ? (await supabase
        .from('reviews')
        .select('*')
        .eq('submission_id', latestSubmission.id)
        .single()
      ).data
    : null

  return (
    <WorkspaceClient
      userProject={userProject}
      project={project}
      messages={messages ?? []}
      latestSubmission={latestSubmission ?? null}
      latestReview={latestReview ?? null}
    />
  )
}
