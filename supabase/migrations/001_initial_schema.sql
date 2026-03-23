-- ================================================================
-- Engineer Simulator - 初期スキーマ
-- Supabaseのダッシュボード > SQL Editor で実行してください
-- ================================================================

-- ① ENUM型の定義
CREATE TYPE difficulty_level AS ENUM ('junior', 'mid', 'senior');
CREATE TYPE project_category AS ENUM ('lp', 'api', 'ui_component', 'form', 'dashboard', 'auth');
CREATE TYPE user_project_status AS ENUM ('in_progress', 'submitted', 'reviewed', 'completed');
CREATE TYPE chat_role AS ENUM ('user', 'assistant');

-- ② プロフィールテーブル（auth.usersを拡張）
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT NOT NULL,
  avatar_url   TEXT,
  total_earnings INTEGER NOT NULL DEFAULT 0,
  level        INTEGER NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ③ 案件テーブル
CREATE TABLE projects (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  description    TEXT NOT NULL,
  difficulty     difficulty_level NOT NULL DEFAULT 'junior',
  category       project_category NOT NULL,
  reward_amount  INTEGER NOT NULL,
  tech_stack     TEXT[] NOT NULL DEFAULT '{}',
  ai_persona     JSONB NOT NULL DEFAULT '{}',
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ④ ユーザーと案件の紐付けテーブル
CREATE TABLE user_projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id    UUID NOT NULL REFERENCES projects(id),
  status        user_project_status NOT NULL DEFAULT 'in_progress',
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at  TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  earned_reward INTEGER,
  UNIQUE(user_id, project_id)
);

-- ⑤ チャットメッセージテーブル
CREATE TABLE chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_project_id UUID NOT NULL REFERENCES user_projects(id) ON DELETE CASCADE,
  role            chat_role NOT NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ⑥ コード提出テーブル
CREATE TABLE submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_project_id UUID NOT NULL REFERENCES user_projects(id) ON DELETE CASCADE,
  code_content    TEXT NOT NULL,
  language        TEXT NOT NULL DEFAULT 'typescript',
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ⑦ AIレビュー結果テーブル
CREATE TABLE reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id       UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  overall_score       INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  readability_score   INTEGER NOT NULL CHECK (readability_score BETWEEN 0 AND 100),
  security_score      INTEGER NOT NULL CHECK (security_score BETWEEN 0 AND 100),
  functionality_score INTEGER NOT NULL CHECK (functionality_score BETWEEN 0 AND 100),
  summary             TEXT NOT NULL,
  detailed_comments   JSONB NOT NULL DEFAULT '[]',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- RLS（Row Level Security）の設定
-- ================================================================

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews        ENABLE ROW LEVEL SECURITY;

-- profiles: 自分のレコードのみ操作可能
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- projects: 全ユーザーが閲覧可能、作成はサーバーサイドのみ（service_roleキー使用）
CREATE POLICY "projects_read_all" ON projects
  FOR SELECT USING (TRUE);

-- user_projects: 自分のレコードのみ
CREATE POLICY "user_projects_own" ON user_projects
  FOR ALL USING (auth.uid() = user_id);

-- chat_messages: 自分のuser_projectに紐づくもののみ
CREATE POLICY "chat_messages_own" ON chat_messages
  FOR ALL USING (
    user_project_id IN (
      SELECT id FROM user_projects WHERE user_id = auth.uid()
    )
  );

-- submissions: 自分のuser_projectに紐づくもののみ
CREATE POLICY "submissions_own" ON submissions
  FOR ALL USING (
    user_project_id IN (
      SELECT id FROM user_projects WHERE user_id = auth.uid()
    )
  );

-- reviews: 自分の提出に紐づくもののみ
CREATE POLICY "reviews_own" ON reviews
  FOR ALL USING (
    submission_id IN (
      SELECT s.id FROM submissions s
      JOIN user_projects up ON s.user_project_id = up.id
      WHERE up.user_id = auth.uid()
    )
  );

-- ================================================================
-- サインアップ時にprofilesを自動作成するトリガー（オプション）
-- ※ アプリ側でも作成しているが、バックアップとして設定
-- ================================================================

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

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
