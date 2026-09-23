CREATE TABLE boards (
    id         BIGSERIAL PRIMARY KEY,
    title      VARCHAR(50)  NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE columns (
    id         BIGSERIAL PRIMARY KEY,
    board_id   BIGINT       NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    title      VARCHAR(30)  NOT NULL,
    position   INTEGER      NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_columns_board_id ON columns(board_id);

CREATE TABLE cards (
    id          BIGSERIAL PRIMARY KEY,
    column_id   BIGINT       NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    title       VARCHAR(100) NOT NULL,
    priority    VARCHAR(10)  NOT NULL DEFAULT 'medium',
    description TEXT,
    due_date    DATE,
    position    INTEGER      NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cards_column_id ON cards(column_id);
