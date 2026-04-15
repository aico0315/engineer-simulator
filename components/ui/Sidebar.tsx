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
    <aside
      className="w-56 flex flex-col border-r-4 border-stone-700/50 shrink-0 relative z-20 shadow-[4px_0_16px_rgba(0,0,0,0.18),inset_-16px_0_24px_rgba(0,0,0,0.20)]"
      style={{
        backgroundImage: 'url(/wood.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 白いオーバーレイで視認性を確保しつつ木目を透かす */}
      <div className="absolute inset-0 bg-white/25 pointer-events-none" />
      {/* コンテンツ（オーバーレイの上に表示） */}
      <div className="relative z-10 flex flex-col flex-1">

      {/* ロゴ */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-black/10">
        <Code2 className="w-5 h-5 text-stone-900 shrink-0" />
        <span className="font-bold text-sm leading-tight text-stone-900 drop-shadow-sm">Engineer Simulator</span>
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
                ? 'bg-black/50 text-white shadow-sm'
                : 'text-stone-900 hover:bg-black/15 hover:text-stone-900 drop-shadow-sm'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* ユーザー情報 */}
      <div className="p-3 border-t border-black/10 space-y-1">
        {profile && (
          <div className="px-3 py-2 rounded-lg bg-black/15">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-3.5 h-3.5 text-stone-800" />
              <span className="text-xs text-stone-900 font-medium truncate drop-shadow-sm">{profile.username}</span>
            </div>
            <div className="text-xs text-stone-900 font-semibold drop-shadow-sm">
              {formatReward(profile.total_earnings)}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-stone-900 hover:bg-black/15 transition-colors drop-shadow-sm"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          ログアウト
        </button>
      </div>
      </div>
    </aside>
  )
}
