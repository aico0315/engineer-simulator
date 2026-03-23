import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// サーバー（Server Components / API Routes）で使うSupabaseクライアント
// cookiesを通じてセッション情報を読み書きする
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Componentからsetを呼ぶ場合はエラーを無視
            // セッション更新はmiddlewareが担当する
          }
        },
      },
    }
  )
}
