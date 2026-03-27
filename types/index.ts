// ============================================================
// アプリ全体で使用する型定義
// ============================================================

// --- ユーザープロフィール ---
export type Profile = {
  id: string
  username: string
  avatar_url: string | null
  total_earnings: number
  level: number
  created_at: string
}

// --- 案件（プロジェクト）---
export type DifficultyLevel = 'junior' | 'mid' | 'senior'
export type ProjectCategory = 'lp' | 'ec' | 'admin' | 'dashboard' | 'auth' | 'api_integration' | 'refactoring'

export type AiPersona = {
  name: string           // クライアントの名前（例: 田中 優子）
  company: string        // 会社名
  personality: string    // 性格の説明
  tone: string           // 口調（例: 丁寧、ぶっきらぼう）
  avatar_emoji: string   // アバター絵文字
}

export type Project = {
  id: string
  title: string
  description: string    // 要件定義（Markdown形式）
  difficulty: DifficultyLevel
  category: ProjectCategory
  reward_amount: number
  tech_stack: string[]
  ai_persona: AiPersona
  is_active: boolean
  created_at: string
}

// --- ユーザーと案件の紐付け ---
export type UserProjectStatus = 'in_progress' | 'submitted' | 'reviewed' | 'completed'

export type UserProject = {
  id: string
  user_id: string
  project_id: string
  status: UserProjectStatus
  started_at: string
  submitted_at: string | null
  completed_at: string | null
  earned_reward: number | null
  project?: Project      // JOIN時に付加されるプロジェクト情報
}

// --- チャットメッセージ ---
export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  user_project_id: string
  role: ChatRole
  content: string
  created_at: string
}

// --- 提出ファイル（1ファイル分） ---
export type CodeFile = {
  name: string       // e.g. "index.html"
  language: string   // e.g. "html"
  content: string
}

// --- コード提出 ---
export type Submission = {
  id: string
  user_project_id: string
  code_content: string
  language: string
  files: CodeFile[] | null  // 複数ファイル提出時はここに格納
  submitted_at: string
}

// --- レビューコメント（行単位） ---
export type ReviewComment = {
  filename: string | null   // 複数ファイル時の対象ファイル名
  line: number | null
  comment: string
  severity: 'error' | 'warning' | 'suggestion'
  category: 'readability' | 'security' | 'functionality' | 'best_practice'
}

// --- AIレビュー結果 ---
export type Review = {
  id: string
  submission_id: string
  overall_score: number
  readability_score: number
  security_score: number
  functionality_score: number
  summary: string
  detailed_comments: ReviewComment[]
  created_at: string
}

// --- フロントエンド用の複合型 ---
export type WorkspaceData = {
  userProject: UserProject
  project: Project
  messages: ChatMessage[]
  latestSubmission: Submission | null
  latestReview: Review | null
}

// --- APIレスポンス汎用型 ---
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }
