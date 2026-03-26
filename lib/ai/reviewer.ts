import Anthropic from '@anthropic-ai/sdk'
import type { Review, ReviewComment, CodeFile } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildReviewPrompt(files: CodeFile[], requirements: string): string {
  const filesSection = files
    .map((f) => `### ${f.name}\n\`\`\`${f.language}\n${f.content}\n\`\`\``)
    .join('\n\n')

  return `あなたはシニアエンジニアです。以下の複数ファイルから成るコードを実務レベルの視点でレビューしてください。

## 要件定義
${requirements}

## 提出ファイル（${files.length}ファイル）
${filesSection}

以下のJSON形式のみで回答してください（マークダウンコードブロック不要）:
{
  "overall_score": 75,
  "readability_score": 80,
  "security_score": 70,
  "functionality_score": 75,
  "summary": "総評（200文字程度）。良い点と改善点をバランスよく伝えること。",
  "detailed_comments": [
    {
      "filename": "index.html",
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

filename は該当ファイル名を必ず入れること（例: "style.css"）。
line は該当行がない場合は null。
detailed_commentsは最大10件。スコアは0〜100の整数。`
}

export async function reviewCode(
  files: CodeFile[],
  requirements: string
): Promise<Omit<Review, 'id' | 'submission_id' | 'created_at'>> {
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: buildReviewPrompt(files, requirements),
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
