---
name: レスポンシブ対応TODO
description: 将来的なスマートフォン対応のための作業メモ
type: project
---

# レスポンシブ対応 TODO

スマートフォン対応が必要になったタイミングで実施する。
現状はPC・タブレット向け設計。

---

## 優先度1（必須・工数大）

### サイドバーのモバイル対応
- `app/(main)/layout.tsx` と `components/ui/Sidebar.tsx` を修正
- モバイル時はサイドバーを非表示にしてハンバーガーメニューで開閉
- Sidebar をクライアントコンポーネント化して `useState` で開閉状態管理

### ワークスペースのタブ
- `components/workspace/WorkspaceClient.tsx`
- 4タブが小さい画面に収まらない
- モバイルではアイコンのみ表示 or 横スクロール対応

---

## 優先度2（比較的簡単）

| ファイル | 修正内容 |
|---------|---------|
| 各ページ全般 | `p-8` → `p-4 md:p-8` に変更 |
| `dashboard/page.tsx` | 完了案件リストの横並びを縦積みに（モバイル時） |
| `board/page.tsx` | タイトルと生成ボタンを `flex-col md:flex-row` に |
| `chat/ChatPanel.tsx` | `p-6` → `p-3 md:p-6`、メッセージ幅 `max-w-[90%]` |
| `RequirementPanel.tsx` | `p-8` → `p-4 md:p-8` |
| `ReviewPanel.tsx` | スコア表示を縦積みに（モバイル時） |

---

## 参考

- Tailwind ブレークポイント: `sm: 640px` / `md: 768px` / `lg: 1024px`
- 現状 `md` 以下の対応がほぼない
- サイドバー幅 `w-56`（224px）がボトルネック
