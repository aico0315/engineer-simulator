# API Routes解説 - サーバーサイドの処理

## Next.js API Routeとは

`app/api/xxx/route.ts` というファイルを作るだけで、
`POST /api/xxx` というAPIエンドポイントが作れる仕組み。

---

## このアプリの3つのAPIエンドポイント

### 1. `/api/projects/generate` - 案件生成

```typescript
// app/api/projects/generate/route.ts の流れ
1. 認証チェック（未ログインなら401エラー）
2. リクエストから difficulty と category を取得
3. Claude APIで案件を生成（lib/ai/project-generator.ts）
4. Supabaseに保存
5. 保存した案件データをレスポンスとして返す
```

**なぜサーバーサイドで実行するか**:
- `ANTHROPIC_API_KEY` をブラウザに公開しないため
- `NEXT_PUBLIC_` がついていない環境変数はサーバーサイドのみで使える

### 2. `/api/chat` - ヒアリングチャット

```typescript
// 流れ
1. 認証チェック
2. userProjectIdの所有者確認（自分の案件か？）
3. 案件情報（ペルソナ・要件定義）をDBから取得
4. 既存のチャット履歴を取得
5. ユーザーメッセージをDBに保存
6. Claude Haiku APIでAIの返答を生成
7. AIの返答をDBに保存
8. 全メッセージ一覧を返す
```

**チャットは軽量なHaikuモデルを使う理由**:
- 会話の返答はレスポンス速度が重要
- 長文の評価が不要なので、速くて安いHaikuで十分

### 3. `/api/review` - コードレビュー

```typescript
// 流れ
1. 認証チェック＋所有者確認
2. コードをsubmissionsテーブルに保存
3. Claude Opus APIでレビューを実行（高精度モデル）
4. レビュー結果をreviewsテーブルに保存
5. user_projectsのstatusを 'reviewed' に更新
6. スコア80点以上なら 'completed' に変更 → 擬似報酬を付与
7. レビュー結果を返す
```

---

## エラーハンドリングのパターン

```typescript
// 実務でよく使われるパターン
export async function POST(request: NextRequest) {
  try {
    // 1. 認証チェック（401）
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '...' }, { status: 401 })

    // 2. 権限チェック（403）
    const { data: record } = await supabase.from('...').select()...
    if (!record) return NextResponse.json({ error: '...' }, { status: 403 })

    // 3. メイン処理
    const result = await doSomething()

    // 4. 成功レスポンス（200）
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    // 5. 予期しないエラー（500）
    console.error(err)
    return NextResponse.json({ error: '...' }, { status: 500 })
  }
}
```

**HTTPステータスコードの使い分け**:
- `200` OK（成功）
- `401` Unauthorized（未認証 = ログインしていない）
- `403` Forbidden（認可エラー = ログインしているが権限がない）
- `404` Not Found（リソースが見つからない）
- `500` Internal Server Error（サーバー側の予期しないエラー）

---

## ハマりポイント

1. **`await request.json()` は一度しか呼べない**: 2回呼ぶとエラー
2. **環境変数の `NEXT_PUBLIC_` 有無**: ブラウザから使うならプレフィックスが必要
3. **Supabaseのエラーは `throw` されない**: `const { data, error }` の `error` を必ずチェック
4. **`NextResponse.json()` の `status` を忘れがち**: デフォルトは200なので、エラー時は明示的に指定
