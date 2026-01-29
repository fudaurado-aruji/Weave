# Mission: webgpu_core_migration

Weave のレンダリングエンジンを WebGL から WebGPURenderer に刷新し、TSL によるシェーダー管理と WebGL 2 へのフォールバック基盤を構築する。

## Tasks
- [x] 依存関係の更新 (`three/webgpu` への対応) <!-- id: 0 -->
- [x] `WebGPURenderer` の導入と基本シーンの描画確認 <!-- id: 1 -->
- [x] WebGL 2 フォールバック層の実装 <!-- id: 2 -->
- [x] 既存のシェーダー/マテリアルの TSL 移行調査 <!-- id: 3 -->
- [x] 基本オブジェクト（背景、グリッド、付箋等）の TSL 化 <!-- id: 4 -->
- [x] ポストプロセッシングの WebGPU 対応 <!-- id: 5 -->
