# Claude Code 設定・ガイドライン

## ポート管理規則

**スキル参照**: `/port-management`

詳細なポート管理ルール（8080/5173/5432固定、競合時の対応手順、別ポート起動が禁止な理由）は、独立したスキル `.claude/skills/port-management/SKILL.md` に一元化されています。

サーバー起動時は上記スキルを参照するか、以下のコマンドで呼び出してください:

```bash
# スキルの詳細を確認
claude /port-management

# または直接読み込み
cat .claude/skills/port-management/SKILL.md
```

**クイックリファレンス**:
- バックエンド: ポート 8080、競合時は `lsof -i :8080` → `kill -9` → 再起動
- フロントエンド: ポート 5173、競合時は `lsof -i :5173` → `kill -9` → 再起動
- DB: ポート 5432、競合時は `docker stop taskmanagement-db` → `docker-compose up -d`
- 自動化: `.claude/settings.json` フックで起動時にポート確認・クリア

---

## 言語・コミュニケーション

- 返答・質問・計画書・Issue/PR: すべて **日本語**
- git commit メッセージ: **日本語**
- コード内コメント: 最小限（WHY が非自明な場合のみ）、英語可

---

## Git ワークフロー

- ブランチ: `feature/番号-機能名` で作業中
- コミット: 新規コミットを作成（amend しない）
- main へのpush: 必ず確認してから実行
- 強制푸시(--force): 使用禁止

---

## テスト・動作確認

サーバー起動後、必ず以下の動作確認を実施:

1. **バックエンドヘルスチェック**:
   ```bash
   curl http://localhost:8080/health
   # 期待値: {"status":"ok"}
   ```

2. **フロントエンドページロード**:
   ```bash
   curl http://localhost:5173/ | grep -o '<title>.*</title>'
   ```

3. **API 動作確認**:
   ```bash
   curl http://localhost:8080/api/boards
   ```

4. **ブラウザ動作確認**:
   - http://localhost:5173 を開く
   - ボード一覧 → ボード詳細 → 検索機能 の一連の流れを確認

---

## プロジェクト構成

```
TaskManagement/
├── backend/              # Spring Boot (Java + PostgreSQL)
│   ├── src/main/java/
│   ├── build.gradle
│   ├── application.yml   (server.port: 8080)
│   └── docker-compose.yml (PostgreSQL)
├── frontend/             # Vite + React + TypeScript
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts    (port: 5173, proxy: /api → localhost:8080)
│   └── tailwind.config.js
└── docs/                 # 仕様書
    ├── requirements.md
    ├── screen-design.md
    └── tech-stack.md
```
