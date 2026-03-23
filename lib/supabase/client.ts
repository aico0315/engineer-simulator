import { createBrowserClient } from '@supabase/ssr'

// ブラウザ（クライアントコンポーネント）で使うSupabaseクライアント
// 'use client' コンポーネント内でこれを呼び出す
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
