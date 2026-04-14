import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatReward } from '@/lib/utils'
import { Trophy, Briefcase, Star, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 全案件を取得（統計 + 完了一覧を同じデータから作る）
  const { data: allUserProjects } = await supabase
    .from('user_projects')
    .select('id, project_id, status, completed_at, earned_reward')
    .eq('user_id', user.id)

  const stats = {
    total: allUserProjects?.length ?? 0,
    completed: allUserProjects?.filter((p) => p.status === 'completed').length ?? 0,
    inProgress: allUserProjects?.filter((p) => p.status === 'in_progress').length ?? 0,
  }

  // 完了案件のプロジェクト詳細を取得
  const completedUserProjects = allUserProjects?.filter((p) => p.status === 'completed') ?? []
  const completedProjectIds = completedUserProjects.map((up) => up.project_id)
  const { data: projectDetails } = completedProjectIds.length > 0
    ? await supabase
        .from('projects')
        .select('id, title, difficulty, reward_amount')
        .in('id', completedProjectIds)
    : { data: [] }

  const completedProjects = completedUserProjects
    .map((up) => ({
      ...up,
      project: projectDetails?.find((p) => p.id === up.project_id) ?? null,
    }))
    .sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''))

  return (
    <div className="p-8 pb-48 pr-32">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">ダッシュボード</h1>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          {
            label: '累計擬似報酬',
            value: formatReward(profile?.total_earnings ?? 0),
            icon: <Trophy className="w-5 h-5 text-amber-500" />,
            bg: 'bg-amber-50',
          },
          {
            label: '納品完了件数',
            value: `${stats.completed}件`,
            icon: <Star className="w-5 h-5 text-blue-500" />,
            bg: 'bg-blue-50',
          },
          {
            label: '進行中',
            value: `${stats.inProgress}件`,
            icon: <Briefcase className="w-5 h-5 text-emerald-500" />,
            bg: 'bg-emerald-50',
          },
          {
            label: '受注総数',
            value: `${stats.total}件`,
            icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
            bg: 'bg-purple-50',
          },
        ].map((card) => (
          <div key={card.label} className={`${card.bg} rounded-2xl p-5 border border-white`}>
            <div className="flex items-center gap-2 mb-2">
              {card.icon}
              <span className="text-sm text-slate-500">{card.label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
          </div>
        ))}
      </div>

      {/* 完了済み案件一覧 */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">完了した案件</h2>
          <p className="text-xs text-slate-400">クリックすると要件・チャット・コードを振り返ったり、修正して再レビューを受けることができます</p>
        </div>
        {completedProjects && completedProjects.length > 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {completedProjects.map((up, index) => {
              const project = up.project as { title: string; difficulty: string; reward_amount: number } | null
              return (
                <Link
                  key={up.id}
                  href={`/workspace/${up.project_id}`}
                  className={`flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors ${index !== 0 ? 'border-t border-slate-100' : ''}`}
                >
                  <div>
                    <p className="font-medium text-slate-900">{project?.title ?? '---'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      完了: {up.completed_at ? new Date(up.completed_at).toLocaleDateString('ja-JP') : '---'}
                    </p>
                  </div>
                  <p className="font-bold text-amber-600">{formatReward(up.earned_reward ?? 0)}</p>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-2xl">
            <p>まだ完了した案件がありません</p>
            <p className="text-sm mt-1">案件ボードから案件を受注してみましょう</p>
          </div>
        )}
      </div>
    </div>
  )
}
