# 環境・バージョン情報

このドキュメントでは、プロジェクトで使用している言語・フレームワーク・ツール・ライブラリのバージョン情報を記載しています。

開発環境構築時の参考にしてください。

## バックエンド（Java / Spring Boot）

### 言語・ランタイム
- **Java**: 21.0.5 LTS（推奨）
  - Toolchain: Java 25 対応
  - JVM: Oracle JDK 21以上推奨
  
### フレームワーク・ビルドツール
- **Spring Boot**: 4.0.6
- **Gradle**: 9.5.1（Gradle Wrapper使用）
- **Spring Dependency Management**: 1.1.7

### データベース・マイグレーション
- **PostgreSQL**: 15系（Docker環境で実行）
- **Flyway**: Spring Boot Starter Flyway
  - flyway-database-postgresql: 依存

### テストツール
- **JUnit**: Spring Boot Test
- **Testcontainers**: PostgreSQL対応
  - testcontainers-postgresql: 依存

### ビルド & 実行
```bash
cd TaskManagement/backend

# ビルド
./gradlew build

# テスト実行
./gradlew test

# 実行
./gradlew bootRun

# または
java -jar build/libs/taskmanagement-*.jar
```

## フロントエンド（React / TypeScript）

### ランタイム・パッケージマネージャー
- **Node.js**: v25.2.1（推奨）
- **npm**: 11.6.2

### フレームワーク・ライブラリ
- **React**: 19.2.8（最新: 19.3.0）
  - react-dom: 19.2.8
- **TypeScript**: 6.0.2（最新: 7.0.2）
  - 言語機能: モダンTS（ES2020+）
  - tsconfig strict mode有効

### ビルドツール・スタイリング
- **Vite**: 8.3.0
  - HMR対応
  - React プラグイン: @vitejs/plugin-react 6.1.1
- **Tailwind CSS**: 4.3.3
  - PostCSS統合: @tailwindcss/postcss 4.3.3
  - autoprefixer: 10.6.1

### 開発ツール
- **oxlint**: 1.81.0（Linting）
- **PostCSS**: 8.5.28
- **TypeScript**: ~6.0.2

### インストール & 実行
```bash
cd TaskManagement/frontend

# 依存インストール
npm install

# 開発サーバー起動（port 5173）
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview

# Lint チェック
npx oxlint
```

## 互換性・アップグレード情報

### React & react-dom
- 現在: 19.2.8
- 最新: 19.3.0
- **アップグレード**: マイナー更新のため安全に実行可能

### TypeScript
- 現在: 6.0.2
- 最新: 7.0.2
- **アップグレード**: メジャー更新（互換性確認要）
  - 実施時は念のため動作確認を実施すること

## ポート設定

開発環境でのサーバー起動ポート：

| サービス | ポート | 用途 |
|---------|--------|------|
| バックエンド（Spring Boot） | 8080 | REST API サーバー |
| フロントエンド（Vite） | 5173 | 開発サーバー |
| データベース（PostgreSQL） | 5432 | PostgreSQL（Docker） |

詳細は `.claude/skills/port-management/SKILL.md` を参照してください。

## 関連ドキュメント

- [技術スタック](tech-stack.md)
- [要件定義](requirements.md)
- [画面設計](screen-design.md)
- [データモデル](data-model.md)
