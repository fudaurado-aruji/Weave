# 実装計画: 10_card_layer_and_middlewares

## 1. 概要
「Weave」のSF的世界観をさらに深化させ、第3の階層（Card Space）を構築する。
ここではSUIRENの資材を活用し、3D空間に「生きたカード」を配置する。
また、オブジェクトを階層（layerId）ごとに管理することで、各層が独立した思考空間として機能するようにする。

## 2. 実装ステップ
- [ ] **Step 1: データ構造のアップデート**
  - `src/types/index.ts` の `WorldObject` に `layerId: number` を追加。
  - `ObjectType` に `card` を追加。
  - `ObjectStyle` に `imageUrl` などのカード用プロパティを検討。
- [ ] **Step 2: Storeのレイヤー対応**
  - `src/store/useStore.ts` の `currentLayer` を `1 | 2 | 3` に拡張。
  - `addObject` 時に現在の `layerId` を自動付与するように調整。
- [ ] **Step 3: レイヤーフィルタリングの実装**
  - `WorldObjects` コンポーネントで、現在の `currentLayer` に一致するオブジェクトのみを描画するようにフィルタリング。
- [ ] **Step 4: CardObject コンポーネントの作成**
  - 3D空間に垂直に立つカードを実装。
  - `BoxGeometry` または表裏2枚の `PlaneGeometry` を使用。
  - 表面には指定のタロット画像、裏面にはカードバックのテクスチャを適用。
  - `WorldObjectRenderer` を拡張して `card` タイプをハンドル。リサイズ機能を無効化。
- [ ] **Step 5: ヘッダーUIの更新**
  - [2D Board | 3D Studio | Card Space] の3ボタン制に。

## 3. ユーザーへの影響
- 第1層（2D）、第2層（3D）、第3層（Card）という、用途の異なる3つの空間を切り替えて使用できる。
- 空中にタロットカードを自由に配置・移動し、思考の補助として活用できる。
- 他プロジェクト（SUIREN）との技術的・資材的連携の第一歩となる。
