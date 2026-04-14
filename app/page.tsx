import Link from 'next/link'
import { ArrowRight, Code2, MessageSquare, Star, Trophy } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      {/* ナビゲーション */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto border-b border-stone-200">
        <div className="flex items-center gap-2 font-bold text-xl text-stone-700">
          <Code2 className="w-6 h-6 text-stone-500" />
          <span>Engineer Simulator</span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-stone-500 hover:text-stone-800 transition-colors"
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg font-medium transition-colors"
          >
            無料で始める
          </Link>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <main className="max-w-6xl mx-auto px-8 pt-20 pb-32 text-center">
        <div className="inline-block mb-6 px-4 py-1 bg-stone-200 border border-stone-300 rounded-full text-stone-600 text-sm font-medium">
          実務未経験者のための学習プラットフォーム
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6 text-stone-800">
          架空の案件をこなして
          <br />
          <span className="text-stone-500">実務エンジニアの仕事</span>を体験しよう
        </h1>
        <p className="text-xl text-stone-400 mb-10 max-w-2xl mx-auto">
          AIが生成した架空のクライアント依頼に取り組み、ヒアリング・実装・コードレビューまで
          本物の開発フローを擬似体験できます。
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 bg-stone-700 hover:bg-stone-600 text-white rounded-xl text-lg font-semibold transition-colors"
        >
          無料で始める
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* 特徴カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left">
          {[
            {
              icon: <MessageSquare className="w-6 h-6 text-stone-500" />,
              title: 'AIクライアントとヒアリング',
              desc: '曖昧な要件を具体化する「質問力」を、架空のクライアントとのチャットで鍛えます。',
            },
            {
              icon: <Code2 className="w-6 h-6 text-stone-500" />,
              title: '実務レベルのコードレビュー',
              desc: '提出したコードをAIシニアエンジニアが「可読性・セキュリティ・機能性」で評価します。',
            },
            {
              icon: <Trophy className="w-6 h-6 text-amber-600" />,
              title: '擬似報酬で進捗を可視化',
              desc: '案件を完了するごとに擬似報酬が貯まり、自分の成長をダッシュボードで確認できます。',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-white border border-stone-200 rounded-2xl hover:shadow-sm transition-shadow"
            >
              <div className="mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-lg mb-2 text-stone-700">{feature.title}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* 難易度バッジ */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          <span className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 text-stone-400" />
            <span className="text-stone-400">案件難易度：</span>
          </span>
          {[
            { label: 'ジュニア', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { label: 'ミドル', color: 'bg-amber-50 text-amber-700 border-amber-200' },
            { label: 'シニア', color: 'bg-rose-50 text-rose-700 border-rose-200' },
          ].map((badge) => (
            <span
              key={badge.label}
              className={`px-3 py-1 rounded-full text-sm border ${badge.color}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      </main>
    </div>
  )
}
