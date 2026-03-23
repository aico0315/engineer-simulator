# 2026-03-23 エラー解決の技術振り返り

## 1. Anthropic API クレジット不足による 500 エラーの特定プロセス

### 何が起きていたか
案件生成ボタンを押すと `/api/projects/generate` が 500 エラーを返していた。

### 特定の手順
サーバー側のログ（`console.error`）を確認したところ、エラーメッセージに以下が含まれていた。

> `Your credit balance is too low to access the Anthropic API.`

つまり、コードや Supabase の設定には問題がなく、**APIキー自体は正しく読み込まれていたが、そのキーに紐づくアカウントの残高が0だったためリクエストが拒否されていた。**

### 学び
500エラーの原因は必ずしもコードのバグとは限らない。外部APIを使う場合は、**認証エラー（401）・権限エラー（403）・残高不足（400）** を区別することが重要。サーバーログの `console.error` の中身を読むことが、原因特定の最短ルートになる。

### 暫定対応
Anthropic Console がサービス一時停止中でクレジットチャージができなかったため、`lib/ai/project-generator.ts` のAI呼び出しをモックデータに差し替えた。クレジット復活後は `TODO` コメントの箇所を元に戻す。

---

## 2. Supabase の projects テーブルに不足していたカラムへの対応

### 何が起きていたか
手動でSupabaseにテストデータを入れても画面に表示されない、または表示されても一部の項目がエラーになる状況だった。

### 原因
テーブルの構造とアプリが期待するデータ構造がずれていた。特に以下の点が問題だった。

- **`is_active` カラムの値が `false` または `null`** になっていた。ボードページのクエリには `.eq('is_active', true)` の条件があるため、`true` でないデータは一切表示されない。
- **`tech_stack` カラムが `null`**。アプリ側で `tech_stack.map(...)` や `tech_stack.slice(...)` を直接呼び出していたため、null に対してメソッドを呼ぼうとして TypeError が発生した。
- **`ai_persona` カラムが未設定**。JSON型のカラムで `ai_persona.avatar_emoji` などを参照していたため、undefined からプロパティを読もうとしてエラーになった。

### 修正の意図
コード側では `tech_stack ?? []` のようにフォールバックを追加することで、データが null でも最低限表示が壊れないよう防御的に実装した。根本的には **手動挿入データには必要なカラムを正しい値で埋める必要がある**。

### 修正ファイル
- `components/board/ProjectCard.tsx`
- `components/workspace/RequirementPanel.tsx`

---

## 3. Hydration Error の原因とシークレットモードでの回避

### 何が起きていたか
ブラウザのコンソールに以下のエラーが表示されていた。

> `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.`

差分を見ると、`<body>` タグに `cz-shortcut-listen="true"` という属性がクライアント側にだけ追加されていた。

### 原因
これはコードのバグではなく、**ブラウザ拡張機能（Dashlane等のパスワードマネージャー）がページを読み込んだ後に `<body>` タグを書き換える**ことで発生する。

Reactは「サーバーが生成したHTML」と「クライアントが期待するHTML」を照合（Hydration）するが、拡張機能が割り込んでDOMを変更するため不一致が生まれる。

### 修正
`app/layout.tsx` の `<body>` タグに `suppressHydrationWarning` を追加した。これはReactに「このタグの属性の不一致は無視してよい」と伝えるフラグで、ブラウザ拡張機能由来の差異を抑制する標準的な対処法。

### シークレットモードでの回避
シークレットモードはブラウザ拡張機能が無効になるため、この問題が再現しない。開発中に「自分のブラウザでだけ起きるエラー」があったら拡張機能を疑うのが定石。

### 修正ファイル
- `app/layout.tsx`

---

## 4. ai_persona が未定義で発生した TypeError と 404 エラーの解決

### 何が起きていたか
ワークスペースページ（`/workspace/[id]`）に遷移すると 404 になるケースがあった。

### 根本原因（2層構造）

**第1層：プロフィールが存在しない**
Supabase のテーブル設計で `user_projects.user_id` は `profiles.id` を外部キーとして参照していた。ユーザーが登録した際に `profiles` テーブルへの自動挿入トリガーが発火しなかったり、手動でSupabaseにユーザーを作成した場合、`profiles` にレコードが存在しない。

**第2層：外部キー制約による INSERT 失敗**
`user_projects` に新しいレコードをINSERTしようとした際、`profiles` に対応するレコードがないと **外部キー制約違反でINSERTが失敗する**。Supabaseはこの失敗をエラーとして返すが、コード側でエラーハンドリングをしておらず `data` が `null` になる。その後 `if (!userProject) notFound()` の条件に引っかかり 404 になっていた。

### 修正の意図
`user_projects` のINSERT前に `profiles` テーブルへの **upsert（存在すれば無視、なければ作成）** を実行するよう修正した。これにより、どんな方法でアカウントが作られていても、ワークスペースを初めて開いた時点でプロフィールが確実に存在する状態を保証する。

### 関連バグ：サインアップ時の二重INSERT
`app/(auth)/signup/page.tsx` では、サインアップ後にクライアントから `profiles` テーブルに手動でINSERTしていた。しかし Supabase には `on_auth_user_created` トリガーが設定されており、ユーザー作成時に自動で `profiles` にINSERTする。この二重INSERTにより **重複キーエラーが発生し「プロフィールの作成に失敗しました」** と表示されていた。手動INSERTを削除し、トリガーに一本化することで解決した。

### 学び
外部キー制約は**データの整合性を守る仕組み**だが、「参照先が存在しない状態でINSERTしようとした」という失敗は静かに起きることがある。**エラーを握りつぶしてnullを返す設計**では、後続の処理で突然動かなくなるためデバッグが難しい。エラーは早めに表面化させることが重要。

### 修正ファイル
- `app/(main)/workspace/[projectId]/page.tsx`
- `app/(auth)/signup/page.tsx`
