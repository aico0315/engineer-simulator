import { formatReward, DIFFICULTY_LABELS, DIFFICULTY_COLORS, CATEGORY_LABELS, cn } from '@/lib/utils'
import type { Project } from '@/types'

export default function RequirementPanel({ project }: { project: Project }) {
  // Markdownの簡易レンダリング（見出し・リスト・コードブロック対応）
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-bold text-slate-900 mt-6 mb-2">{line.slice(3)}</h2>
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold text-slate-800 mt-4 mb-1">{line.slice(4)}</h3>
        }
        if (line.startsWith('- ')) {
          return <li key={i} className="ml-4 text-slate-700 list-disc">{line.slice(2)}</li>
        }
        if (line.startsWith('`') && line.endsWith('`')) {
          return <code key={i} className="block bg-slate-100 px-3 py-1 rounded text-sm font-mono text-slate-800 my-1">{line.slice(1, -1)}</code>
        }
        if (line.trim() === '') {
          return <br key={i} />
        }
        return <p key={i} className="text-slate-700 leading-relaxed">{line}</p>
      })
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-8">
        {/* 案件メタ情報 */}
        <div className="flex flex-wrap gap-3 mb-6">
          <span className={cn('text-sm px-3 py-1 rounded-full font-medium', DIFFICULTY_COLORS[project.difficulty])}>
            {DIFFICULTY_LABELS[project.difficulty]}
          </span>
          <span className="text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-600">
            {CATEGORY_LABELS[project.category]}
          </span>
          <span className="text-sm px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold">
            擬似報酬: {formatReward(project.reward_amount)}
          </span>
        </div>

        {/* 技術スタック */}
        <div className="mb-6">
          <p className="text-xs text-slate-400 font-medium mb-2">使用技術</p>
          <div className="flex flex-wrap gap-2">
            {(project.tech_stack ?? []).map((tech) => (
              <span key={tech} className="text-sm px-2 py-0.5 bg-slate-900 text-slate-200 rounded font-mono">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* 要件定義本文 */}
        <div className="prose-slate">
          {renderMarkdown(project.description)}
        </div>

        {/* クライアント情報 */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-400 font-medium mb-2">クライアント情報</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{project.ai_persona.avatar_emoji}</span>
            <div>
              <p className="font-semibold text-slate-900">{project.ai_persona.name}</p>
              <p className="text-sm text-slate-500">{project.ai_persona.company}</p>
              <p className="text-sm text-slate-600 mt-1">{project.ai_persona.personality}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
