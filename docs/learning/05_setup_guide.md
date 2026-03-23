# セットアップガイド - 開発環境の構築手順

## 前提条件

- Node.js 18以上がインストール済み
- Supabaseアカウント（無料）
- Anthropic APIキー

---

## Step 1: リポジトリのクローンと依存関係のインストール

```bash
cd /Users/aico/projects/engineer-simulator
npm install
```

---

## Step 2: Supabaseプロジェクトの作成

1. [supabase.com](https://supabase.com) にアクセスしてログイン
2. 「New project」をクリック
3. プロジェクト名: `engineer-simulator`（任意）
4. パスワードを設定（後で使わないので何でも可）
5. リージョン: `Northeast Asia (Tokyo)` を選択
6. 作成完了まで1〜2分待つ

---

## Step 3: Supabaseのテーブルを作成

1. Supabaseダッシュボードの左サイドバーから「SQL Editor」を開く
2. `supabase/migrations/001_initial_schema.sql` の内容をコピーして貼り付け
3. 「Run」ボタンをクリック
4. エラーがなければ完了

---

## Step 4: 環境変数の設定

1. プロジェクトルートに `.env.local` ファイルを作成

```bash
cp .env.local.example .env.local
```

2. Supabaseの設定値を取得:
   - ダッシュボード > Settings > API
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Anthropic APIキーを取得:
   - [console.anthropic.com](https://console.anthropic.com) にアクセス
   - API Keys → Create Key
   - → `ANTHROPIC_API_KEY`

4. `.env.local` を編集:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Step 5: 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く。

---

## Step 6: 動作確認チェックリスト

- [ ] トップページが表示される
- [ ] 「無料で始める」からサインアップできる
- [ ] サインアップ後、案件ボードに遷移する
- [ ] 「案件を生成」ボタンで案件が作成される（AIが生成するため10〜20秒かかる）
- [ ] 案件カードをクリックしてワークスペースに入れる
- [ ] ヒアリングチャットで質問を送れる
- [ ] コードを貼り付けて提出し、レビューが返ってくる
- [ ] ダッシュボードで報酬が表示される

---

## Vercelへのデプロイ

```bash
# 1. GitHubにpush
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/engineer-simulator.git
git push -u origin main

# 2. vercel.com でGitHubリポジトリを選択してデプロイ
# 3. 環境変数を Vercel のダッシュボードから設定
```

Vercelの環境変数設定: Settings > Environment Variables に
`.env.local` と同じキー・値を追加する。
