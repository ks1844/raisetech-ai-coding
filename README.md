# raisetech-ai-coding

RaiseTech AIコーディングコースの学習成果物として、**Trello風タスク管理アプリ** を開発しています。

フロントエンド開発の基礎技術（React / TypeScript / Tailwind CSS）とバックエンド API 開発を実践し、SPAの設計・実装を習得することが目標です。

---

## 📋 プロジェクト概要

| 項目 | 内容 |
|------|------|
| **プロジェクト名** | Trello風タスク管理アプリ |
| **目的** | RaiseTech AIコーディングコースの学習成果物 |
| **機能** | ボード管理、カラム管理、カード管理、カード検索 |
| **対象ユーザー** | シングルユーザー（自分一人） |
| **認証** | 不要 |

---

## 🛠 技術スタック

### バックエンド（Java / Spring Boot）

| カテゴリ | 技術 | バージョン |
|---------|------|----------|
| **言語** | Java | 21.0.5 LTS |
| **フレームワーク** | Spring Boot | 4.0.6 |
| **ビルドツール** | Gradle | 9.5.1 |
| **データベース** | PostgreSQL | 15系 |
| **マイグレーション** | Flyway | 依存版 |
| **テスト** | Testcontainers | 依存版 |

### フロントエンド（React / TypeScript）

| カテゴリ | 技術 | バージョン |
|---------|------|----------|
| **ランタイム** | Node.js | v25.2.1 |
| **パッケージマネージャー** | npm | 11.6.2 |
| **フレームワーク** | React | 19.2.8 |
| **言語** | TypeScript | 6.0.2 |
| **ビルドツール** | Vite | 8.3.0 |
| **スタイリング** | Tailwind CSS | 4.3.3 |
| **Linter** | oxlint | 1.81.0 |

### 開発環境

- **バージョン管理**: Git / GitHub
- **Docker**: ローカル開発環境（PostgreSQL）
- **IDE**: Cursor（推奨）

---

## 📁 プロジェクト構成

```
raisetech-ai-coding/
├── TaskManagement/
│   ├── backend/                    # バックエンド（Spring Boot）
│   │   ├── src/
│   │   │   ├── main/java/          # 本体コード
│   │   │   └── test/               # テストコード
│   │   ├── build.gradle            # Gradle設定
│   │   ├── gradlew                 # Gradle Wrapper
│   │   ├── application.yml         # Spring設定（port: 8080）
│   │   └── docker-compose.yml      # PostgreSQL（port: 5432）
│   │
│   ├── frontend/                   # フロントエンド（React + Vite）
│   │   ├── src/
│   │   │   ├── components/         # Reactコンポーネント
│   │   │   ├── pages/              # ページコンポーネント
│   │   │   ├── api/                # API通信処理
│   │   │   ├── types/              # TypeScript型定義
│   │   │   ├── index.css           # Tailwind CSS
│   │   │   └── main.tsx            # エントリーポイント
│   │   ├── package.json            # npm依存関係
│   │   ├── vite.config.ts          # Vite設定（port: 5173）
│   │   ├── tsconfig.json           # TypeScript設定
│   │   └── tailwind.config.js      # Tailwind CSS設定
│   │
│   └── docs/                       # ドキュメント
│       ├── requirements.md         # 要件定義
│       ├── functions.md            # 機能一覧
│       ├── screen-design.md        # 画面設計
│       ├── data-model.md           # データモデル・ER図
│       ├── tech-stack.md           # 技術スタック詳細
│       └── versions.md             # バージョン情報
│
├── .claude/                        # Claude Code設定
│   ├── skills/                     # カスタムスキル
│   └── plans/                      # 実装計画
│
├── CLAUDE.md                       # プロジェクトルール
└── README.md                       # このファイル
```

---

## 🚀 クイックスタート

### 前提条件

- **Java 21** 以上
- **Node.js v25** 以上
- **npm 11** 以上
- **PostgreSQL** 15系（Dockerで実行）
- **Docker** & **Docker Compose**

### 環境構築手順

#### 1. リポジトリクローン

```bash
git clone https://github.com/ks1844/raisetech-ai-coding.git
cd raisetech-ai-coding
```

#### 2. データベース起動（Docker）

```bash
cd TaskManagement
docker-compose up -d

# PostgreSQL への接続確認
docker exec taskmanagement-db psql -U taskuser -d taskmanagement -c "SELECT 1;"
```

#### 3. バックエンドセットアップ & 起動

```bash
cd backend

# 依存ダウンロード & ビルド
./gradlew build

# 起動（localhost:8080）
./gradlew bootRun

# または
java -jar build/libs/taskmanagement-*.jar
```

ヘルスチェック：
```bash
curl http://localhost:8080/health
# 期待値: {"status":"ok"}
```

#### 4. フロントエンドセットアップ & 起動

別のターミナルで：

```bash
cd frontend

# 依存インストール
npm install

# 開発サーバー起動（localhost:5173）
npm run dev

# ブラウザで自動起動
# http://localhost:5173
```

---

## 📖 ドキュメント

### 要件・仕様

- **[要件定義](TaskManagement/docs/requirements.md)** - プロジェクト概要、用語定義、関連ドキュメント
- **[機能一覧](TaskManagement/docs/functions.md)** - 機能要件、ユースケース、仕様詳細
- **[画面設計](TaskManagement/docs/screen-design.md)** - 画面構成、遷移図、UI仕様
- **[データモデル](TaskManagement/docs/data-model.md)** - テーブル定義、ER図、型定義

### 技術情報

- **[技術スタック詳細](TaskManagement/docs/tech-stack.md)** - 採用技術の理由・背景
- **[バージョン情報](TaskManagement/docs/versions.md)** - 言語・フレームワーク・ツール・ライブラリの具体的バージョン

### 開発ガイド

- **[CLAUDE.md](CLAUDE.md)** - ポート管理、Git ワークフロー、テスト・動作確認手順

---

## 🎯 機能一覧

### ボード管理
- ✅ ボード一覧表示
- ✅ ボード詳細表示（カラム・カード）

### カラム管理
- ✅ カラム表示（横スクロール対応）
- ✅ カラムヘッダーに件数バッジ表示

### カード管理
- ✅ カード一覧表示
- ✅ 優先度バッジ表示（色分け：高=赤、中=黄、低=青）
- ✅ 期限日表示
- ✅ カード検索（キーワード・優先度・期限日・並び順）

### UI/UX
- ✅ Trello風の横スクロールカラムレイアウト
- ✅ Tailwind CSS による統一デザイン
- ✅ レスポンシブ対応

---

## 🔗 API仕様

### ベースURL
```
http://localhost:8080/api
```

### エンドポイント

#### ボード取得
```http
GET /boards
GET /boards/:id
```

#### カード検索
```http
GET /cards?keyword=...&priority=...&dueFrom=...&dueTo=...&sort=...
```

詳細は API の Swagger ドキュメント（実装時に追加予定）を参照してください。

---

## 🧪 テスト・品質確認

### フロントエンド

```bash
cd TaskManagement/frontend

# Lint チェック
npx oxlint

# ビルド検証
npm run build

# プレビュー
npm run preview
```

### バックエンド

```bash
cd TaskManagement/backend

# テスト実行（Testcontainers使用）
./gradlew test

# ビルド検証
./gradlew build
```

---

## 🔧 開発時の注意点

### ポート管理

| サービス | ポート | 備考 |
|---------|--------|------|
| Spring Boot | 8080 | REST API サーバー |
| Vite | 5173 | 開発サーバー |
| PostgreSQL | 5432 | Docker経由 |

ポート競合時は `CLAUDE.md` と `.claude/skills/port-management/SKILL.md` を参照してください。

### Git ワークフロー

- ブランチ: `feature/番号-機能名`
- コミットメッセージ: **日本語**
- 主要な変更前に issue ⇒ PR を作成

詳細は [CLAUDE.md](CLAUDE.md) を参照。

---

## 📝 開発進捗

### 実装済み
- ✅ バックエンド API（READ系）
- ✅ フロントエンド画面（一覧・詳細・検索）
- ✅ Trello風 UI デザイン
- ✅ テストデータ・サンプルボード投入

### 今後の予定
- 🔄 カード作成・編集・削除 API
- 🔄 ドラッグアンドドロップ機能
- 🔄 ユーザー認証（必要に応じて）
- 🔄 E2E テスト

---

## 📞 サポート・フィードバック

問題が発生した場合は、GitHub Issues で報告してください。

開発ガイドについて質問がある場合は [CLAUDE.md](CLAUDE.md) を先にご確認ください。

---

## 📄 ライセンス

（未定）

---

**Last Updated**: 2026-09-23
