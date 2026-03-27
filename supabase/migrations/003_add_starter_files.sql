-- ================================================================
-- リファクタリング案件用のスターターコード追加
-- Supabaseのダッシュボード > SQL Editor で実行してください
-- ================================================================

-- projectsテーブルにstarter_filesカラムを追加
-- ※ project_categoryはENUMではなくTEXT型のためALTER TYPE不要
-- refactoringカテゴリの案件で、リファクタリング前の既存コードを格納する
-- 形式: CodeFile[] ({ name, language, content }の配列)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS starter_files JSONB DEFAULT NULL;
