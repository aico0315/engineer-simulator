// TODO: Anthropic APIクレジット復活後に元に戻す
// import Anthropic from '@anthropic-ai/sdk'
import type { Project, AiPersona, DifficultyLevel, ProjectCategory } from '@/types'

type MockProject = Omit<Project, 'id' | 'is_active' | 'created_at' | 'difficulty' | 'category'>

// モックデータ（APIクレジット停止中の仮実装）
const MOCK_PROJECTS: Record<DifficultyLevel, Record<ProjectCategory, MockProject>> = {
  junior: {
    lp: {
      title: '美容サロン向けランディングページ制作',
      description: `## 背景\n渋谷にある小規模美容サロン「Hair & Relax YUKI」のオーナーから、集客用のランディングページ制作を依頼されました。現在はSNSのみで集客しており、予約はDMで受け付けている状態です。\n\n## 要件\n- ファーストビューにキャッチコピーと予約ボタンを配置\n- メニュー・料金表のセクション\n- スタッフ紹介（オーナー1名）\n- アクセス情報（Google Mapsの埋め込み）\n- 問い合わせフォーム（メール送信は不要、見た目のみ）\n- スマートフォン対応（レスポンシブ）\n\n## 技術仕様\n- HTML / CSS / JavaScript のみで実装\n- CSSフレームワーク不使用（素のCSSで記述）\n- 画像はunsplash等のフリー素材を使用`,
      reward_amount: 50000,
      tech_stack: ['HTML', 'CSS', 'JavaScript'],
      ai_persona: {
        name: '田中 優子',
        company: 'Hair & Relax YUKI',
        personality: '親しみやすく丁寧だが、デザインの好みについては細かくフィードバックをくれる',
        tone: 'です/ます調。絵文字を時々使う。',
        avatar_emoji: '💇‍♀️',
      } as AiPersona,
    },
    api: {
      title: 'シンプルなTODOアプリのREST API実装',
      description: `## 背景\n個人開発者がフロントエンドの学習用に使うTODOアプリのバックエンドAPIを必要としています。\n\n## 要件\n- TODO一覧取得（GET /todos）\n- TODO作成（POST /todos）\n- TODO更新（PUT /todos/:id）\n- TODO削除（DELETE /todos/:id）\n- 完了/未完了の切り替え\n\n## 技術仕様\n- Node.js + Express\n- データはメモリ上に保持（DBは不要）\n- レスポンスはJSON形式\n- CORSを許可する設定を追加すること`,
      reward_amount: 40000,
      tech_stack: ['Node.js', 'Express'],
      ai_persona: {
        name: '佐藤 健',
        company: '個人開発',
        personality: 'フレンドリーでエンジニア気質。技術的な会話が好き。',
        tone: 'タメ口に近いカジュアルな文体',
        avatar_emoji: '👨‍💻',
      } as AiPersona,
    },
    ui_component: {
      title: 'Reactモーダルコンポーネントの実装',
      description: `## 背景\n社内ツール開発チームから、汎用的に使えるモーダルコンポーネントの作成を依頼されました。\n\n## 要件\n- 開く/閉じるアニメーション付き\n- 背景クリックで閉じる\n- タイトル・本文・フッターのスロット構成\n- ESCキーで閉じる\n- スクロールロック対応\n\n## 技術仕様\n- React + TypeScript\n- Tailwind CSS でスタイリング\n- Props でカスタマイズ可能にすること`,
      reward_amount: 35000,
      tech_stack: ['React', 'TypeScript', 'Tailwind CSS'],
      ai_persona: {
        name: '山田 太郎',
        company: '株式会社テックラボ',
        personality: '穏やかで要件が明確。追加の質問にも快く答えてくれる。',
        tone: '丁寧語',
        avatar_emoji: '🧑‍💼',
      } as AiPersona,
    },
    form: {
      title: '求人応募フォームの実装',
      description: `## 背景\n中小企業の採用担当者から、自社サイトに掲載する求人応募フォームの作成依頼を受けました。\n\n## 要件\n- 氏名・メールアドレス・電話番号・志望動機の入力欄\n- 各フィールドのバリデーション（必須・形式チェック）\n- エラーメッセージの表示\n- 送信成功時の完了メッセージ表示\n- 送信処理はダミーでOK（console.logのみ）\n\n## 技術仕様\n- React + TypeScript\n- React Hook Form を使用\n- Tailwind CSS でスタイリング`,
      reward_amount: 45000,
      tech_stack: ['React', 'TypeScript', 'React Hook Form', 'Tailwind CSS'],
      ai_persona: {
        name: '鈴木 花子',
        company: '株式会社サンライズ商事',
        personality: 'IT初心者のため、技術用語を使わない説明を好む',
        tone: '丁寧で少し遠慮がちな文体',
        avatar_emoji: '👩‍💼',
      } as AiPersona,
    },
    dashboard: {
      title: '売上サマリーダッシュボードのUI実装',
      description: `## 背景\n小売業者から月次売上を可視化するシンプルなダッシュボードUIの依頼を受けました。\n\n## 要件\n- 今月の売上合計・注文数・平均単価のKPIカード表示\n- 過去7日間の売上グラフ（折れ線）\n- 最近の注文一覧テーブル（5件）\n- データはハードコードのダミーデータを使用\n\n## 技術仕様\n- React + TypeScript\n- Tailwind CSS\n- グラフはRechartsを使用`,
      reward_amount: 55000,
      tech_stack: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts'],
      ai_persona: {
        name: '伊藤 誠',
        company: '株式会社フレッシュマート',
        personality: '数字に強く、データの正確性を重視する',
        tone: 'ビジネスライクで簡潔',
        avatar_emoji: '📊',
      } as AiPersona,
    },
    auth: {
      title: 'ログイン・会員登録画面の実装',
      description: `## 背景\nスタートアップ企業から、新規サービスのログイン・会員登録画面の作成依頼を受けました。\n\n## 要件\n- メールアドレス・パスワードでのログイン画面\n- ユーザー名・メール・パスワードの会員登録画面\n- バリデーション（必須・メール形式・パスワード8文字以上）\n- ローディング状態の表示\n- 実際の認証処理は不要（UIのみ）\n\n## 技術仕様\n- React + TypeScript\n- Tailwind CSS\n- React Hook Form`,
      reward_amount: 40000,
      tech_stack: ['React', 'TypeScript', 'Tailwind CSS', 'React Hook Form'],
      ai_persona: {
        name: '中村 亮',
        company: 'スタートアップX',
        personality: 'スピード感を重視。デザインはシンプルモダンが好み。',
        tone: 'カジュアルで端的',
        avatar_emoji: '🚀',
      } as AiPersona,
    },
  },
  mid: {
    lp: {
      title: 'SaaSプロダクトのマーケティングLP',
      description: `## 背景\nB2B向けSaaSを展開する企業から、新機能リリースに合わせたランディングページの制作依頼を受けました。コンバージョン（無料トライアル申込）の最大化が目標です。\n\n## 要件\n- ファーストビューにヒーロー動画（YouTube埋め込み）と CTAボタン\n- 機能紹介セクション（アニメーション付き）\n- 料金プラン比較テーブル\n- 導入企業のロゴ一覧\n- FAQアコーディオン\n- 無料トライアル申込フォーム（フォームの送信処理は不要）\n\n## 技術仕様\n- Next.js + TypeScript\n- Tailwind CSS\n- Framer Motion でスクロールアニメーション実装`,
      reward_amount: 120000,
      tech_stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
      ai_persona: {
        name: '高橋 マネージャー',
        company: '株式会社クラウドワークスプロ',
        personality: 'マーケティング視点が強く、CVRへの言及が多い。修正サイクルが速い。',
        tone: 'ビジネスライク。英語の専門用語を混ぜる。',
        avatar_emoji: '📈',
      } as AiPersona,
    },
    api: {
      title: 'ユーザー認証APIの実装（JWT）',
      description: `## 背景\nモバイルアプリ開発チームから、バックエンドの認証APIの構築依頼を受けました。\n\n## 要件\n- 会員登録・ログイン・ログアウトエンドポイント\n- JWTによるアクセストークン発行（有効期限1時間）\n- リフレッシュトークンの実装\n- パスワードのハッシュ化（bcrypt）\n- 認証が必要なエンドポイントのミドルウェア\n\n## 技術仕様\n- Node.js + Express + TypeScript\n- PostgreSQL（Supabase可）\n- jsonwebtoken / bcryptjs を使用`,
      reward_amount: 150000,
      tech_stack: ['Node.js', 'Express', 'TypeScript', 'PostgreSQL', 'JWT'],
      ai_persona: {
        name: '渡辺 CTO',
        company: '株式会社モバイルファースト',
        personality: 'セキュリティに厳しく、実装の根拠を説明できることを求める',
        tone: '技術的で端的。レビューが厳しい。',
        avatar_emoji: '🔐',
      } as AiPersona,
    },
    ui_component: {
      title: 'データテーブルコンポーネントの実装',
      description: `## 背景\n管理画面開発チームから、汎用データテーブルコンポーネントの作成依頼を受けました。\n\n## 要件\n- ソート機能（昇順/降順）\n- ページネーション（1ページ20件）\n- 列の表示/非表示切り替え\n- 行の選択（チェックボックス）\n- 検索フィルター\n- CSVエクスポートボタン\n\n## 技術仕様\n- React + TypeScript\n- TanStack Table（旧React Table）を使用\n- Tailwind CSS`,
      reward_amount: 100000,
      tech_stack: ['React', 'TypeScript', 'TanStack Table', 'Tailwind CSS'],
      ai_persona: {
        name: '小林 リーダー',
        company: '株式会社データビジョン',
        personality: '再利用性と型安全性を重視するベテランエンジニア',
        tone: '技術的で簡潔。コードレビューが細かい。',
        avatar_emoji: '📋',
      } as AiPersona,
    },
    form: {
      title: '多段階フォーム（ウィザード）の実装',
      description: `## 背景\n保険会社から、見積もり申込用の多段階フォームの制作依頼を受けました。\n\n## 要件\n- 3ステップのウィザード形式（個人情報→プラン選択→確認）\n- 各ステップのバリデーション\n- 前のステップへ戻れる\n- 入力データの保持\n- 最終確認画面で全入力内容を表示\n- 送信完了画面\n\n## 技術仕様\n- React + TypeScript\n- React Hook Form + Zod でバリデーション\n- Tailwind CSS`,
      reward_amount: 130000,
      tech_stack: ['React', 'TypeScript', 'React Hook Form', 'Zod', 'Tailwind CSS'],
      ai_persona: {
        name: '松本 部長',
        company: '第一安心保険株式会社',
        personality: 'ユーザー体験を重視するが、ITリテラシーは高くない',
        tone: '丁寧で慎重。確認事項が多い。',
        avatar_emoji: '🏢',
      } as AiPersona,
    },
    dashboard: {
      title: 'リアルタイム在庫管理ダッシュボード',
      description: `## 背景\n物流会社から、倉庫の在庫状況をリアルタイムで確認できる管理画面の依頼を受けました。\n\n## 要件\n- 在庫一覧テーブル（商品名・在庫数・ステータス）\n- 在庫アラート（閾値以下で警告表示）\n- カテゴリ別在庫グラフ\n- 入出庫履歴（直近50件）\n- データの自動更新（30秒ごと）\n\n## 技術仕様\n- Next.js + TypeScript\n- Supabase Realtime でリアルタイム更新\n- Recharts でグラフ表示\n- Tailwind CSS`,
      reward_amount: 180000,
      tech_stack: ['Next.js', 'TypeScript', 'Supabase', 'Recharts', 'Tailwind CSS'],
      ai_persona: {
        name: '加藤 システム担当',
        company: '株式会社ロジスティクスプロ',
        personality: '現場の使いやすさを最優先。UIのわかりやすさにこだわる。',
        tone: '現場感のある言葉遣い。率直。',
        avatar_emoji: '📦',
      } as AiPersona,
    },
    auth: {
      title: 'OAuth連携ログイン機能の実装',
      description: `## 背景\nWebサービスにGoogle・GitHubによるソーシャルログインを追加する依頼を受けました。\n\n## 要件\n- Googleログイン\n- GitHubログイン\n- メール/パスワードログインとの共存\n- 初回ログイン時のプロフィール設定画面\n- セッション管理（ログイン状態の維持）\n\n## 技術仕様\n- Next.js + TypeScript\n- Supabase Auth（OAuthプロバイダー設定済み前提）\n- Tailwind CSS`,
      reward_amount: 140000,
      tech_stack: ['Next.js', 'TypeScript', 'Supabase Auth', 'Tailwind CSS'],
      ai_persona: {
        name: '岡田 プロダクトマネージャー',
        company: '株式会社クリエイトウェブ',
        personality: 'ユーザー数増加に執着。セキュリティとUXのバランスを重視。',
        tone: 'プロダクト視点の言葉遣い。KPIを気にする。',
        avatar_emoji: '🔑',
      } as AiPersona,
    },
  },
  senior: {
    lp: {
      title: 'グローバル展開向け多言語LPの最適化',
      description: `## 背景\n海外展開を検討しているEC企業から、日英対応のランディングページの高速化と多言語対応の依頼を受けました。Core Web Vitals の改善が必須条件です。\n\n## 要件\n- next-intl による日本語/英語切り替え\n- LCPを2.5秒以内に改善（画像最適化・フォント最適化）\n- A/Bテスト用のコンポーネント設計\n- SSG + ISR でのレンダリング戦略\n- OGP/SEOメタ情報の動的生成\n\n## 技術仕様\n- Next.js 14 App Router + TypeScript\n- next-intl\n- Tailwind CSS\n- Lighthouse スコア 90以上を達成すること`,
      reward_amount: 350000,
      tech_stack: ['Next.js', 'TypeScript', 'next-intl', 'Tailwind CSS'],
      ai_persona: {
        name: '西村 VP of Engineering',
        company: 'GlobalShop株式会社',
        personality: 'パフォーマンス数値に厳格。実装の根拠とトレードオフの説明を求める。',
        tone: '英語混じりのビジネス英語。決断が速い。',
        avatar_emoji: '🌐',
      } as AiPersona,
    },
    api: {
      title: 'マイクロサービス間の非同期通信基盤の構築',
      description: `## 背景\nECプラットフォームのバックエンドをモノリスからマイクロサービスに移行するプロジェクトで、サービス間の非同期通信基盤の設計・実装を依頼されました。\n\n## 要件\n- イベントドリブンアーキテクチャの設計\n- 注文・在庫・通知サービス間のメッセージング\n- Dead Letter Queue の実装\n- 冪等性の保証\n- 障害時のリトライ戦略\n\n## 技術仕様\n- Node.js + TypeScript\n- Bull（Redisベースのキュー）\n- Docker Compose での環境構築\n- 単体テスト・統合テストの実装`,
      reward_amount: 450000,
      tech_stack: ['Node.js', 'TypeScript', 'Redis', 'Bull', 'Docker'],
      ai_persona: {
        name: '藤田 アーキテクト',
        company: '株式会社ECプラットフォーム',
        personality: '設計の一貫性と障害耐性を最重視するシニアアーキテクト',
        tone: '技術的・論理的。設計判断の根拠を必ず求める。',
        avatar_emoji: '⚙️',
      } as AiPersona,
    },
    ui_component: {
      title: '仮想スクロール対応の高パフォーマンステーブル',
      description: `## 背景\n金融系SaaSから、10万件以上のデータを扱う取引履歴テーブルのパフォーマンス改善依頼を受けました。\n\n## 要件\n- 仮想スクロール（表示領域のみレンダリング）\n- 複数列での複合ソート\n- 列のリサイズ・並び替え（ドラッグ&ドロップ）\n- セルの編集機能\n- キーボードナビゲーション対応\n- 100msルールの遵守（操作への応答時間）\n\n## 技術仕様\n- React + TypeScript\n- TanStack Virtual + TanStack Table\n- Tailwind CSS\n- Vitest でパフォーマンステスト実装`,
      reward_amount: 400000,
      tech_stack: ['React', 'TypeScript', 'TanStack Virtual', 'TanStack Table', 'Vitest'],
      ai_persona: {
        name: '石川 テックリード',
        company: '株式会社フィンテックジャパン',
        personality: 'ミリ秒単位のパフォーマンスにこだわる。ベンチマーク結果の提出を求める。',
        tone: '数値ドリブン。感情表現が少ない。',
        avatar_emoji: '📉',
      } as AiPersona,
    },
    form: {
      title: '動的スキーマ対応フォームビルダーの実装',
      description: `## 背景\nノーコードツール企業から、JSONスキーマを元にフォームを動的生成するコンポーネントの実装依頼を受けました。\n\n## 要件\n- JSONスキーマからフォームを動的生成\n- フィールドタイプ: text/number/select/checkbox/date/file\n- 条件分岐（他フィールドの値によって表示/非表示）\n- ネストしたオブジェクト・配列フィールド対応\n- カスタムバリデーションルールのサポート\n\n## 技術仕様\n- React + TypeScript\n- React Hook Form + Zod\n- JSON Schema の解析・型生成\n- 100%のテストカバレッジ`,
      reward_amount: 500000,
      tech_stack: ['React', 'TypeScript', 'React Hook Form', 'Zod', 'JSON Schema'],
      ai_persona: {
        name: '村上 CEO',
        company: 'NoCode株式会社',
        personality: '製品の柔軟性を最重視。エッジケースへの対応を細かく確認する。',
        tone: 'ビジョン重視の言葉遣い。技術と事業の両軸で話す。',
        avatar_emoji: '🏗️',
      } as AiPersona,
    },
    dashboard: {
      title: 'リアルタイム分析ダッシュボードのアーキテクチャ設計と実装',
      description: `## 背景\n広告テック企業から、1秒間に数千件のイベントを処理するリアルタイム分析ダッシュボードの構築依頼を受けました。\n\n## 要件\n- WebSocketによるリアルタイムデータストリーミング\n- 時系列グラフの高速描画（Canvas API使用）\n- データの集計・間引き処理（クライアントサイド）\n- メモリリークのない長時間稼働設計\n- エラー境界とフォールバックUIの実装\n\n## 技術仕様\n- Next.js + TypeScript\n- WebSocket（Socket.io）\n- Canvas API / Chart.js\n- React Query でデータ管理`,
      reward_amount: 480000,
      tech_stack: ['Next.js', 'TypeScript', 'WebSocket', 'Canvas API', 'React Query'],
      ai_persona: {
        name: '橋本 CTO',
        company: '株式会社AdTechJapan',
        personality: 'スケーラビリティと可観測性を最重視するシリアルアントレプレナー',
        tone: '端的でスピード感がある。技術的負債に敏感。',
        avatar_emoji: '⚡',
      } as AiPersona,
    },
    auth: {
      title: 'ゼロトラスト認証基盤の設計と実装',
      description: `## 背景\n医療系SaaS企業から、HIPAA準拠のゼロトラスト認証基盤の構築依頼を受けました。\n\n## 要件\n- 多要素認証（TOTP / SMS）\n- デバイス認証・管理\n- ロールベースアクセス制御（RBAC）\n- 監査ログの完全な記録\n- セッションの異常検知（IP変更・デバイス変更）\n- SSOのSAML 2.0対応\n\n## 技術仕様\n- Next.js + TypeScript\n- Supabase Auth + カスタム認証ロジック\n- セキュリティテスト（OWASP Top 10 の対策実装）\n- E2Eテスト（Playwright）`,
      reward_amount: 500000,
      tech_stack: ['Next.js', 'TypeScript', 'Supabase', 'SAML', 'Playwright'],
      ai_persona: {
        name: '木村 CISO',
        company: '株式会社メディカルクラウド',
        personality: 'コンプライアンス最優先。実装の根拠をドキュメントで求める。',
        tone: '慎重で形式的。承認プロセスが厳格。',
        avatar_emoji: '🏥',
      } as AiPersona,
    },
  },
}

export async function generateProject(
  difficulty: DifficultyLevel,
  category: ProjectCategory
): Promise<Omit<Project, 'id' | 'is_active' | 'created_at'>> {
  // TODO: クレジット復活後は以下のAI実装に戻す
  return { ...MOCK_PROJECTS[difficulty][category], difficulty, category }
}
