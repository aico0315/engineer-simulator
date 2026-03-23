import Link from 'next/link'
import { ArrowRight, Code2, MessageSquare, Star, Trophy } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* ナビゲーション */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Code2 className="w-6 h-6 text-blue-400" />
          <span>Engineer Simulator</span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
          >
            無料で始める
          </Link>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <main className="max-w-6xl mx-auto px-8 pt-20 pb-32 text-center">
        <div className="inline-block mb-6 px-4 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium">
          実務未経験者のための学習プラットフォーム
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6">
          架空の案件をこなして
          <br />
          <span className="text-blue-400">実務エンジニアの仕事</span>を体験しよう
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          AIが生成した架空のクライアント依頼に取り組み、ヒアリング・実装・コードレビューまで
          本物の開発フローを擬似体験できます。
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-semibold transition-colors"
        >
          無料で始める
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* 特徴カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left">
          {[
            {
              icon: <MessageSquare className="w-6 h-6 text-blue-400" />,
              title: 'AIクライアントとヒアリング',
              desc: '曖昧な要件を具体化する「質問力」を、架空のクライアントとのチャットで鍛えます。',
            },
            {
              icon: <Code2 className="w-6 h-6 text-emerald-400" />,
              title: '実務レベルのコードレビュー',
              desc: '提出したコードをAIシニアエンジニアが「可読性・セキュリティ・機能性」で評価します。',
            },
            {
              icon: <Trophy className="w-6 h-6 text-amber-400" />,
              title: '擬似報酬で進捗を可視化',
              desc: '案件を完了するごとに擬似報酬が貯まり、自分の成長をダッシュボードで確認できます。',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
            >
              <div className="mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* 難易度バッジ */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          <span className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">案件難易度：</span>
          </span>
          {[
            { label: 'ジュニア', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
            { label: 'ミドル', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
            { label: 'シニア', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
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
