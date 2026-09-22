INSERT INTO boards (title) VALUES
    ('個人タスク');

INSERT INTO columns (board_id, title, position) VALUES
    ((SELECT id FROM boards WHERE title = '個人タスク'), '未着手', 0),
    ((SELECT id FROM boards WHERE title = '個人タスク'), '作業中', 1),
    ((SELECT id FROM boards WHERE title = '個人タスク'), '完了', 2);

INSERT INTO cards (column_id, title, priority, description, due_date, position) VALUES
    (1, 'API設計書を作成する', 'medium', 'エンドポイント一覧とリクエスト・レスポンス形式をまとめる', '2026-08-20', 2),
    (2, 'カード検索APIの実装', 'high', 'キーワード・優先度・期限日で絞り込めるようにする', '2026-08-25', 2),
    (3, 'Docker環境の構築', 'low', 'docker-composeでPostgreSQLを起動できるようにする', '2026-07-20', 1);

INSERT INTO cards (column_id, title, priority, description, due_date, position)
SELECT c.id, v.title, v.priority, v.description, v.due_date::DATE, v.position
FROM (VALUES
    ('未着手', '英語の勉強', 'low', 'Duolingoを毎日15分', NULL, 0),
    ('未着手', '確定申告の準備', 'high', '領収書を整理する', '2026-09-30', 1),
    ('未着手', '部屋の掃除', 'medium', NULL, '2026-10-05', 2),
    ('作業中', 'Spring Bootの本を読む', 'medium', '第5章 Spring Data JPA', '2026-09-15', 0),
    ('作業中', 'ポートフォリオサイトの更新', 'high', NULL, '2026-10-01', 1),
    ('完了', '健康診断の予約', 'medium', '9月中に受診する', '2026-08-31', 0)
) AS v(column_title, title, priority, description, due_date, position)
JOIN columns c ON c.title = v.column_title
JOIN boards b ON b.id = c.board_id AND b.title = '個人タスク';
