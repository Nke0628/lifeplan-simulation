# ライフプランシミュレーションアプリケーション

個人利用者が自身のライフプランをシミュレーションし、将来の収支や資産状況を可視化できるWebアプリケーションです。

## 技術スタック

### フロントエンド
- **Next.js 14+** (App Router)
- **TypeScript** - 型安全性と保守性の向上
- **TailwindCSS** - 高速な開発と一貫性のあるデザイン
- **Recharts** - データ可視化
- **Zustand** または **React Context API** - 状態管理
- **React Hook Form** - フォーム管理

### バックエンド
- **Next.js API Routes** - API実装
- **Supabase** - BaaS（PostgreSQL、認証、リアルタイム同期）
- **Prisma** または **Supabase Client** - ORM

### ホスティング・インフラ
- **Vercel** - フロントエンドホスティング
- **Supabase** - データベース

## 前提条件

- Node.js 20.x 以上
- npm または yarn

## セットアップ

1. リポジトリをクローン

```bash
git clone <repository-url>
cd lifeplan-simulation
```

2. 依存パッケージをインストール

```bash
npm install
```

3. Supabaseプロジェクトのセットアップ

Supabaseプロジェクトを作成し、データベーススキーマを適用してください。
詳細な手順は [supabase/README.md](./supabase/README.md) を参照してください。

4. 環境変数を設定

`.env.example`を`.env.local`にコピーして、Supabaseの環境変数を設定してください。

```bash
cp .env.example .env.local
```

`.env.local`の内容:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## スクリプト

- `npm run dev` - 開発サーバーを起動
- `npm run build` - 本番用ビルドを作成
- `npm run start` - 本番サーバーを起動
- `npm run lint` - ESLintでコードをチェック
- `npm run format` - Prettierでコードをフォーマット
- `npm run format:check` - フォーマットをチェック

## プロジェクト構成

```
lifeplan-simulation/
├── src/
│   ├── app/              # Next.js App Router (ページとレイアウト)
│   ├── components/       # Reactコンポーネント
│   ├── hooks/            # カスタムフック
│   ├── lib/              # ライブラリとユーティリティ
│   ├── types/            # TypeScript型定義
│   ├── styles/           # グローバルスタイル
│   └── utils/            # ユーティリティ関数
├── public/               # 静的ファイル
├── CLAUDE.md            # 要件定義書
└── README.md            # このファイル
```

## 主要機能

- ✅ 認証機能（Google OAuth）
- ✅ 収支計算（月次ベース）
- ✅ ライフイベント管理
- ✅ 資産運用計算（複利、税金、インフレ）
- ✅ シミュレーション機能
- ✅ 複数シナリオ比較
- ✅ データ可視化（グラフ、チャート）

## ライセンス

Private

## 詳細ドキュメント

詳細な要件定義については、[CLAUDE.md](./CLAUDE.md)を参照してください。
