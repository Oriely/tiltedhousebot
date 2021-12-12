const db = require("../../database/db");
const { cachedGuild, cachedUser } = require('../../database/caching');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {

		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.me
		const guilds  = await client.guilds.cache;
		let botCount = 0;
		for(const guild of guilds) {
			const [key, _guild] = guild;
			const guildData = new cachedGuild();

			await guildData.getOrSet(client, _guild);

			client.dbCache.guilds.set(_guild.id, guildData);
			console.log(guildData);
			const members = await _guild.members.cache;

			for(const member of members) {
				const [key, _member] = member;
				if(_member.user.bot) {
					botCount++;
					continue;
				}
				const userData = new cachedUser();
				await userData.getUser(client, _member);

				client.dbCache.users.set(_member.id, userData);
			}
		}
		client.logger.log(`Cached ${client.dbCache.guilds.size} guild(s) and ${client.dbCache.users.size} member(s) ignored ${botCount} bot(s)`);



		client.isReady = true;
	},
};
