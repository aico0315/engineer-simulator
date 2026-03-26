-- ================================================================
-- submissions テーブルに複数ファイル提出用カラムを追加
-- Supabaseのダッシュボード > SQL Editor で実行してください
-- ================================================================

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS files JSONB;

-- 既存レコードの files は NULL のまま（code_content / language で後方互換を維持）
