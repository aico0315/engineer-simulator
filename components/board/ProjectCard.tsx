import Link from 'next/link'
import { CheckCircle2, Clock } from 'lucide-react'
import { cn, formatReward, DIFFICULTY_LABELS, DIFFICULTY_COLORS, CATEGORY_LABELS } from '@/lib/utils'
import type { Project } from '@/types'

type Props = {
  project: Project
  isAccepted: boolean
}

export default function ProjectCard({ project, isAccepted }: Props) {
  const cardBg = isAccepted ? 'bg-blue-50/40' : 'bg-white'
  const tabBg  = isAccepted ? 'bg-blue-100'   : 'bg-slate-100'
  const border = isAccepted ? 'border-blue-200' : 'border-slate-200'

  return (
    <div className="flex flex-col">
      {/* フォルダのタブ */}
      <div className={cn(
        'w-fit min-h-8 rounded-t-xl border-t border-l border-r flex items-center px-3 py-1',
        tabBg, border
      )}>
        <span className="text-xs font-semibold text-slate-600 leading-tight">
          {CATEGORY_LABELS[project.category]}
        </span>
      </div>
      {/* カード本体 */}
      <Link
        href={`/workspace/${project.id}`}
        className={cn(
          'flex flex-col gap-4 rounded-b-2xl rounded-tr-2xl border p-5 hover:shadow-md transition-shadow cursor-pointer',
          cardBg, border
        )}
      >
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-2xl">
          <span>{project.ai_persona.avatar_emoji}</span>
          <div>
            <p className="text-xs text-slate-500">{project.ai_persona.company}</p>
            <p className="text-sm font-medium text-slate-700">{project.ai_persona.name}</p>
          </div>
        </div>
        {isAccepted && (
          <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3" />
            受注済み
          </span>
        )}
      </div>

      {/* タイトルと説明 */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-1 leading-snug">{project.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2">
          {project.description.split('\n')[0].replace(/^#+\s*/, '')}
        </p>
      </div>

      {/* バッジ */}
      <div className="flex flex-wrap gap-2">
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', DIFFICULTY_COLORS[project.difficulty])}>
          {DIFFICULTY_LABELS[project.difficulty]}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {CATEGORY_LABELS[project.category]}
        </span>
        {(project.tech_stack ?? []).slice(0, 2).map((tech) => (
          <span key={tech} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {tech}
          </span>
        ))}
      </div>

      {/* フッター */}
      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          擬似報酬
        </p>
        <p className="text-base font-bold text-amber-600">{formatReward(project.reward_amount)}</p>
      </div>
    </Link>
    </div>
  )
}
