# Mission: 10_card_layer_and_middlewares

## 概要
Weaveの階層化をさらに進め、第3層（Card Space）を実装する。
SUIRENの資産であるタロットカードを3D空間に取り込み、空中に浮かせる「Middleware」的な連携のプロトタイプを作成する。

## Tasks
- [ ] `WorldObject` 型に `layerId` を追加し、オブジェクトを層ごとに分離 <!-- id: 1 -->
- [ ] `ObjectType` に `card` を追加 <!-- id: 2 -->
- [ ] Storeの拡張 (`currentLayer: 1 | 2 | 3`, レイヤー切り替えロジック) <!-- id: 3 -->
- [ ] 第3層（Card Space）の基本的ビューの構築 <!-- id: 4 -->
- [ ] タロットカード用オブジェクト `CardObject` の実装 <!-- id: 5 -->
  - [ ] 表：タロット画像、裏：トランプ風テクスチャの2面実装 <!-- id: 6 -->
  - [ ] 空中に垂直に配置 <!-- id: 7 -->
  - [ ] ドラッグ移動可能、リサイズ不可の設定 <!-- id: 8 -->
- [ ] ヘッダーUIへの「第3層（Card Space）」ボタンの追加 <!-- id: 9 -->
