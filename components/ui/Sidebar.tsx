'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Code2, LayoutGrid, BarChart3, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, formatReward } from '@/lib/utils'
import type { Profile } from '@/types'

const navItems = [
  { href: '/board', label: '案件ボード', icon: LayoutGrid },
  { href: '/dashboard', label: 'ダッシュボード', icon: BarChart3 },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 flex flex-col bg-slate-900 text-white shrink-0">
      {/* ロゴ */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-800">
        <Code2 className="w-5 h-5 text-blue-400 shrink-0" />
        <span className="font-bold text-sm leading-tight">Engineer Simulator</span>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* ユーザー情報 */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        {profile && (
          <div className="px-3 py-2 rounded-lg bg-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-300 font-medium truncate">{profile.username}</span>
            </div>
            <div className="text-xs text-amber-400 font-semibold">
              {formatReward(profile.total_earnings)}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          ログアウト
        </button>
      </div>
    </aside>
  )
}
