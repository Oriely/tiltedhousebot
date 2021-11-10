const economy = require('../database/economy');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message, client) {
        const currencyGainPerMessage = 10;
        const messageAuthor = message.author.id;
        try {
            economy.add(messageAuthor, currencyGainPerMessage);
            console.log(`${currencyGainPerMessage} got added to ${messageAuthor}`)
        } catch(error) {
            console.log(error);
        }
	},
};
