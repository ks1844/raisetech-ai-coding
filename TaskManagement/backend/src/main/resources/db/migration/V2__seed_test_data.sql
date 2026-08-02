INSERT INTO boards (id, title) VALUES
    (1, 'サンプルボード');

INSERT INTO columns (id, board_id, title, position) VALUES
    (1, 1, 'To Do', 0),
    (2, 1, 'In Progress', 1),
    (3, 1, 'Done', 2);

INSERT INTO cards (column_id, title, priority, description, due_date, position) VALUES
    (1, '要件定義をまとめる', 'high', 'プロジェクトの要件を整理してドキュメント化する', '2026-08-10', 0),
    (1, 'DB設計を見直す', 'medium', NULL, '2026-08-15', 1),
    (2, 'API実装（READ）', 'high', 'タスク一覧取得APIを実装する', '2026-08-05', 0),
    (2, 'フロント画面の作成', 'low', NULL, NULL, 1),
    (3, 'プロジェクト初期セットアップ', 'medium', 'Spring Boot雛形とFlyway設定', '2026-07-25', 0);

SELECT setval('boards_id_seq', (SELECT MAX(id) FROM boards));
SELECT setval('columns_id_seq', (SELECT MAX(id) FROM columns));
SELECT setval('cards_id_seq', (SELECT MAX(id) FROM cards));
