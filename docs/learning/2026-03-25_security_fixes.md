# セキュリティ対応まとめ - Supabaseからの警告メールに対応した

---

## 今日やったこと

Supabaseから「セキュリティの問題があります」という警告メールが届いたので、内容を確認して対応しました。

---

## Supabaseの「Security Advisor」とは

Supabaseには、データベースのセキュリティ上の問題を自動でチェックしてくれる機能があります。

**場所**: Supabaseダッシュボード → 左サイドバー「**Advisors**」→「**Security Advisor**」

問題の重大度は3段階で表示されます：

| アイコン | 重大度 | 意味 |
|---|---|---|
| 🔴 Errors | 重大 | すぐに対応が必要 |
| 🟠 Warnings | 警告 | できれば対応した方が良い |
| 🟢 Info | 情報 | 参考情報（対応任意） |

---

## 今回届いたメールの内容

「RLS（Row Level Security）が無効になっているテーブルがある」という警告でした。

**RLSとは**: データベースに「このユーザーは自分のデータしか触れない」というルールを直接書き込む仕組みです。詳しくは `docs/learning/02_supabase_rls.md` を参照してください。

### 確認してみると…

Security Advisorを開いたところ、**Errors: 0**（問題なし）でした。以前のエラー修正作業のときにRLSの設定が完了していたため、メールが送られた時点からすでに解決済みの状態でした。

**ポイント**: Supabaseの警告メールは「その瞬間の状態」を報告するため、すでに修正済みでも届くことがあります。メールが来たら慌てず、まずダッシュボードで現在の状態を確認しましょう。

---

## 対応した警告1: Function Search Path Mutable

### どんな問題か

`handle_new_user` という関数（サインアップ時にprofilesテーブルにデータを自動作成する関数）に、`search_path`（検索パス）が設定されていなかった。

**`search_path` とは**: データベースが「どのスキーマ（データの入れ物）を使うか」を決める設定。これが固定されていないと、悪意のある操作によって意図しないスキーマのテーブルを参照させられる可能性がある（「スキーマインジェクション」と呼ばれる攻撃）。

### 修正前のコード

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
--                   ↑ search_path の指定なし
```

### 修正後のコード

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
--                                    ↑ これを追加！
```

末尾に `SET search_path = ''` を追加しただけです。空文字 `''` を指定することで「どのスキーマも勝手に使わない」という安全な状態になります。

---

## 対応した警告2: Leaked Password Protection Disabled

### どんな問題か

「流出したパスワードを使ったサインアップを防ぐ機能」がOFFになっている。

**背景**: 世の中には「過去にどこかのサービスから流出したパスワードのリスト」が存在します。`123456` や `password` のような単純なパスワードだけでなく、実際に使われていたパスワードが漏洩しているケースも多いです。このリストと照合して「危険なパスワード」での登録を弾く機能です。

**場所**: Authentication → Attack Protection → **Prevent use of leaked passwords**

### 現在の状態

「Configure email provider」ボタンが表示されており、有効にするには外部のメール送信サービス（SendGridやResendなど）の設定が必要。

### 今後の対応予定

ユーザーを増やすリリース前に有効化する予定です。手順：

1. [resend.com](https://resend.com) で無料アカウントを作成
2. APIキーを発行
3. Supabase → Authentication → Notifications（Email）でSMTP設定を入力
4. 「Prevent use of leaked passwords」をONにする

---

## 今日学んだこと

### セキュリティ警告が届いたときの対処フロー

```
メール受信
  ↓
Supabase ダッシュボードの Security Advisor を開く
  ↓
Errors（赤）が0かどうか確認
  ↓
Errors が 0 → ひとまず安全、Warnings の内容を確認
Errors がある → すぐに対応！
```

### `SECURITY DEFINER` 関数に `SET search_path = ''` をつける理由

Supabaseのトリガー関数など、`SECURITY DEFINER`（作成者の権限で動く関数）には必ず `SET search_path = ''` をつけるのがベストプラクティスです。これはテンプレートとして覚えておきましょう。

```sql
-- ✅ 安全な書き方
$$ ... $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ⚠️ 警告が出る書き方
$$ ... $$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Warningsはすべて即対応しなくていい

- **Errors** → すぐに対応（データが危険にさらされている可能性）
- **Warnings** → できれば対応（リスクはあるが致命的ではない）
- **Info** → 参考程度（対応任意）

今回の「Leaked password protection」は設定に外部サービスが必要なため、リリース前の対応で問題ありません。
