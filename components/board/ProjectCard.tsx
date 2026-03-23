import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { cn, formatReward, DIFFICULTY_LABELS, DIFFICULTY_COLORS, CATEGORY_LABELS } from '@/lib/utils'
import type { Project } from '@/types'

type Props = {
  project: Project
  isAccepted: boolean
}

export default function ProjectCard({ project, isAccepted }: Props) {
  return (
    <div className={cn(
      'bg-white rounded-2xl border p-5 flex flex-col gap-4 hover:shadow-md transition-shadow',
      isAccepted ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200'
    )}>
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
        {project.tech_stack.slice(0, 2).map((tech) => (
          <span key={tech} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {tech}
          </span>
        ))}
      </div>

      {/* フッター */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            擬似報酬
          </p>
          <p className="text-base font-bold text-amber-600">{formatReward(project.reward_amount)}</p>
        </div>
        <Link
          href={`/workspace/${project.id}`}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isAccepted ? '作業を続ける' : '案件を見る'}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
