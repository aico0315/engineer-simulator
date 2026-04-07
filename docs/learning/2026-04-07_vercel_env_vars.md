# Vercel デプロイ時の Internal Server Error 対応

## 何が起きたか

Vercel に engineer-simulator をデプロイしたところ、画面に「Internal Server Error」が表示されて
アプリが動かない状態になりました。

---

## 原因

Vercel に**環境変数が一切設定されていなかった**ことが原因です。

このアプリは以下の3つの環境変数を必要とします。

| 変数名 | 用途 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトの URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の公開用 API キー |
| `ANTHROPIC_API_KEY` | Claude API の認証キー |

これらが未設定だと、アプリ起動時に Supabase への接続や Claude API の呼び出しが失敗し、
サーバーエラーになります。

---

## `.env.local` と Vercel の環境変数は別物

ローカル開発では `.env.local` に環境変数を書いて使いますが、
**このファイルは Vercel には自動で反映されません。**

```
.env.local  →  ローカル環境専用（git にも含めない）
Vercel の環境変数設定  →  本番・プレビュー環境用（別途手動で設定が必要）
```

`.env.local` が `.gitignore` に含まれているのは、
API キーなどの機密情報を誤って GitHub に公開しないためです。
そのため Vercel も自動では読み取れず、手動での設定が必要になります。

---

## 解決方法

### 1. Vercel の環境変数を設定する

Vercel ダッシュボード → プロジェクト → **Settings → Environment Variables** を開き、
必要な環境変数を1つずつ追加します。

```
Key:   NEXT_PUBLIC_SUPABASE_URL
Value: （Supabase ダッシュボードの Project URL）

Key:   NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: （Supabase ダッシュボードの anon key）

Key:   ANTHROPIC_API_KEY
Value: （Anthropic コンソールの API キー）
```

### 2. Redeploy する

環境変数を追加しただけでは反映されません。
**Deployments タブ → 最新のデプロイ → Redeploy** を実行して再ビルドします。

---

## NEXT_PUBLIC_ プレフィックスとは

変数名が `NEXT_PUBLIC_` で始まるものと始まらないものがあります。

| プレフィックス | 読み取れる場所 |
|--------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` など | サーバー・ブラウザ（クライアント）両方 |
| `ANTHROPIC_API_KEY` など | サーバー（API Routes）のみ |

`NEXT_PUBLIC_` を付けるとブラウザ側の JavaScript にも値が埋め込まれます。
Supabase の URL や anon key はブラウザからも使うため `NEXT_PUBLIC_` が必要です。

一方、`ANTHROPIC_API_KEY` はサーバー側の API Route からしか使わないので
`NEXT_PUBLIC_` を付けません。ブラウザに漏れないようにするためです。

---

## 今後のデプロイチェックリスト

新しい環境変数を `.env.local` に追加したときは、Vercel 側にも同じ変数を追加してから
Redeploy するのを忘れないようにしましょう。

```
✅ .env.local に追加
✅ Vercel の Environment Variables に追加
✅ Redeploy を実行
```
