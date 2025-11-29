# Supabase セットアップガイド

このガイドでは、ライフプランシミュレーションアプリケーションのSupabaseプロジェクトをセットアップする手順を説明します。

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてアカウントを作成（または既存アカウントでログイン）

2. 「New Project」をクリック

3. プロジェクト情報を入力：
   - **Name**: `lifeplan-simulation`
   - **Database Password**: 安全なパスワードを設定（必ず記録しておく）
   - **Region**: 最も近いリージョンを選択（例：Northeast Asia (Tokyo)）
   - **Pricing Plan**: Free（開発用）または Pro

4. 「Create new project」をクリック

## 2. データベーススキーマの適用

プロジェクトが作成されたら、SQLエディタを使用してスキーマを適用します。

### 方法1: Supabase SQL Editorを使用

1. Supabaseダッシュボードの左サイドバーから「SQL Editor」を選択

2. 「New query」をクリック

3. `supabase/migrations/20251122000001_initial_schema.sql`の内容をコピー&ペースト

4. 「Run」をクリックしてSQLを実行

5. エラーがないことを確認

### 方法2: Supabase CLIを使用（推奨）

```bash
# Supabase CLIのインストール（初回のみ）
npm install -g supabase

# Supabaseにログイン
supabase login

# プロジェクトrefを確認
# Supabaseダッシュボード → Settings → General → Reference ID
# または、Project URLから取得: https://YOUR_PROJECT_REF.supabase.co

# プロジェクトにリンク（project-refは20文字の英数字）
supabase link --project-ref YOUR_PROJECT_REF

# または、対話的に選択
supabase link

# マイグレーションを適用
supabase db push
```

**ヒント**:
- `project-ref`は20文字の英数字です（例: `abcdefghijklmnopqrst`）
- エラーが出る場合は、Supabaseダッシュボードから正確なReference IDをコピーしてください

## 3. 環境変数の設定

1. Supabaseダッシュボードの「Settings」→「API」から以下の情報を取得：
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. プロジェクトルートに`.env.local`ファイルを作成：

```bash
cp .env.example .env.local
```

3. `.env.local`に取得した値を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Google OAuth認証の設定

1. Supabaseダッシュボードの「Authentication」→「Providers」を選択

2. 「Google」を有効化

3. Google Cloud Consoleで認証情報を作成：
   - [Google Cloud Console](https://console.cloud.google.com/)にアクセス
   - 新しいプロジェクトを作成（または既存プロジェクトを選択）
   - 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuthクライアントID」
   - アプリケーションの種類：「ウェブアプリケーション」
   - 承認済みのリダイレクトURI：`https://your-project-ref.supabase.co/auth/v1/callback`

4. 取得した**クライアントID**と**クライアントシークレット**をSupabaseに設定

5. 「Save」をクリック

## 5. データベース構造の確認

以下のテーブルが作成されていることを確認してください：

- `public.users` - ユーザー情報
- `public.scenarios` - シミュレーションシナリオ
- `public.income_items` - 収入項目
- `public.expense_items` - 支出項目
- `public.life_events` - ライフイベント
- `public.investment_settings` - 資産運用設定

### RLS（Row Level Security）ポリシーの確認

すべてのテーブルでRLSが有効になっており、ユーザーは自分のデータのみアクセス可能になっています。

### Triggerの確認

以下のTriggerが設定されていることを確認：

1. **updated_at自動更新**: 各テーブルの`updated_at`カラムを自動更新
2. **新規ユーザー自動作成**: `auth.users`にレコードが作成された際に、`public.users`レコードを自動作成

## 6. 動作確認

開発サーバーを起動して動作確認を行います：

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて、正常に動作することを確認してください。

## トラブルシューティング

### マイグレーションエラーが発生する場合

- SQLエディタで各ステートメントを個別に実行してエラー箇所を特定
- Supabase側で既存のテーブルが存在する場合は削除してから再実行

### 認証エラーが発生する場合

- `.env.local`の環境変数が正しく設定されているか確認
- Supabaseダッシュボードで認証プロバイダーが有効になっているか確認
- Google OAuthのリダイレクトURIが正しく設定されているか確認

### RLSポリシーエラーが発生する場合

- ユーザーがログインしているか確認
- Supabaseダッシュボードの「Authentication」→「Users」でユーザーが作成されているか確認
- `public.users`テーブルにユーザーレコードが自動作成されているか確認

## 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
