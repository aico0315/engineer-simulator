'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Code2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })

    if (signupError) {
      setError('登録に失敗しました。別のメールアドレスをお試しください。')
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
          <h1 className="text-stone-800 text-2xl font-bold mb-6">新規登録</h1>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-stone-600 text-sm font-medium mb-1.5">
                ユーザー名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
                placeholder="yamada_taro"
              />
            </div>

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
                パスワード <span className="text-stone-400 font-normal">（8文字以上）</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-stone-700 hover:bg-stone-600 disabled:bg-stone-300 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? '登録中...' : '登録してはじめる'}
            </button>
          </form>

          <p className="mt-6 text-center text-stone-400 text-sm">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-stone-600 hover:text-stone-800 underline underline-offset-2">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
