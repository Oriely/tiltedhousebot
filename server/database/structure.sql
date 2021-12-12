CREATE TABLE IF NOT EXISTS guilds (
    guild_id VARCHAR(255) PRIMARY KEY,
    guild_owner_id VARCHAR(255) NOT NULL,
    lotterypool bigint DEFAULT 0
);

CREATE TABLE IF NOT EXISTS guild_config (
    guild_id VARCHAR(255) NOT NULL,
    currency_name VARCHAR(24) NOT NULL DEFAULT 'gold',
    currency_symbol VARCHAR(1) NOT NULL DEFAULT '$',
    FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(255) PRIMARY KEY,
    stats JSON NOT NULL,
    economy JSON NOT NULL,
    cooldowns JSON NOT NULL,
    blacklisted BOOLEAN NOT NULL DEFAULT false
);