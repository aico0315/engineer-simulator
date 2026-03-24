'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ChevronDown } from 'lucide-react'
import type { DifficultyLevel, ProjectCategory } from '@/types'

const DIFFICULTIES: { value: DifficultyLevel; label: string }[] = [
  { value: 'junior', label: 'ジュニア' },
  { value: 'mid', label: 'ミドル' },
  { value: 'senior', label: 'シニア' },
]

const CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: 'lp', label: 'LP制作' },
  { value: 'api', label: 'API開発' },
  { value: 'ui_component', label: 'UIコンポーネント' },
  { value: 'form', label: 'フォーム実装' },
  { value: 'dashboard', label: 'ダッシュボード' },
  { value: 'auth', label: '認証機能' },
]

export default function GenerateProjectButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('junior')
  const [category, setCategory] = useState<ProjectCategory>('lp')

  async function handleGenerate() {
    setLoading(true)
    try {
      const res = await fetch('/api/projects/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty, category }),
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* 難易度セレクト */}
      <div className="relative">
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
          className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      </div>

      {/* カテゴリセレクト */}
      <div className="relative">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ProjectCategory)}
          className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors min-w-[120px] justify-center"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            生成中...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            案件を生成
          </>
        )}
      </button>
    </div>
  )
}
