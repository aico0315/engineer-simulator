# セキュリティ強化：API ルートへの入力バリデーション追加

## この記事で学べること

- 「動くコード」と「安全なコード」の違い
- 悪意ある入力からアプリを守る方法（バリデーション）
- zod というライブラリの基本的な使い方

---

## なぜバリデーションが必要なの？

Next.js の API Routes（`/api/...` のファイル）は、**外部から自由に呼び出せる**入口です。
ブラウザのアプリから使うのが本来の用途ですが、実は `curl` コマンドや開発者ツールから、好きな値を直接送り込むことが技術的には可能です。

たとえば `/api/chat` に対して、こんな値を送る人がいたとしましょう。

```json
{ "message": "" }
```

バリデーションがないと、空のメッセージが AI に渡って処理されてしまいます。最悪の場合、意図しない動作やエラー、課金だけが発生してしまいます。

**「フロントエンドで制限してるから大丈夫」は通じません。**
フロントエンドのチェックは「ユーザーが間違えないようにする工夫」であって、攻撃を防ぐ手段にはなりません。サーバー側でも必ず確認する必要があります。

---

## zod とは？

`zod` は「この値は〇〇という形式でなければならない」というルールを書くためのライブラリです。

```ts
import { z } from 'zod'

const Schema = z.object({
  name: z.string().min(1).max(100), // 1〜100文字の文字列
  age: z.number().int().min(0),     // 0以上の整数
})
```

このルールに合わない値が来たら、`safeParse` で安全に弾けます。

```ts
const parsed = Schema.safeParse(body) // bodyはクライアントから来た値

if (!parsed.success) {
  // ルールに合わなかった → エラーを返して処理を止める
  return NextResponse.json({ error: '入力が不正です' }, { status: 400 })
}

// ここに来た時点で parsed.data の中身は安全な値
const { name, age } = parsed.data
```

---

## 今回追加した3つのバリデーション

### 1. `/api/chat`（AIとのチャット）

```ts
const ChatSchema = z.object({
  userProjectId: z.string().uuid(),   // UUID形式のみ許可（例: "123e4567-e89b-..."）
  projectId: z.string().uuid(),       // 同上
  message: z.string().min(1).max(4000), // 1〜4000文字
})
```

- **UUID形式チェック**：プロジェクトのIDは固定フォーマット（UUID）なので、それ以外の文字列が来たら即エラーにします
- **文字数チェック**：空メッセージや異常に長いメッセージを弾きます（長すぎるとAIの処理コストが無駄にかかる）

### 2. `/api/review`（コードレビュー）

```ts
const CodeFileSchema = z.object({
  name: z.string().min(1).max(200),     // ファイル名
  content: z.string().max(100000),      // ファイルの中身（最大10万文字）
  language: z.string().min(1).max(50),  // 言語名
})

const ReviewSchema = z.object({
  userProjectId: z.string().uuid(),
  requirements: z.string().min(1).max(10000),
  files: z.array(CodeFileSchema).min(1).max(20), // 1〜20ファイルまで
})
```

- **配列の個数制限**：ファイルを大量に送りつけてサーバーに負荷をかける攻撃を防ぎます
- **ネストしたバリデーション**：`files` の中の各ファイルも1つずつチェックします

### 3. `/api/projects/generate`（案件生成）

```ts
const GenerateSchema = z.object({
  difficulty: z.enum(['junior', 'mid', 'senior']).default('junior'),
  category: z.enum(['lp', 'ec', 'admin', 'dashboard', 'auth', 'api_integration', 'refactoring']).default('lp'),
})
```

- **enum（列挙）チェック**：決まった選択肢以外の値を完全に排除します
- `.default('junior')` で値が来なかった時のデフォルトも指定できます

---

## バリデーションの前後でコードはこう変わった

**Before（バリデーションなし）**
```ts
// クライアントから来た値をそのまま使う
const { userProjectId, message, projectId } = await request.json()
```

**After（バリデーションあり）**
```ts
const body = await request.json()
const parsed = ChatSchema.safeParse(body)

if (!parsed.success) {
  return NextResponse.json({ success: false, error: '入力が不正です' }, { status: 400 })
}

// parsed.data は安全な値だと保証されている
const { userProjectId, message, projectId } = parsed.data
```

`parsed.data` を使うのがポイント。`body` ではなく `parsed.data` を参照することで、TypeScript も「この値は検証済みだ」と認識してくれます。

---

## よく使う zod のルール

| ルール | 意味 |
|---|---|
| `z.string()` | 文字列 |
| `z.string().min(1)` | 1文字以上 |
| `z.string().max(100)` | 100文字以下 |
| `z.string().uuid()` | UUID形式（`xxxxxxxx-xxxx-...`） |
| `z.number().int()` | 整数 |
| `z.boolean()` | true/false |
| `z.enum(['a', 'b'])` | 'a' または 'b' のみ |
| `z.array(schema)` | 配列 |
| `z.array(schema).min(1).max(20)` | 1〜20個の配列 |
| `.default('value')` | 値がない場合のデフォルト |
| `.optional()` | なくても OK |

---

## まとめ

- **クライアントからの入力は絶対に信用しない**のがサーバー側の鉄則
- `zod` を使うと「この形式でなければエラー」というルールをシンプルに書ける
- `safeParse` で失敗を安全に捕まえ、成功時は `parsed.data` を使う
- バリデーションは「ユーザーが間違えた時のエラー表示」だけでなく、**不正アクセスへの防衛**でもある
