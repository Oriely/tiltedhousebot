const path = require('path');
const economy = require(path.join(__dirname, '../../database/economy'));

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message, client) {
        const currencyGainPerMessage = 10;
        const messageAuthor = message.author.id;
        
        if(!message.author.bot) {
            const userData = client.dbCache.users.get(messageAuthor)
            console.log(userData)

            userData.data.economy.balance += Math.round(Math.random() * 5) + 1;
            userData.data.stats.experience += Math.round(Math.random() * 50) + 1;
            console.log(userData.data.economy.balance)  
        }
	},
};
