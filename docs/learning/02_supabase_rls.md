# Supabase & RLS解説 - データベース設計とセキュリティ

## RLS（Row Level Security）とは

**一言で言うと**: 「このユーザーはこの行しか触れない」をDBレベルで強制するセキュリティ機能。

### なぜ重要か

フロントエンドだけでセキュリティを実装すると...
- URLを直接叩けばAPIが通ってしまう
- 他人のデータを取得・更新できてしまう危険性がある

RLSはDBに直接ルールを書くので、**どんな経路でもルールが適用される**。

---

## このアプリのRLS設計

### profilesテーブル
```sql
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);
```
`auth.uid()` = ログイン中のユーザーID。「自分のIDと一致する行だけ」という意味。

### chat_messagesテーブル（JOINが必要なケース）
```sql
CREATE POLICY "chat_messages_own" ON chat_messages
  FOR ALL USING (
    user_project_id IN (
      SELECT id FROM user_projects WHERE user_id = auth.uid()
    )
  );
```
chat_messagesには直接 `user_id` がないので、`user_projects` テーブルを経由して
「自分の受注案件に紐づくメッセージだけ」を判定している。

---

## テーブル設計のポイント

### JOINキーの設計
```
profiles(id) ← auth.users(id) の拡張
    ↑
user_projects(user_id) ← profiles(id) を参照
    ↑
chat_messages(user_project_id) ← user_projects(id) を参照
submissions(user_project_id) ← user_projects(id) を参照
    ↑
reviews(submission_id) ← submissions(id) を参照
```

このように**外部キーで繋ぐ**ことで、
「どのユーザーの、どの案件の、どのコードに対するレビューか」が追跡できる。

### JOINキーはすべてUUID
`gen_random_uuid()` でランダムなUUIDを生成。
連番（1, 2, 3...）と違い、**IDから推測できない**のでセキュリティが向上。

### JSONBカラムの使いどころ
`ai_persona` と `detailed_comments` を JSONB にした理由:
- AIペルソナは「名前・会社名・性格・口調・絵文字」など構造が決まっているが、将来変わる可能性がある
- レビューコメントは件数が可変（0〜10件）

JSONB = JSONを型安全にDB内に保存する仕組み。検索もできる。

---

## Supabaseクライアントの使い分け

| ファイル | 使う場所 | 理由 |
|---|---|---|
| `lib/supabase/client.ts` | `'use client'` コンポーネント | ブラウザのCookieを自動管理 |
| `lib/supabase/server.ts` | Server Component / API Route | サーバーのCookieを手動で読み書き |
| `lib/supabase/middleware.ts` | `middleware.ts` | リクエストのCookieを更新してセッションを維持 |

---

## ハマりポイント

1. **RLSを有効化し忘れる**: `ENABLE ROW LEVEL SECURITY` を忘れると誰でもデータにアクセスできる
2. **ポリシーがないとデータが取れない**: RLSを有効にしたら必ずポリシーを作る
3. **service_roleキーはサーバー専用**: フロントエンドに公開すると全データにアクセスされる危険
4. **`anon`キーはフロントに使える**: RLSで制限された範囲しかアクセスできないので安全
