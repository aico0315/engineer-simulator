import Anthropic from '@anthropic-ai/sdk'
import type { Project, AiPersona, DifficultyLevel, ProjectCategory } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// 案件生成のプロンプト
function buildPrompt(difficulty: DifficultyLevel, category: ProjectCategory): string {
  const difficultyGuide: Record<DifficultyLevel, string> = {
    junior: '初学者向け。シンプルなHTML/CSS/JSやReactの基礎的な実装。コンポーネント1〜2個程度。',
    mid: '実務経験1〜2年向け。状態管理・API連携・フォームバリデーションを含む。',
    senior: '実務経験3年以上向け。パフォーマンス最適化・セキュリティ考慮・設計パターンの適用が求められる。',
  }

  return `あなたは日本のWeb開発の案件を出す架空のクライアントです。
以下の条件で、実務に近い「架空の開発依頼」を1件生成してください。

難易度: ${difficulty}（${difficultyGuide[difficulty]}）
カテゴリ: ${category}

【ai_persona の多様性について】
- 名前は毎回必ず異なる人物にすること。「田中」「佐藤」「美咲」などの特定の名前に偏らないこと
- 性別・年齢層・職種をランダムに変えること（例：40代男性の部長、20代女性の起業家、60代男性のオーナーなど）
- avatar_emoji も人物の属性に合わせて毎回変えること（👨‍💼👩‍💼👴👨‍🍳👩‍🔬 など）
- 会社名も業種・規模感をバラエティ豊かにすること

【description の書き方の注意事項】
- クライアントが書いた「要件定義書」として書くこと。第三者のコメントや感想は一切入れない
- 「良い学習機会」「初心者向け」などの教育的なコメントは絶対に書かない
- Figmaデザイン・デザインカンプ・参考URLなど、実際に存在しないリソースへの言及は書かない
- 納期・予算・連絡先なども実在しないため書かない
- ## 背景、## 要件、## 技術仕様 の3セクションのみで構成すること

以下のJSON形式で回答してください（マークダウンコードブロック不要、JSONのみ）:
{
  "title": "案件タイトル（例: 美容サロン向けLP制作）",
  "description": "要件定義（Markdown形式、500〜800文字）。## 背景、## 要件、## 技術仕様 のセクションのみ。",
  "reward_amount": 50000,
  "tech_stack": ["Next.js", "TypeScript", "Tailwind CSS"],
  "ai_persona": {
    "name": "クライアントの名前",
    "company": "会社名",
    "personality": "性格の説明（例: 細かい確認を求めるが感謝を忘れない）",
    "tone": "口調（例: 丁寧語、です/ます調）",
    "avatar_emoji": "👩‍💼"
  }
}

報酬の目安:
- junior: 30,000〜80,000円
- mid: 80,000〜200,000円
- senior: 200,000〜500,000円`
}


export async function generateProject(
  difficulty: DifficultyLevel,
  category: ProjectCategory
): Promise<Omit<Project, 'id' | 'is_active' | 'created_at'>> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: buildPrompt(difficulty, category),
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  // AIがmarkdownコードブロックで返すことがあるので除去する
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/,'').trim()
  const parsed = JSON.parse(text)

  return {
    title: parsed.title,
    description: parsed.description,
    difficulty,
    category,
    reward_amount: parsed.reward_amount,
    tech_stack: parsed.tech_stack,
    ai_persona: parsed.ai_persona as AiPersona,
  }
}
