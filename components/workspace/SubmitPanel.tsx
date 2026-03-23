'use client'

import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import type { Project, UserProject, Submission, Review } from '@/types'

const LANGUAGES = ['typescript', 'javascript', 'tsx', 'jsx', 'css', 'html', 'python']

type Props = {
  userProject: UserProject
  project: Project
  latestSubmission: Submission | null
  onReviewComplete: (review: Review) => void
}

export default function SubmitPanel({ userProject, project, latestSubmission, onReviewComplete }: Props) {
  const [code, setCode] = useState(latestSubmission?.code_content ?? '')
  const [language, setLanguage] = useState(latestSubmission?.language ?? 'typescript')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim() || loading) return

    setLoading(true)
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProjectId: userProject.id,
          code,
          language,
          requirements: project.description,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        onReviewComplete(data.review)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-2">コードを提出する</h2>
        <p className="text-slate-500 text-sm mb-6">
          実装したコードを貼り付けて提出すると、AIシニアエンジニアがレビューします。
        </p>

        {submitted && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-medium text-emerald-800">提出完了！レビュー結果を確認してください</p>
              <p className="text-sm text-emerald-600">「レビュー結果」タブに切り替えてください</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 言語セレクト */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">言語</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* コードエリア */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              コード <span className="text-slate-400 font-normal">（実装したコードをここに貼り付けてください）</span>
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={20}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono leading-relaxed focus:outline-none focus:border-blue-500 transition-colors resize-none bg-slate-50"
              placeholder={`// ここにコードを貼り付けてください\n// 例：\nconst MyComponent = () => {\n  return <div>Hello World</div>\n}`}
            />
          </div>

          <button
            type="submit"
            disabled={!code.trim() || loading}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
            {loading ? 'AIがレビュー中...' : 'コードを提出してレビューを受ける'}
          </button>
        </form>
      </div>
    </div>
  )
}
