# 実装計画: Elements Panel & Core State Management

## 1. 概要
Weave の「命」となるデータ管理部分（Zustand）と、ユーザーが要素を創造するための入り口（Elements Panel）を構築します。

## 2. 実装ステップ
- **Step 1: Define Object Schema & Store**
    - `src/store/useStore.ts` を作成。
    - オブジェクトの基本定義（id, type, position, scale, style, content 等）を TypeScript で定義。
- **Step 2: Elements Panel Expansion**
    - `src/components/StudioSidebar/ElementsPanel.tsx` を作成。
    - サイドバーの「ELEMENTS」タブがアクティブな時に表示されるアコーディオン形式のパネルを実装。
- **Step 3: R3F Object Rendering**
    - キャンバス内に `WorldObject` コンポーネントを作成し、ストア内のデータを元にメッシュを描画します。
- **Step 4: Persistence with Dexie.js**
    - ストアの更新を IndexedDB に同期し、リロード後も配置したオブジェクトが残るようにします。

## 3. 技術的挑戦
- **R3F と DOM の連携**: DOM 上のパネルから R3F の 3D 空間へ「追加」のアクションを飛ばす。
- **パフォーマンス**: 大量のオブジェクトを効率よく管理するための Zustand + Immer の最適化。
