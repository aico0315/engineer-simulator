import Anthropic from '@anthropic-ai/sdk'
import type { Review, ReviewComment } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildReviewPrompt(code: string, language: string, requirements: string): string {
  return `あなたはシニアエンジニアです。以下のコードを実務レベルの視点でレビューしてください。

## 要件定義
${requirements}

## 提出コード（${language}）
\`\`\`${language}
${code}
\`\`\`

以下のJSON形式のみで回答してください（マークダウンコードブロック不要）:
{
  "overall_score": 75,
  "readability_score": 80,
  "security_score": 70,
  "functionality_score": 75,
  "summary": "総評（200文字程度）。良い点と改善点をバランスよく伝えること。",
  "detailed_comments": [
    {
      "line": 12,
      "comment": "指摘内容の説明",
      "severity": "warning",
      "category": "security"
    }
  ]
}

評価基準:
- readability_score: 変数名の適切さ、関数の単一責任、コメントの質、コードの一貫性
- security_score: XSS・SQLインジェクション等の脆弱性、入力値のバリデーション、認証・認可
- functionality_score: 要件を満たしているか、エッジケース対応、エラーハンドリング

severity: "error"（必修修正）| "warning"（要改善）| "suggestion"（提案）
category: "readability" | "security" | "functionality" | "best_practice"

detailed_commentsは最大10件。line は該当行がない場合は null。
スコアは0〜100の整数。`
}

export async function reviewCode(
  code: string,
  language: string,
  requirements: string
): Promise<Omit<Review, 'id' | 'submission_id' | 'created_at'>> {
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',  // レビューは高精度モデルを使用
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: buildReviewPrompt(code, language, requirements),
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const parsed = JSON.parse(text)

  return {
    overall_score: parsed.overall_score,
    readability_score: parsed.readability_score,
    security_score: parsed.security_score,
    functionality_score: parsed.functionality_score,
    summary: parsed.summary,
    detailed_comments: parsed.detailed_comments as ReviewComment[],
  }
}
