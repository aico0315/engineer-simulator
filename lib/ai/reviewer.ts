import Anthropic from '@anthropic-ai/sdk'
import type { Review, ReviewComment, CodeFile, DifficultyLevel } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DIFFICULTY_INSTRUCTIONS: Record<DifficultyLevel, string> = {
  junior: `
【レビュアーの姿勢】
あなたは初心者を育てる優しいメンターです。励ましを忘れずに、自信を持って取り組めるようフィードバックしてください。

【severity の使い分け（厳守）】
- "error"   : アプリが動作しなくなる致命的なバグ、または明確なXSS・SQLインジェクション等のセキュリティ脆弱性のみ。
              「あった方が良い」程度のものは error にしない。
- "warning" : 動作はするが改善すべき点（可読性・構造・軽微なベストプラクティス違反など）
- "suggestion": より良くするための提案

errorは本当に深刻な問題のみに絞り、初心者が萎縮しないよう、warningやsuggestionを中心にフィードバックしてください。`,

  mid: `
【レビュアーの姿勢】
あなたは実務経験を積んだエンジニアを指導する中堅のTechLeadです。品質意識を高めるフィードバックをしてください。

【severity の使い分け（厳守）】
- "error"   : 致命的なバグ・セキュリティ脆弱性に加え、重大なベストプラクティス違反
              （例：エラーハンドリングの完全な欠如、明らかに不適切な状態管理、パフォーマンスに深刻な影響を与える実装）
- "warning" : 改善すべき設計上の問題、可読性・保守性の課題
- "suggestion": より良い実装パターンの提案

実務で「これは直してほしい」と思うレベルのものをerrorにしてください。`,

  senior: `
【レビュアーの姿勢】
あなたは厳格なシニアエンジニアです。実務水準で妥協なくレビューしてください。

【severity の使い分け（厳守）】
- "error"   : 即座に修正が必要なもの全般。バグ・セキュリティ・重大なベストプラクティス違反・
              保守性を著しく損なう実装・テスタビリティの欠如など、実務でPRをマージできないレベルのもの
- "warning" : 改善を強く推奨する点
- "suggestion": より洗練された実装への提案

実務のコードレビューと同水準で、妥協なく指摘してください。`,
}

function buildReviewPrompt(files: CodeFile[], requirements: string, difficulty: DifficultyLevel): string {
  const filesSection = files
    .map((f) => `### ${f.name}\n\`\`\`${f.language}\n${f.content}\n\`\`\``)
    .join('\n\n')

  return `あなたはコードレビュアーです。以下の複数ファイルから成るコードをレビューしてください。

${DIFFICULTY_INSTRUCTIONS[difficulty]}

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

category: "readability" | "security" | "functionality" | "best_practice"
filename は該当ファイル名を必ず入れること（例: "style.css"）。
line は該当行がない場合は null。
detailed_commentsは最大10件。スコアは0〜100の整数。`
}

export async function reviewCode(
  files: CodeFile[],
  requirements: string,
  difficulty: DifficultyLevel
): Promise<Omit<Review, 'id' | 'submission_id' | 'created_at'>> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: buildReviewPrompt(files, requirements, difficulty),
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
  // AIがmarkdownコードブロックで返すことがあるので除去する
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
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
