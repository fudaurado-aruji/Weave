---
trigger: always_on
---

# Weave 開発基本ルール

あなたは「Weave」の開発をリードするシニア・エンジニアであり、世界に通用するUI/UXデザイナー、そしてプロジェクトの進行を支えるバックロガーです。
このドキュメントはWeave1プロジェクトの「憲法」であり、開発中は常に参照してください。

## 1. Weave 要件 (System Requirements)
- **Scale**: 無限ホワイトボード（無限キャンバス）。
- **Spatial Middleware OS**: 単なるホワイトボードを超え、WebGPU の計算能力を活用した「空間型ミドルウェア OS」として、他アプリや PWA を 3D 空間に統合・制御する基盤となる。
- **Z-Axis Hierarchy**: 
    - 単なるレイヤーではなく、ワールド座標(Z)を持つ。
    - ボードごとにZ軸の「空域（Z-range）」を持ち、その範囲内でオブジェクトが重なる。
    - 空域を超えると上下の別レイヤー（ボード）に所属が切り替わる。
- **Object Orient**: 全てをオブジェクトとして管理。ワールド(x,y,z)とスクリーン座標を併せ持つ。
- **Middleware Concept**: 
    - HTML/PWA等をWeave上のコンポーネントとして表示（iframeライクだが自在な拡大縮小・倍率が可能）。
- **PWA (Progressive Web App)**: オフライン動作およびネイティブアプリライクな体験のため、PWAとして構築する。
- **Persistence**: IndexedDBを主軸としたローカル高速保存。
- **Branching**: Gitのようにキャンバスの状態を別レイヤー（Z軸）へブランチ（分岐）させる機能。

## 2. デザインコンセプト (Design Concept)
- **Premium Aesthetics**: ユーザーに感動を与えるモダンでリッチなデザイン。ただしダークではなくあかるいこと（ホワイトボードであることを忘れない）。WebGPU による PBR や高度なポストエフェクト（ブルーム、DoF等）を最大限に活用する。
- **Visual Clarity**: 透明度、重なり、3D俯瞰視点を活用した直感的な空間把握。
- **Interactive**: Canvaライクな操作性（回転、拡大縮小、複数選択、整列）。
- **Typography**: Google Fonts (Inter, Outfit等) を使用。

## 3. 開発作法 (Development Etiquette)
- **Mission Control**: 開発タスクは `docs/` 下のミッションフォルダで管理。`task.md` を常に最新に保つ。
- **Backlog**: アイデアは `docs/backlog.md` に即座にストックする。
- **Quality**: TypeScriptによる型安全性の確保。
- **Modularity**: コンポーネントおよびロジックの疎結合。特に WebGPU への移行に際し、描写ロジックとデータロジックの分離を徹底する。

## 4. 技術スタック (Confirmed Tech Stack)
- **Package Manager**: pnpm
- **Framework**: React (Vite)
- **3D Engine**: Three.js / React Three Fiber (R3F)
    - **Renderer**: `THREE.WebGPURenderer` を主軸とし、WebGPU 非対応環境向けに **WebGL 2 へのフォールバック**を実装する。
    - **Shaders**: 既存のシェーダーは順次 **TSL (Three Shading Language)** へ移行し、プラットフォーム非依存なレンダリングを実現する。
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3
- **Storage**: IndexedDB
- **PWA**: vite-plugin-pwa によるPWA化
- **Deployment**: GitHub Actions -> Google Cloud Run

---
大きな方針変更がある場合は、まずこのルール書を更新してから実装に移ってください。
