import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Next.js 16 では middleware.ts → proxy.ts にリネームされた
// 機能は同じ: リクエストのたびにセッションを更新し、未認証アクセスをリダイレクト
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // 静的ファイルとNext.js内部ルートを除くすべてのパスに適用
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
