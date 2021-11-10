const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Shuffle the song queue.'),
	async execute(interaction, client) {
		if(!interaction.member.voice.channelId) return await interaction.reply('You have to be in a voice channel to use this command.');

		let serverQueue = client.guildQueues.get(interaction.guildId);

		if(!serverQueue) return await interaction.reply('Bot is not playing music.');
		serverQueue.shuffle();
		await interaction.reply('Shuffled queue');
	},
};
