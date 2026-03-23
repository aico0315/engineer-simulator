# Claude AI統合解説 - AIとの連携パターン

## Anthropic SDKの基本

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const message = await anthropic.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'こんにちは' }],
})

const text = message.content[0].text  // AIの返答テキスト
```

---

## このアプリの3つのAI機能

### 1. 案件生成（lib/ai/project-generator.ts）

**プロンプトエンジニアリングのポイント**:
```
「以下のJSON形式のみで回答してください（マークダウンコードブロック不要、JSONのみ）」
```
AIはデフォルトで ```json ... ``` というMarkdownコードブロックで囲んで返すことが多い。
`JSON.parse()` に渡すためには純粋なJSONが必要なので、明示的に指示する。

**モデル選択**: `claude-opus-4-6`（最高品質）
→ 案件生成は頻度が低く、高品質なアウトプットが必要なため

### 2. ヒアリングチャット（lib/ai/chat-client.ts）

**システムプロンプトの役割**:
```typescript
system: `あなたは「${persona.name}」という架空のクライアントです。
会社: ${persona.company}
性格: ${persona.personality}
口調: ${persona.tone}
...`
```
`system` プロンプトはAIの「役割設定」。会話の最初から最後まで適用される。
`messages` は会話履歴（ユーザーとAIの発言の積み重ね）。

**モデル選択**: `claude-haiku-4-5-20251001`（高速・低コスト）
→ リアルタイムなチャットはレスポンス速度が最重要

**会話履歴の管理**:
```typescript
// Supabaseのメッセージ → Anthropic APIのメッセージ形式に変換
const anthropicMessages = messages.map(msg => ({
  role: msg.role === 'user' ? 'user' : 'assistant',
  content: msg.content,
}))
```
Anthropic APIは `user` / `assistant` の交互のやり取りしか受け付けない。
会話履歴全体を毎回渡すことで「文脈を覚えている」かのように動作する。

### 3. コードレビュー（lib/ai/reviewer.ts）

**評価観点を構造化するプロンプト**:
```
評価基準:
- readability_score: 変数名の適切さ、関数の単一責任...
- security_score: XSS・SQLインジェクション等の脆弱性...
- functionality_score: 要件を満たしているか...
```
評価観点を明示することで、AIが一貫した基準でスコアリングする。

**モデル選択**: `claude-opus-4-6`（最高品質）
→ コードの品質評価には高い理解力が必要

---

## JSONパースの安全な実装

現在の実装はシンプルにしているが、本番環境では以下の対策が有効：

```typescript
// AIが JSON 以外のテキストを返した場合のフォールバック
try {
  // JSONブロックが含まれている場合を考慮
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text)
  return parsed
} catch {
  throw new Error('AIのレスポンスをJSONとして解析できませんでした')
}
```

---

## ハマりポイント

1. **`max_tokens` の設定ミス**: 小さすぎると途中で切れる。JSONが不完全になりパースエラーに
2. **会話履歴は `user` から始まる必要がある**: `assistant` から始めるとAPIエラー
3. **APIキーをフロントエンドに書かない**: `.env.local` に書き、`NEXT_PUBLIC_` をつけない
4. **レート制限**: 同時に大量のリクエストを送ると429エラー。本番ではキューイングが必要
5. **コスト管理**: Opusは高精度だが高コスト。用途に応じてHaikuと使い分ける
