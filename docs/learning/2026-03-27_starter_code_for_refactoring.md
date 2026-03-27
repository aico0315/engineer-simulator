# リファクタリング案件へのスターターコード機能追加（2026-03-27）

---

## 何を作ったか

「コード改善」カテゴリの案件を生成したとき、AIが **リファクタリング前の問題のある既存コード** を一緒に生成し、コードエディタにプリセットする機能を追加した。

これにより「ゼロから書く」だけでなく「既存コードを読んで改善する」という、実務でよくある体験ができるようになった。

---

## 変更したファイル一覧

| ファイル | 変更内容 |
|---|---|
| `supabase/migrations/003_add_starter_files.sql` | DBにカラム追加 |
| `types/index.ts` | `Project` 型に `starter_files` フィールド追加 |
| `lib/ai/project-generator.ts` | スターターコード生成ロジックを追加 |
| `components/workspace/SubmitPanel.tsx` | 初期コードの優先順位を変更 |

---

## 1. データベースへのカラム追加

### なぜDBを変更するのか

新しいデータ（スターターコード）を保存するには、テーブルに新しい列（カラム）が必要になる。

### 実行したSQL

```sql
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS starter_files JSONB DEFAULT NULL;
```

**用語解説:**
- `ALTER TABLE` … 既存のテーブルの構造を変更する命令
- `ADD COLUMN` … 新しい列を追加する
- `IF NOT EXISTS` … すでに列が存在する場合はエラーにせずスキップ（冪等性）
- `JSONB` … JSONデータを保存できる型。配列・オブジェクトなどを柔軟に格納できる
- `DEFAULT NULL` … 値がない場合はNULL（空）にする

**ポイント:** `JSONB` を使うことで、ファイルの配列（`CodeFile[]`）をそのまま1つの列に格納できる。リレーショナルDBで「構造が決まっていない柔軟なデータ」を扱うときによく使われる手法。

---

## 2. 型定義の更新（types/index.ts）

### CodeFile 型の移動

`Project` 型の中で `CodeFile` 型を参照するようになったため、定義の順序を入れ替えた。

```typescript
// Before: CodeFile は Project より後に定義されていた（参照できない）

// After: CodeFile を先に定義する
export type CodeFile = {
  name: string
  language: string
  content: string
}

export type Project = {
  // ...
  starter_files: CodeFile[] | null  // ← CodeFile を参照できるようになった
}
```

**ポイント:** TypeScript では、型を使う前にその型が定義されている必要がある（実際には TypeScript はファイル全体を見るので厳密にはエラーにならないこともあるが、可読性のために上から順番に定義するのが慣習）。

### `starter_files` フィールドの追加

```typescript
export type Project = {
  // ...既存フィールド...
  starter_files: CodeFile[] | null  // リファクタリング案件の既存コード
}
```

`CodeFile[] | null` とすることで：
- `refactoring` 以外のカテゴリ → `null`（スターターコードなし）
- `refactoring` カテゴリ → `CodeFile[]`（ファイルの配列）

という使い分けができる。

---

## 3. AIによるスターターコード生成（project-generator.ts）

### 全体の流れ

```
① 案件情報を生成（既存）
    ↓
② refactoringカテゴリのときだけ
    ↓
③ スターターコード生成（新規追加）
    ↓
④ 両方まとめてDBに保存
```

### カテゴリに応じて処理を分岐する

```typescript
let starterFiles: CodeFile[] | null = null

if (category === 'refactoring') {
  // refactoringのときだけ2回目のAI呼び出し
  const starterMessage = await anthropic.messages.create({ ... })
  starterFiles = starterParsed.files as CodeFile[]
}

return {
  // ...
  starter_files: starterFiles,  // null か CodeFile[] が入る
}
```

**ポイント:** `if (category === 'refactoring')` で分岐することで、他のカテゴリには影響を与えずに機能を追加できる。「影響範囲を狭く保つ」のは実務でのコード変更の基本。

### スターターコード生成プロンプトの工夫

難易度に合わせて「どんな問題を含むか」を変えている：

```typescript
const messGuide: Record<DifficultyLevel, string> = {
  junior: '変数名が不明瞭、同じ処理のコピペ、マジックナンバーの使用',
  mid:    '状態管理の乱用、useEffectの依存配列ミス、コンポーネントの責務が大きすぎる',
  senior: 'N+1問題相当の非効率な処理、メモ化の欠如、型定義の甘さ',
}
```

**ポイント:** AIへの指示は「なんとなく悪いコードを書いて」より「具体的にこういう問題を含めて」と書いた方が品質が安定する。

---

## 4. コードエディタへのプリセット（SubmitPanel.tsx）

### 初期コードの優先順位

```typescript
// Before
const initialFiles = latestSubmission?.files ?? DEFAULT_FILES

// After
const initialFiles = latestSubmission?.files ?? project.starter_files ?? DEFAULT_FILES
```

`??`（Null合体演算子）を使って優先順位を表現している：

1. **前回の提出コード**があればそれを使う（再提出の場合）
2. **スターターコード**があればそれを使う（初回のリファクタリング案件）
3. どちらもなければ**デフォルト**（空の `index.html`）

**ポイント:** `??` は `null` または `undefined` のときだけ右辺を評価する。`||` との違いは、`0` や `false` や空文字 `""` を有効な値として扱う点。

---

## 今回学んだこと

| テーマ | ポイント |
|---|---|
| DB設計 | 柔軟なデータは `JSONB` で1カラムに格納できる |
| マイグレーション | `IF NOT EXISTS` で冪等性を保つ |
| 型定義 | 参照する型は先に定義する（順序を意識する） |
| 機能追加の方針 | `if (category === 'refactoring')` で影響範囲を狭く保つ |
| Null合体演算子 | `??` で優先順位のある初期値を簡潔に表現できる |
| AIプロンプト | 抽象的な指示より「具体的な問題パターン」を書くと品質が上がる |
