import { AlertCircle, AlertTriangle, Lightbulb } from 'lucide-react'
import { cn, getScoreColor } from '@/lib/utils'
import type { Review, ReviewComment } from '@/types'

const SEVERITY_CONFIG = {
  error: { icon: AlertCircle, color: 'text-red-600 bg-red-50 border-red-200', label: '要修正' },
  warning: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200', label: '改善推奨' },
  suggestion: { icon: Lightbulb, color: 'text-blue-600 bg-blue-50 border-blue-200', label: '提案' },
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-slate-600">{label}</span>
        <span className={cn('text-sm font-bold', getScoreColor(score))}>{score}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500')}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

function CommentCard({ comment }: { comment: ReviewComment }) {
  const config = SEVERITY_CONFIG[comment.severity]
  const Icon = config.icon

  return (
    <div className={cn('flex gap-3 p-4 rounded-xl border', config.color)}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-semibold">{config.label}</span>
          {comment.filename && (
            <span className="text-xs bg-black/10 px-1.5 py-0.5 rounded font-mono">
              {comment.filename}
            </span>
          )}
          {comment.line && (
            <span className="text-xs bg-black/10 px-1.5 py-0.5 rounded font-mono">
              Line {comment.line}
            </span>
          )}
          <span className="text-xs bg-black/10 px-1.5 py-0.5 rounded capitalize">
            {comment.category}
          </span>
        </div>
        <p className="text-sm leading-relaxed">{comment.comment}</p>
      </div>
    </div>
  )
}

export default function ReviewPanel({ review }: { review: Review }) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-8">
        {/* 総合スコア */}
        <div className="flex items-center gap-6 p-6 bg-white border border-slate-200 rounded-2xl mb-6">
          <div className="text-center">
            <div className={cn('text-5xl font-black', getScoreColor(review.overall_score))}>
              {review.overall_score}
            </div>
            <div className="text-xs text-slate-500 mt-1">総合スコア</div>
          </div>
          <div className="flex-1 space-y-3">
            <ScoreBar label="可読性" score={review.readability_score} />
            <ScoreBar label="セキュリティ" score={review.security_score} />
            <ScoreBar label="機能性" score={review.functionality_score} />
          </div>
        </div>

        {/* 総評 */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl mb-6">
          <h3 className="font-semibold text-slate-900 mb-2">AIシニアエンジニアからの総評</h3>
          <p className="text-slate-700 text-sm leading-relaxed">{review.summary}</p>
        </div>

        {/* 詳細コメント */}
        {review.detailed_comments.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">
              詳細フィードバック
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({review.detailed_comments.length}件)
              </span>
            </h3>
            <div className="space-y-3">
              {review.detailed_comments.map((comment, i) => (
                <CommentCard key={i} comment={comment} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
