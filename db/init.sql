CREATE TYPE dance_type AS ENUM ('Bachata', 'Salsa', 'Cumbia');

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL        PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    password      VARCHAR(255)  NOT NULL,
    paid_at       DATE          NOT NULL,
    classes_paid  INT           NOT NULL DEFAULT 0,
    is_active     BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dance_classes (
    id          SERIAL      PRIMARY KEY,
    type        dance_type  NOT NULL,
    class_date  DATE        NOT NULL,
    user_id     INT         NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_class_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_classes_user    ON dance_classes (user_id);
CREATE INDEX idx_classes_type    ON dance_classes (type);
CREATE INDEX idx_classes_date    ON dance_classes (class_date);
CREATE INDEX idx_users_is_active ON users (is_active);