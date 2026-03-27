import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// TailwindCSSのクラス名を条件付きで結合するユーティリティ
// 例: cn('px-4', isActive && 'bg-blue-500', 'rounded')
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 擬似報酬を日本円形式でフォーマット
export function formatReward(amount: number): string {
  return `¥${(amount ?? 0).toLocaleString('ja-JP')}`
}

// 難易度ラベルの日本語マッピング
export const DIFFICULTY_LABELS: Record<string, string> = {
  junior: 'ジュニア',
  mid: 'ミドル',
  senior: 'シニア',
}

// カテゴリラベルの日本語マッピング
export const CATEGORY_LABELS: Record<string, string> = {
  lp: 'LP・サービスサイト',
  ec: 'ECサイト',
  admin: '管理画面',
  dashboard: 'ダッシュボード',
  auth: '認証・会員機能',
  api_integration: '外部API連携',
  refactoring: 'コード改善',
}

// 難易度に応じたバッジカラー
export const DIFFICULTY_COLORS: Record<string, string> = {
  junior: 'bg-emerald-100 text-emerald-700',
  mid: 'bg-amber-100 text-amber-700',
  senior: 'bg-red-100 text-red-700',
}

// スコアに応じた色
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}
