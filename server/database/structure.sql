CREATE TABLE IF NOT EXISTS Guilds (
    guildId VARCHAR(255) NOT NULL PRIMARY KEY,
    guildOwnerId VARCHAR(255) NOT NULL,
    lotterypool bigint DEFAULT 0
);

CREATE TABLE IF NOT EXISTS GuildConfig (
    guildId VARCHAR(255) NOT NULL,
    currencyName VARCHAR(24) NOT NULL DEFAULT 'gold',
    currencySymbol VARCHAR(1) NOT NULL DEFAULT '$',
    FOREIGN KEY (guildId) REFERENCES Guilds(guildId) 
);

CREATE TABLE IF NOT EXISTS Users (
    userId VARCHAR(255) NOT NULL PRIMARY KEY,
    balance bigint DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Logs (
    guildId VARCHAR(255) NOT NULL,
    userId VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    timestamp timestamp NOT NULL,
    FOREIGN KEY (guildId) REFERENCES Guilds(guildId),
    FOREIGN KEY (userId) REFERENCES Users(userId)
);