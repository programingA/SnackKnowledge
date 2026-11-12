CREATE TABLE IF NOT EXISTS member_account (
    username VARCHAR(30) PRIMARY KEY,
    password_hash VARCHAR(100) NOT NULL
) CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS member_bookmark (
    username VARCHAR(30) NOT NULL,
    knowledge_id BIGINT NOT NULL,
    saved_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (username, knowledge_id),
    FOREIGN KEY (username) REFERENCES member_account(username) ON DELETE CASCADE
) CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS member_learning_history (
    username VARCHAR(30) NOT NULL,
    knowledge_id BIGINT NOT NULL,
    activity VARCHAR(16) NOT NULL,
    learned_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (username, knowledge_id, activity),
    INDEX member_learning_recent (username, learned_at),
    FOREIGN KEY (username) REFERENCES member_account(username) ON DELETE CASCADE
) CHARACTER SET utf8mb4;
