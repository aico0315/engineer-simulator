# アーキテクチャ解説 - アプリ全体の設計

## このドキュメントの目的

「なぜこのフォルダ構成・設計にしたのか」を理解することで、
実務でのプロジェクト設計の考え方が身につきます。

---

## 技術スタックの選定理由

### Next.js (App Router)
**実務での使われ方**: 日本のWeb開発案件の多くがReact/Next.jsを採用。特にApp Routerは2023年以降の標準。

**なぜApp Routerか**:
- Server Components により、データ取得をサーバー側で行える → パフォーマンス向上
- `page.tsx` / `layout.tsx` というファイル名規則だけでルーティングが完成する
- 認証チェックをサーバーサイドで行えるため、セキュリティが向上

### Supabase
**実務での使われ方**: スタートアップやハッカソン、個人開発で急速に普及。
バックエンドエンジニアなしでDBと認証が構築できる。

**なぜSupabaseか**:
- PostgreSQLベースなので本格的なRDBの知識が身につく
- RLS（Row Level Security）という強力なセキュリティ機能がある
- リアルタイム機能・認証・ストレージが全部入り

### Anthropic Claude API
**実務での使われ方**: GPT-4やGeminiと並ぶLLM。日本語の精度が高く、JSON出力の安定性が優れている。

---

## フォルダ構成の設計思想

```
app/           ← ルーティング（URLとページの対応）
components/    ← UIパーツ（再利用可能な部品）
lib/           ← ロジック（APIクライアント、ユーティリティ）
types/         ← 型定義（TypeScriptの型）
hooks/         ← カスタムフック（状態管理ロジックの分離）
docs/          ← このドキュメント群
supabase/      ← DBの設計・マイグレーション
```

**ポイント**: `components/` の中をさらに機能別（board/, workspace/, chat/...）に分けているのは
「どの機能に関するUIか」を一目でわかるようにするため。実務でよく使われるパターンです。

---

## データの流れ（全体像）

```
ユーザー操作
    ↓
Client Component（'use client'）
    ↓ fetch('/api/...')
API Route (app/api/.../route.ts)
    ↓ createClient() ← サーバー用Supabaseクライアント
Supabase DB（RLSで認可チェック）
    ↓ Anthropic SDK
Claude AI API
    ↓ レスポンスをDBに保存
    ↓
JSONレスポンスをクライアントへ返す
    ↓
画面を更新（router.refresh() または useState）
```

**重要**: `lib/supabase/client.ts`（ブラウザ用）と `lib/supabase/server.ts`（サーバー用）を
**使い分けている理由** → Supabaseのセッション管理方式が異なるため。
ブラウザではCookieを自動管理、サーバーではリクエストのCookieを手動で読み書きする。

---

## ハマりポイント

1. **`'use client'` の付け忘れ**: イベントハンドラ（onClick等）を使うコンポーネントには必須
2. **Server ComponentでのCookie取得**: `cookies()` は `await` が必要（Next.js 15以降）
3. **Supabaseの型が `any` になる**: `@/types/index.ts` で自前の型を定義して解決
