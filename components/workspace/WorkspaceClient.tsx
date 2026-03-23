'use client'

import { useState } from 'react'
import { FileText, MessageSquare, Code, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import RequirementPanel from './RequirementPanel'
import ChatPanel from '../chat/ChatPanel'
import SubmitPanel from './SubmitPanel'
import ReviewPanel from '../review/ReviewPanel'
import type { Project, UserProject, ChatMessage, Submission, Review } from '@/types'

type Tab = 'requirement' | 'chat' | 'submit' | 'review'

type Props = {
  userProject: UserProject
  project: Project
  messages: ChatMessage[]
  latestSubmission: Submission | null
  latestReview: Review | null
}

export default function WorkspaceClient({
  userProject,
  project,
  messages: initialMessages,
  latestSubmission,
  latestReview,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('requirement')
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [currentReview, setCurrentReview] = useState<Review | null>(latestReview)

  const tabs = [
    { id: 'requirement' as Tab, label: '要件定義', icon: FileText },
    { id: 'chat' as Tab, label: 'ヒアリング', icon: MessageSquare },
    { id: 'submit' as Tab, label: 'コード提出', icon: Code },
    { id: 'review' as Tab, label: 'レビュー結果', icon: Star, disabled: !currentReview },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="bg-white border-b border-slate-200 px-8 pt-6 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{project.ai_persona.avatar_emoji}</span>
          <div>
            <p className="text-xs text-slate-500">{project.ai_persona.company} / {project.ai_persona.name}</p>
            <h1 className="font-bold text-xl text-slate-900">{project.title}</h1>
          </div>
        </div>

        {/* タブ */}
        <div className="flex gap-1">
          {tabs.map(({ id, label, icon: Icon, disabled }) => (
            <button
              key={id}
              onClick={() => !disabled && setActiveTab(id)}
              disabled={disabled}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors',
                activeTab === id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : disabled
                  ? 'border-transparent text-slate-300 cursor-not-allowed'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'requirement' && (
          <RequirementPanel project={project} />
        )}
        {activeTab === 'chat' && (
          <ChatPanel
            userProject={userProject}
            project={project}
            messages={messages}
            onMessagesUpdate={setMessages}
          />
        )}
        {activeTab === 'submit' && (
          <SubmitPanel
            userProject={userProject}
            project={project}
            latestSubmission={latestSubmission}
            onReviewComplete={(review) => {
              setCurrentReview(review)
              setActiveTab('review')
            }}
          />
        )}
        {activeTab === 'review' && currentReview && (
          <ReviewPanel review={currentReview} />
        )}
      </div>
    </div>
  )
}
