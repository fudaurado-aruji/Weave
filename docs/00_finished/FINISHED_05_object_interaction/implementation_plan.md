# 実装計画: Object Interaction & Selection

## 1. 概要
ユーザーがオブジェクトをクリックして「選択」し、その選択状態を視覚的にフィードバック（バウンディングボックス）し、ツールバーから編集（削除）できるようにします。

## 2. 実装ステップ
- **Step 1: Selection Logic (Store & Interaction)**
    - `useStore` に選択ロジック（単一選択、解除）が既にあるか確認・強化。
    - キャンバス全体のクリック（`onPointerMissed`）での選択解除処理を追加。
    - `WorldObjectRenderer` に `onClick` イベントを追加し、バブリングを考慮して実装。

- **Step 2: Visual Feedback (Selection Box)**
    - 選択されたオブジェクトの周囲に、R3F で枠線（`LineSegments` または `EdgesGeometry` + `MeshBasicMaterial`）を表示する `SelectionBox` コンポーネントを作成。
    - 常に手前に表示されるよう、`depthTest={false}` 等を調整。

- **Step 3: Toolbar Integration**
    - `ObjectToolbar` を `useStore` の `selectedObjectIds` に接続。
    - 選択状態の時のみ表示されるように条件分岐を追加。
    - 削除ボタンに `removeObject` アクションを紐付け。

## 3. 技術的詳細
- **イベント伝播**: R3F の `onClick` はデフォルトで貫通しないが、`event.stopPropagation()` を明示的に呼ぶことで、背面のオブジェクトやキャンバス背景への誤反応を防ぐ。
- **選択解除**: `<Canvas>` または `<Scene>` レベルでのクリックイベントで `selectedObjectIds([])` を呼ぶ。

## 4. 検証項目
- [ ] オブジェクトをクリックして選択状態になるか。
- [ ] 何もないところをクリックして選択が解除されるか。
- [ ] 選択時に枠線（またはハイライト）が表示されるか。
- [ ] ツールバーのゴミ箱ボタンでオブジェクトが削除され、DBからも消えるか。
