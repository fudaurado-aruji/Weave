# 実装計画: Studio UI Layout

## 1. 概要
SUIREN プロジェクトで培った「プレミアム・アビリティ」を持つ UI を Weave に導入します。
無限キャンバス（R3F）の上に React DOM の Overlay 層を重ね、サイドバーやツールバーを配置します。

## 2. 実装ステップ
- **Step 1: UI Container & Z-Index Layering**
    - `App.tsx` にキャンバスと UI を分離して管理するためのコンテナ構造を導入します。
- **Step 2: Custom Design Tokens & Constants**
    - SUIREN の配色（ゴールド、アクセント、和紙テクスチャ等）を CSS 変数として `index.css` に定義します。
- **Step 3: StudioSidebar Component**
    - `src/components/StudioSidebar/index.tsx` を作成し、Lucide アイコンを用いたスリムなサイドバーを実装します。
- **Step 4: ObjectToolbar Component**
    - `src/components/ObjectToolbar.tsx` を作成し、上部に浮遊する管理バーを実装します。
- **Step 5: Layout Integration**
    - メイン画面にすべての UI を統合し、レスポンシブな配置を確認します。

## 3. ユーザーへの影響
- 見た目が大幅にアップグレードされ、高級感のある「スタジオ」らしい操作環境になります。
- 今後の図形追加や操作機能の受け皿が整います。
