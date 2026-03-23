import { createClient } from '@/lib/supabase/server'
import ProjectCard from '@/components/board/ProjectCard'
import GenerateProjectButton from '@/components/board/GenerateProjectButton'

export default async function BoardPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()

  // ユーザーが受注済みの案件IDを取得
  const { data: userProjects } = await supabase
    .from('user_projects')
    .select('project_id, status')
    .eq('user_id', user!.id)

  const acceptedProjectIds = new Set(userProjects?.map((up) => up.project_id) ?? [])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">案件ボード</h1>
          <p className="text-slate-500 mt-1">AIが生成した架空の案件に挑戦しよう</p>
        </div>
        <GenerateProjectButton />
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isAccepted={acceptedProjectIds.has(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-slate-400">
          <p className="text-lg mb-4">案件がまだありません</p>
          <p className="text-sm">「案件を生成」ボタンで新しい案件を作成してください</p>
        </div>
      )}
    </div>
  )
}
