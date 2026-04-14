'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Code2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('メールアドレスまたはパスワードが正しくありません')
      setLoading(false)
      return
    }

    router.push('/board')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8 font-bold text-xl text-stone-700">
          <Code2 className="w-6 h-6 text-stone-500" />
          <span>Engineer Simulator</span>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
          <h1 className="text-stone-800 text-2xl font-bold mb-6">ログイン</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-stone-600 text-sm font-medium mb-1.5">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-stone-600 text-sm font-medium mb-1.5">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-stone-700 hover:bg-stone-600 disabled:bg-stone-300 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <p className="mt-6 text-center text-stone-400 text-sm">
            アカウントをお持ちでない方は{' '}
            <Link href="/signup" className="text-stone-600 hover:text-stone-800 underline underline-offset-2">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
