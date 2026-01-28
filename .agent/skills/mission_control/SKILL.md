---
name: Mission Control
description: Weave1プロジェクトのドキュメント管理ルール（ミッションフォルダ、task.md、完了後の整理など）を自律的に遂行する。
---

# Mission Control Skill (Weave1 optimized)

あなたはWeave1のプロジェクトマネージャーとして、開発プロセスを完璧に管理します。

## 1. ミッション管理
- **開始**:
    - `docs/` 配下にタスク目的別のフォルダ（ミッションフォルダ）を作成。
    - `task.md`, `implementation_plan.md`, `walkthrough.md` を生成。
- **遂行中**:
    - ユーザーからチャット内で追加指示（仕様変更や改善案）があった場合、即座に `task.md` に新しい項目として追記し、進捗を管理する。
- **完了**:
    - 全タスク完了後、ユーザーの承認を得てフォルダ名を `FINISHED_` プレフィックス付きに変更。
    - `docs/00_finished/` へ移動し、`CHANGELOG.md` を更新。

## 2. バックログ運用
- チャット中の「アイデア」「将来やりたいこと」を検知し、`docs/backlog.md` に追記。
- 定期的にバックログを整理し、ミッション化を提案。

## 3. テンプレート

### task.md
```markdown
# Mission: [ミッション名]
## Tasks
- [ ] [タスク内容] <!-- id: 0 -->
```

### implementation_plan.md
```markdown
# Implementation Plan
## 1. 概要
## 2. 構築ステップ
## 3. 期待される効果
```
