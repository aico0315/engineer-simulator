import Anthropic from '@anthropic-ai/sdk'
import type { Project, AiPersona, DifficultyLevel, ProjectCategory, CodeFile } from '@/types'

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


// リファクタリング案件用：既存の"改善前"コードを生成するプロンプト
function buildStarterCodePrompt(
  difficulty: DifficultyLevel,
  title: string,
  techStack: string[]
): string {
  const messGuide: Record<DifficultyLevel, string> = {
    junior: '変数名が不明瞭、同じ処理のコピペ、マジックナンバーの使用、コメントなし',
    mid: '状態管理の乱用（useStateの多用）、useEffectの依存配列ミス、コンポーネントの責務が大きすぎる、props drilling',
    senior: 'N+1問題相当の非効率な処理、メモ化の欠如による不要な再レンダリング、型定義の甘さ、エラーハンドリング不足、設計パターンの不適切な適用',
  }

  return `あなたはリファクタリング前の「問題のあるコード」を書くエンジニアです。
以下の案件に対して、リファクタリングが必要な既存コードを生成してください。

案件タイトル: ${title}
使用技術: ${techStack.join(', ')}
難易度: ${difficulty}

【コードの問題点の傾向】
${messGuide[difficulty]}

【注意事項】
- コードは動作するが、品質に問題がある状態にすること
- 2〜3ファイル構成にすること
- 各ファイルは50〜120行程度
- 実際のリファクタリング練習として意味のある内容にすること
- 説明やコメントは最小限（コードの問題がわかりにくくなるため）

以下のJSON形式で回答してください（マークダウンコードブロック不要、JSONのみ）:
{
  "files": [
    {
      "name": "ファイル名（例: ArticleList.tsx）",
      "language": "言語（例: tsx）",
      "content": "コードの中身（文字列）"
    }
  ]
}`
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

  // refactoringカテゴリのみ、スターターコードを別途生成する
  let starterFiles: CodeFile[] | null = null
  if (category === 'refactoring') {
    const starterMessage = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: buildStarterCodePrompt(difficulty, parsed.title, parsed.tech_stack),
        },
      ],
    })
    const starterRaw = starterMessage.content[0].type === 'text' ? starterMessage.content[0].text : ''
    const starterText = starterRaw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const starterParsed = JSON.parse(starterText)
    starterFiles = starterParsed.files as CodeFile[]
  }

  return {
    title: parsed.title,
    description: parsed.description,
    difficulty,
    category,
    reward_amount: parsed.reward_amount,
    tech_stack: parsed.tech_stack,
    ai_persona: parsed.ai_persona as AiPersona,
    starter_files: starterFiles,
  }
}
