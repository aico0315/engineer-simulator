'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Plus, X } from 'lucide-react'
import type { Project, UserProject, Submission, Review, CodeFile } from '@/types'

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  html: 'html',
  css: 'css',
  js: 'javascript',
  ts: 'typescript',
  tsx: 'tsx',
  jsx: 'jsx',
  py: 'python',
  json: 'json',
  md: 'markdown',
}

function getLanguageFromFilename(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSION_TO_LANGUAGE[ext] ?? 'javascript'
}

const DEFAULT_FILES: CodeFile[] = [
  { name: 'index.html', language: 'html', content: '' },
]

type Props = {
  userProject: UserProject
  project: Project
  latestSubmission: Submission | null
  onReviewComplete: (review: Review) => void
}

export default function SubmitPanel({ userProject, project, latestSubmission, onReviewComplete }: Props) {
  const initialFiles = latestSubmission?.files ?? DEFAULT_FILES
  const [files, setFiles] = useState<CodeFile[]>(initialFiles)
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showNewFileInput, setShowNewFileInput] = useState(false)
  const [newFileName, setNewFileName] = useState('')

  const activeFile = files[activeIndex]
  const hasContent = files.some((f) => f.content.trim())

  function updateActiveContent(content: string) {
    setFiles((prev) => prev.map((f, i) => (i === activeIndex ? { ...f, content } : f)))
  }

  function addFile() {
    const name = newFileName.trim()
    if (!name) return
    const language = getLanguageFromFilename(name)
    setFiles((prev) => [...prev, { name, language, content: '' }])
    setActiveIndex(files.length)
    setNewFileName('')
    setShowNewFileInput(false)
  }

  function removeFile(index: number) {
    if (files.length === 1) return
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setActiveIndex((prev) => Math.min(prev, files.length - 2))
  }

  async function handleSubmit() {
    if (!hasContent || loading) return

    setLoading(true)
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProjectId: userProject.id,
          files,
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
      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-2">コードを提出する</h2>
        <p className="text-slate-500 text-sm mb-6">
          複数のファイルを追加してまとめて提出できます。AIシニアエンジニアが全ファイルを横断してレビューします。
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

        <form action={handleSubmit} className="space-y-0">
          {/* ファイルタブ */}
          <div className="flex items-center gap-0 border border-slate-200 rounded-t-xl overflow-x-auto bg-slate-100">
            {files.map((file, index) => (
              <div
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono cursor-pointer whitespace-nowrap border-r border-slate-200 transition-colors ${
                  activeIndex === index
                    ? 'bg-white text-slate-900 border-b-2 border-b-blue-500'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{file.name}</span>
                {files.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(index) }}
                    className="ml-0.5 text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            {/* ファイル追加 */}
            {showNewFileInput ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 shrink-0">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addFile() }
                    if (e.key === 'Escape') { setShowNewFileInput(false); setNewFileName('') }
                  }}
                  placeholder="style.css"
                  className="text-sm font-mono border border-blue-400 rounded px-2 py-1 w-28 focus:outline-none bg-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={addFile}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  追加
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewFileInput(false); setNewFileName('') }}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewFileInput(true)}
                className="flex items-center gap-1 px-3 py-2.5 text-sm text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                ファイルを追加
              </button>
            )}
          </div>

          {/* 言語バッジ */}
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-x border-slate-200">
            <span className="text-xs text-slate-400">言語:</span>
            <span className="text-xs font-mono bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
              {activeFile.language}
            </span>
          </div>

          {/* コードエディタ */}
          <textarea
            value={activeFile.content}
            onChange={(e) => updateActiveContent(e.target.value)}
            rows={22}
            className="w-full px-4 py-3 border border-slate-200 text-sm font-mono leading-relaxed focus:outline-none focus:border-blue-500 transition-colors resize-none bg-slate-50"
            placeholder={`// ${activeFile.name} の内容をここに貼り付けてください`}
          />

          {/* 提出ボタン */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!hasContent || loading}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
              {loading
                ? 'AIがレビュー中...'
                : `${files.length}ファイルをまとめてレビュー提出`}
            </button>
            <p className="text-xs text-slate-400 mt-2">
              提出したファイル: {files.map((f) => f.name).join(', ')}
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
