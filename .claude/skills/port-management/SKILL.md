---
name: port-management
description: サーバー起動時のポート管理ルール。バックエンド8080・フロントエンド5173・DB5432を固定し、競合時は既存プロセスをkillして指定ポートで再起動する。別ポート起動は厳禁。
tags: [backend, frontend, devops, port-management]
---

# ポート管理・サーバー起動ルール

このスキルは、RaiseTech AI Coding プロジェクトのサーバー起動時に適用すべきポート管理規則を提供します。

## 概要

本プロジェクトは、以下の3つのサーバーコンポーネントを起動します。**各サーバーはポート番号が固定されており、別ポート起動は厳禁です。** ポート競合が発生した場合、必ず既存プロセスを停止して指定ポートで再起動してください。

---

## バックエンド (Spring Boot)

**ポート**: 8080（`application.yml` で指定）

### 起動手順

```bash
cd TaskManagement/backend
./gradlew bootRun
```

### ポート競合時の対応

1. `lsof -i :8080` でプロセスIDを確認
2. `kill -9 <PID>` で強制終了
3. 再度 `./gradlew bootRun` で起動
4. ポート 8080 で起動していることを確認

### 別ポート起動が禁止の理由

- `application.yml` でポート 8080 がハードコード設定
- フロントエンドの proxy 設定が `localhost:8080` 固定
- 別ポート起動により proxy が無効化され、CORS エラーが発生

---

## フロントエンド (Vite)

**ポート**: 5173（`vite.config.ts` で指定）

### 起動手順

```bash
cd TaskManagement/frontend
npm run dev
```

### ポート競合時の対応

1. `lsof -i :5173` でプロセスIDを確認
2. `kill -9 <PID>` で強制終了
3. 再度 `npm run dev` で起動
4. ポート 5173 で起動していることを確認

### 別ポート起動が禁止の理由

- Vite dev server の設定で port 5173 を明示指定
- `vite.config.ts` の proxy 設定は `/api` → `localhost:8080` 固定
- 別ポート起動により proxy 設定が無効化され、バックエンドAPI通信が失敗
- **ブラウザからアクセスできないため実質動作不可**

---

## データベース (PostgreSQL / Docker)

**ポート**: 5432（`docker-compose.yml` で指定）

### 起動手順

```bash
cd TaskManagement/backend
docker-compose up -d
```

### ポート競合時の対応

1. `docker ps` で `taskmanagement-db` コンテナを確認
2. `docker stop taskmanagement-db` でコンテナを停止
3. 再度 `docker-compose up -d` で起動
4. `docker ps` で `taskmanagement-db` が `Running` 状態を確認

### 別ポート起動が禁止の理由

- バックエンド Spring Boot が `jdbc:postgresql://localhost:5432/taskmanagement` で接続
- 別ポート起動により DB 接続が失敗して、アプリケーション全体が動作しない

---

## 自動化

本プロジェクトは `.claude/settings.json` の `PreToolUse` フックにより、以下のコマンド実行時にポート競合を自動で解消します：

- `./gradlew bootRun` 実行前 → `./.claude/port-cleanup.sh 8080` を実行
- `npm run dev` 実行前 → `./.claude/port-cleanup.sh 5173` を実行

これにより、手作業でのプロセス停止が不要になります。ただし、**ルール自体（8080/5173/5432固定、別ポート起動禁止）は変わりません。**

---

## トラブルシューティング

### `lsof: command not found`

```bash
# macOS の場合
brew install lsof

# Linux の場合
sudo apt-get install lsof  # Debian/Ubuntu
sudo yum install lsof       # CentOS/RHEL
```

### `docker-compose: command not found`

```bash
# Docker Compose を CLI プラグインとしてインストール
docker compose --version  # 新しい形式
# または
docker-compose --version  # 古い形式
```

### ポートが解放されない場合

以下を確認してください：

1. **複数のプロセスが同じポートを使用していないか**
   ```bash
   lsof -i :8080   # 全プロセスを列挙
   ```

2. **プロセスを停止しても TIME_WAIT 状態が残る場合**
   - OS のネットワークスタック設定で `TIME_WAIT` の保持時間が長い可能性
   - 数秒～数十秒待つ、または OS を再起動

3. **docker-compose のコンテナが完全に停止していない場合**
   ```bash
   docker stop taskmanagement-db
   docker rm taskmanagement-db
   docker-compose up -d  # 再起動
   ```

---

## 参考

- バックエンド設定: `TaskManagement/backend/src/main/resources/application.yml`
- フロントエンド設定: `TaskManagement/frontend/vite.config.ts`
- DB 設定: `TaskManagement/backend/docker-compose.yml`
- ポート自動クリアスクリプト: `.claude/port-cleanup.sh`
- Claude Code フック設定: `.claude/settings.json`
