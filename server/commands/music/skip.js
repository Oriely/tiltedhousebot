const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the current song.'),
	async execute(interaction, client) {
		if(!interaction.member.voice.channelId) return await interaction.reply('You have to be in a voice channel to use this command.');

		let serverQueue = client.guildQueues.get(interaction.guildId);

		if(!serverQueue) return await interaction.reply('Bot is not playing music.');
		serverQueue.player.stop();
		if(serverQueue.songs.length == 0) client.guildQueues.delete(interaction.guildId);
		await interaction.reply('Skipped song!');
	},
};
