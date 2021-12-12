
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('test'),
	async execute(interaction, client) {
        const userData = client.dbCache.users.get(interaction.member.id);
        const guildData = client.dbCache.guilds.get(interaction.guild.id);
        userData.save(client);
        
        console.log(guildData);
        console.log(userData);
        interaction.reply(JSON.stringify(userData.data));
	},
};


