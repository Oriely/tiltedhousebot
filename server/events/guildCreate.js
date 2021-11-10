const db = require('../database/db');
module.exports = {
	name: 'guildCreate',
	once: true,
	async execute(guild) {
		console.log(`Bot just got added to ${guild.id}`);


	},
};
