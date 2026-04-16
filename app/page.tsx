import Link from 'next/link'
import { ArrowRight, Code2, MessageSquare, Trophy, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div
      className="min-h-screen text-stone-800"
      style={{
        backgroundImage: 'url(/wood.jpg)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
      }}
    >
      {/* 全体に薄い白オーバーレイ（明るく柔らかく） */}
      <div className="min-h-screen" style={{ backgroundColor: 'rgba(255,252,245,0.82)' }}>

        {/* ナビゲーション */}
        <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 font-bold text-lg text-stone-700">
            <Code2 className="w-5 h-5 text-stone-500" />
            <span className="tracking-wide">Engineer Simulator</span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-stone-500 hover:text-stone-800 transition-colors text-sm"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              無料で始める
            </Link>
          </div>
        </nav>

        {/* ヒーローセクション */}
        <section className="max-w-4xl mx-auto px-8 pt-20 pb-32 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 bg-white/70 border border-stone-200 rounded-full text-stone-500 text-sm font-medium backdrop-blur-sm shadow-sm">
            実務未経験者のための学習プラットフォーム
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6 text-stone-800 tracking-tight">
            架空の案件をこなして
            <br />
            <span className="text-stone-500">実務エンジニアの仕事</span>を体験しよう
          </h1>
          <p className="text-lg text-stone-500 mb-10 max-w-xl mx-auto leading-relaxed">
            AIが生成した架空のクライアント依頼に取り組み、
            ヒアリング・実装・コードレビューまで本物の開発フローを擬似体験できます。
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-700 hover:bg-green-600 text-white rounded-xl text-base font-semibold transition-colors shadow-md shadow-green-900/20"
          >
            無料で始める
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* 特徴セクション */}
        <section className="max-w-5xl mx-auto px-8 py-24">
          <h2 className="text-2xl font-bold text-center text-stone-700 mb-3">
            実務に近い体験ができる3つの理由
          </h2>
          <p className="text-center text-stone-400 text-sm mb-14">
            チュートリアルではなく、「仕事っぽさ」にこだわったつくりです
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <MessageSquare className="w-5 h-5 text-stone-500" />,
                title: 'AIクライアントとヒアリング',
                desc: '曖昧な要件を具体化する「質問力」を、架空のクライアントとのチャットで鍛えます。',
              },
              {
                icon: <Code2 className="w-5 h-5 text-stone-500" />,
                title: '実務レベルのコードレビュー',
                desc: '提出したコードをAIシニアエンジニアが可読性・セキュリティ・機能性で評価します。',
              },
              {
                icon: <Trophy className="w-5 h-5 text-amber-600" />,
                title: '擬似報酬で進捗を可視化',
                desc: '案件を完了するごとに擬似報酬が貯まり、自分の成長をダッシュボードで確認できます。',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-stone-200/80 hover:shadow-md transition-shadow"
                style={{ backgroundColor: 'rgba(255,252,248,0.85)' }}
              >
                <div className="mb-4 w-10 h-10 flex items-center justify-center bg-stone-100 rounded-xl">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-base mb-2 text-stone-700">{feature.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* カテゴリセクション */}
        <section className="max-w-4xl mx-auto px-8 pb-12">
          <p className="text-center text-stone-500 text-sm mb-6">取り組める案件カテゴリ</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'LP制作', emoji: '🖥️' },
              { label: 'ECサイト', emoji: '🛒' },
              { label: '管理画面', emoji: '⚙️' },
              { label: 'ダッシュボード', emoji: '📊' },
              { label: '認証機能', emoji: '🔐' },
              { label: 'API連携', emoji: '🔌' },
              { label: 'リファクタリング', emoji: '♻️' },
            ].map((cat) => (
              <span
                key={cat.label}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm text-stone-600 border border-stone-300/70"
                style={{ backgroundColor: 'rgba(255,255,255,0.70)' }}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </span>
            ))}
          </div>
        </section>

        {/* 難易度セクション */}
        <section className="max-w-3xl mx-auto px-8 py-20 text-center">
          <h2 className="text-2xl font-bold text-stone-700 mb-3">
            スキルに合わせた3段階の難易度
          </h2>
          <p className="text-stone-400 text-sm mb-12">
            受注できる案件の種類と報酬が難易度ごとに異なります
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: 'ジュニア',
                reward: '3〜8万円',
                desc: 'HTML / CSS / JS・React基礎。コンポーネント1〜2個程度のシンプルな実装。',
                style: { backgroundColor: 'rgba(255,255,255,0.75)', borderColor: '#6ee7b7' },
                labelColor: 'text-emerald-600',
              },
              {
                label: 'ミドル',
                reward: '8〜20万円',
                desc: '状態管理・API連携・フォームバリデーションを含む実務経験1〜2年向けの実装。',
                style: { backgroundColor: 'rgba(255,255,255,0.75)', borderColor: '#fcd34d' },
                labelColor: 'text-amber-600',
              },
              {
                label: 'シニア',
                reward: '20〜50万円',
                desc: 'パフォーマンス最適化・セキュリティ考慮・設計パターンの適用が求められる上級者向け。',
                style: { backgroundColor: 'rgba(255,255,255,0.75)', borderColor: '#fca5a5' },
                labelColor: 'text-rose-500',
              },
            ].map((level) => (
              <div
                key={level.label}
                className="p-6 rounded-2xl border-2 shadow-sm"
                style={level.style}
              >
                <p className={`font-bold text-base mb-1 ${level.labelColor}`}>{level.label}</p>
                <p className="text-stone-700 font-semibold text-sm mb-2">{level.reward}</p>
                <p className="text-stone-400 text-xs leading-relaxed">{level.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 登録メリット + CTA */}
        <section className="max-w-2xl mx-auto px-8 py-20 text-center">
          <h2 className="text-2xl font-bold text-stone-700 mb-10">はじめるのに必要なのは登録だけ</h2>
          <ul className="inline-flex flex-col gap-4 text-left mb-12">
            {[
              'アカウント登録は無料・クレジットカード不要',
              '案件はAIが毎回自動生成するので使い回しなし',
              'ブラウザだけで動く・環境構築不要',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-stone-600 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <br />
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-700 hover:bg-green-600 text-white rounded-xl text-base font-semibold transition-colors shadow-md shadow-green-900/20"
          >
            無料で始める
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* フッター */}
        <footer className="border-t border-stone-300/60 py-8 text-center text-stone-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Code2 className="w-4 h-4" />
            <span className="font-medium text-stone-500">Engineer Simulator</span>
          </div>
          <p>© 2025 Engineer Simulator. All rights reserved.</p>
        </footer>

      </div>
    </div>
  )
}
