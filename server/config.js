
const isProduction = process.env.NODE_ENV == "production"

module.exports = {
    isProduction: isProduction,
    token: isProduction ? process.env.TOKEN : process.env.TEST_BOT_TOKEN,
    guildId: process.env.GUILD_ID,
    clientId: isProduction ? process.env.CLIENT_ID : process.env.TEST_BOT_CLIENT_ID
}