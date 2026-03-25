# セットアップガイド - 開発環境の作り方

---

## 始める前に必要なもの

- **Node.js 18以上**（インストール済みであること）
- **Supabaseのアカウント**（無料で作れます）
- **AnthropicのAPIキー**（有料。クレジットの購入が必要です）

---

## Step 1: パッケージのインストール

プロジェクトのフォルダで以下のコマンドを実行します。

```bash
npm install
```

`node_modules/` というフォルダが作られ、このアプリに必要なライブラリが全部入ります。

---

## Step 2: Supabaseのプロジェクトを作る

1. [supabase.com](https://supabase.com) にアクセスしてログイン（Googleアカウントで登録できます）
2. 「New project」をクリック
3. プロジェクト名を入力（例: `engineer-simulator`）
4. データベースのパスワードを設定（後で使わないので適当でOK）
5. リージョン（サーバーの場所）は `Northeast Asia (Tokyo)` を選択
6. 作成完了まで1〜2分待ちます

---

## Step 3: データベースのテーブルを作る

1. Supabaseダッシュボードの左サイドバーから「SQL Editor」を開く
2. `supabase/migrations/001_initial_schema.sql` の内容をコピーして貼り付ける
3. 「Run」ボタンをクリック
4. エラーが出なければ完了

**ここで作られるテーブル**: profiles（ユーザー情報）、projects（案件）、user_projects（受注状況）、chat_messages（チャット）、submissions（コード提出）、reviews（レビュー結果）

---

## Step 4: 環境変数を設定する

**環境変数とは**: パスワードやAPIキーのように「外部に漏らしてはいけない情報」を安全に管理するための仕組みです。`.env.local` というファイルに書き、GitHubには公開されません（`.gitignore` で除外済み）。

### 手順

1. プロジェクトのルートフォルダに `.env.local` ファイルを作成します

```bash
cp .env.local.example .env.local
```

2. **SupabaseのURLとキーを取得する**
   - Supabaseダッシュボード → Settings → API を開く
   - `Project URL` の値をコピー → `NEXT_PUBLIC_SUPABASE_URL` に貼り付け
   - `anon public` キーをコピー → `NEXT_PUBLIC_SUPABASE_ANON_KEY` に貼り付け

3. **AnthropicのAPIキーを取得する**
   - [console.anthropic.com](https://console.anthropic.com) にアクセス
   - 「API Keys」→「Create Key」でキーを発行
   - 発行されたキーを `ANTHROPIC_API_KEY` に貼り付け

4. `.env.local` の中身はこんな形になります

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...（長い文字列）
ANTHROPIC_API_KEY=sk-ant-...（長い文字列）
```

---

## Step 5: 開発サーバーを起動する

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてトップページが表示されれば成功です。

---

## Step 6: 動作確認チェックリスト

順番に確認してみましょう。

- [ ] トップページが表示される
- [ ] 「無料で始める」からサインアップ（新規登録）できる
- [ ] サインアップ後、案件ボード（/board）に遷移する
- [ ] 「案件を生成」ボタンで案件が作成される（数秒かかります）
- [ ] 案件カードをクリックしてワークスペースに入れる
- [ ] チャット欄でAIクライアントと会話できる
- [ ] コードを貼り付けて提出し、AIレビューが返ってくる
- [ ] ダッシュボードで擬似報酬が確認できる

---

## Vercel にデプロイする（インターネット公開）

Vercel は Next.js のアプリを無料で公開できるサービスです。

```bash
# 1. GitHubにコードをpush
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/engineer-simulator.git
git push -u origin main
```

その後:
1. [vercel.com](https://vercel.com) にGitHubアカウントでログイン
2. 「New Project」→ 先ほどpushしたリポジトリを選択
3. **環境変数を設定する**（重要！）: Settings > Environment Variables に `.env.local` と同じキー・値を入力する
4. 「Deploy」をクリックして完了

**注意**: 環境変数を設定しないとAPIキーが読み込まれず、AI機能が動きません。Vercelへのデプロイ後に必ず設定してください。
