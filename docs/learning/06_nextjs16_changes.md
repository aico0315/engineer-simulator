# Next.js 16 で変わったこと - ハマりポイント集

---

## なぜこのドキュメントが必要か

Next.js はバージョンアップのたびに書き方が変わることがあります。
インターネットの記事や、AIが生成するコードは**古いバージョンの書き方**になっていることが多く、そのままコピーしても動かないことがあります。

このドキュメントでは「古い書き方」と「新しい書き方」の違いをまとめています。

---

## 最重要: `middleware.ts` が `proxy.ts` になった

**これが一番大きな変更点です。**

Next.js では、すべてのリクエストが実際のページに届く前に「前処理」を挟むことができます。このアプリでは「ログインしていないユーザーをログインページに飛ばす」という処理がここで行われています。

### 古い書き方（Next.js 15以前）

```typescript
// ファイル名: middleware.ts
export function middleware(request: NextRequest) {
  // ...
}
```

### 新しい書き方（Next.js 16）

```typescript
// ファイル名: proxy.ts（ファイル名が変わった！）
export function proxy(request: NextRequest) {  // 関数名も変わった！
  // ...
}
```

**変わったポイント**:
- ファイル名: `middleware.ts` → `proxy.ts`
- 関数名: `middleware` → `proxy`
- それ以外の書き方は同じ

**なぜ名前が変わったか**: 「ミドルウェア」という名前がその機能（リクエストの前処理・代理）を正確に表していないとして、より実態に合った「プロキシ（代理）」という名前に改められました。

---

## `cookies()` に `await` が必要になった（Next.js 15〜）

Cookie（ログイン情報などを保存する仕組み）を取得するコードが非同期に変わりました。

### 古い書き方

```typescript
import { cookies } from 'next/headers'

const cookieStore = cookies()  // await なし
```

### 新しい書き方

```typescript
import { cookies } from 'next/headers'

const cookieStore = await cookies()  // await が必要！
```

**`await` がないとどうなるか**: エラーにならず動いてしまうことがありますが、正しくCookieが取得できず、ログイン状態が認識されないなどの不具合が起きます。

---

## URLのパラメータに `await` が必要になった（Next.js 15〜）

例えば `/workspace/abc123` のような URL の `abc123` の部分（パラメータ）を取得するコードも変わりました。

### 古い書き方

```typescript
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params  // そのまま使えた
}
```

### 新しい書き方

```typescript
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params  // await が必要！
}
```

このプロジェクトの `workspace/[projectId]/page.tsx` ではすでに対応済みです。

---

## AIが生成するコードを使うときの注意

ChatGPTやClaude などのAIにNext.jsのコードを生成してもらうと、古いバージョンの書き方になっていることがあります。AIは学習データに含まれる「その時点での最新の書き方」を使うため、最新バージョンに追いついていないことがあります。

**AIが生成したNext.jsコードをコピーする前に確認すべきこと**:

| 確認項目 | 古い書き方 | 新しい書き方 |
|---|---|---|
| ミドルウェア | `middleware.ts` の `middleware()` | `proxy.ts` の `proxy()` |
| URLパラメータ | `params.id` | `(await params).id` |
| Cookie取得 | `cookies()` | `await cookies()` |

**困ったときは**: このプロジェクトには `node_modules/next/dist/docs/` フォルダに最新のドキュメントが入っています。「この書き方が正しいか？」と迷ったときはそちらを確認してください。

---

## まとめ：新しいフレームワークを使うときの心がまえ

1. **ネットの記事の日付を確認する** → 2年以上前の記事は古い可能性がある
2. **AIが生成したコードを鵜呑みにしない** → そのまま動くか確認してから使う
3. **エラーメッセージをよく読む** → 「deprecated（非推奨）」「use X instead（代わりにXを使ってください）」という文言が出たら変更点がある
4. **公式ドキュメントが一番正確** → わからないことがあれば公式に戻る
