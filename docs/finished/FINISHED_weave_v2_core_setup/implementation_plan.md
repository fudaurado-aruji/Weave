# Implementation Plan: weave_v2_core_setup

## 目的
Weave V1 の legacy を脱却し、WebGPU ネイティブな最強の空間OS基盤を構築する。

## 実装戦略
1. **Clean Slate**: 既存の `src` を退避し、最新の Three.js WebGPU / R3F v10 で再構築。
2. **TSL First**: シェーダーロジックをすべて TSL に移行し、プラットフォーム非依存かつ超高速な描画を実現。
3. **Spatial OS UI**: モックアップに基づき、実用的なスタジオレイアウトを配置。

## コンポーネント構造
- `App.tsx`: WebGPURenderer の初期化とレイアウトの統合。
- `StudioLayout`: ヘッダー、サイドバー、ツールバーを含む OS UI。
- `CameraController`: モード（2D, 2.5D, 3D）に応じた動的なカメラ制御。
- `store/useStore.ts`: 空間モードやズーム・パン状態の集中管理。

## 技術的ポイント
- `renderer.init()` による非同期初期化の確実な実行。
- `lerp` を用いたカメラの滑らかな遷移。
- `gridHelper` と `fog` を活用した 3D 空間の演出。
