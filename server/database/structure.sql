CREATE TABLE Guilds (
    guildId VARCHAR(255) NOT NULL,
    guildOwnerId VARCHAR(255) NOT NULL
);

CREATE TABLE GuildConfig (
    guildId VARCHAR(255) FOREIGN KEY REFERENCES Guilds(guildId),
    currencyName VARCHAR(24) NOT NULL DEFAULT 'gold',
    currencySymbol VARCHAR(1) NOT NULL DEFAULT 
);

CREATE TABLE Users (
    userId VARCHAR(255) NOT NULL,
    balance bigint DEFAULT 0
);

CREATE TABLE Logs (
    guildId VARCHAR(255) FOREIGN KEY REFERENCES Guilds(guildId),
    userId VARCHAR(255) FOREIGN KEY REFERENCES Users(userId),
    type VARCHAR(100) NOT NULL,
    timestamp DATETIME NOT NULL
);