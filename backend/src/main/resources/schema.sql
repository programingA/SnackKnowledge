CREATE TABLE IF NOT EXISTS member_account (
    username VARCHAR(30) PRIMARY KEY,
    password_hash VARCHAR(100) NOT NULL
) CHARACTER SET utf8mb4;
