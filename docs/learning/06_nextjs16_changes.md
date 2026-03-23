# Next.js 16 の変更点 - ハマりポイント集

## 最重要: `middleware.ts` → `proxy.ts` への変更

Next.js 16 から、ルートディレクトリの `middleware.ts` ファイルが **`proxy.ts`** にリネームされました。

### 変更前（Next.js 15以前）
```typescript
// middleware.ts
export function middleware(request: NextRequest) { ... }
```

### 変更後（Next.js 16）
```typescript
// proxy.ts
export function proxy(request: NextRequest) { ... }
```

**変更点まとめ**:
- ファイル名: `middleware.ts` → `proxy.ts`
- 関数名: `middleware` → `proxy`（または `default export`）
- `config` の `matcher` は同じ

**理由**: 「Middlewareという名前がその機能（リクエストの前処理）を正確に表していない」として `Proxy` に改名された。機能自体は完全に同じ。

---

## このプロジェクトでの対応

`proxy.ts` を作成し、古い `middleware.ts` を削除しました:

```typescript
// proxy.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

`lib/supabase/middleware.ts` のファイル名は変更不要（内部実装ファイルなので、Next.jsのルール対象外）。

---

## その他の変更点（参考）

### `cookies()` の `await` が必須
Next.js 15以降、`cookies()` は非同期関数になった:
```typescript
// NG（古い書き方）
const cookieStore = cookies()

// OK（新しい書き方）
const cookieStore = await cookies()
```

### `params` が `Promise` になった
Dynamic Route の `params` が Promise に:
```typescript
// NG（古い書き方）
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params
}

// OK（新しい書き方）
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

このプロジェクトの `workspace/[projectId]/page.tsx` では対応済み:
```typescript
export default async function WorkspacePage({ params }: Props) {
  const { projectId } = await params  // ← await が必要
```

---

## AIで書いたコードをそのまま使う際の注意

ChatGPTやClaude等のAIが生成するNext.jsコードは、
トレーニングデータのカットオフ日時点の古いバージョンのコードを生成することがある。

**確認すべき主な変更点**:
1. `middleware.ts` → `proxy.ts`（Next.js 16）
2. `params` の `await`（Next.js 15+）
3. `cookies()` の `await`（Next.js 15+）
4. Server Actionsの書き方の変化

**実務でのベストプラクティス**: 新しいフレームワークを使う際は必ず公式ドキュメントを確認する。
このプロジェクトでは `node_modules/next/dist/docs/` に最新ドキュメントが含まれている。
