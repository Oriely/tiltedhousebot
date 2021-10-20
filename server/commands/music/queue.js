const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Tells all the songs in the queue.'),
	async execute(interaction, client) {
		let serverQueue = client.guildQueues.get(interaction.guildId);

		if(!serverQueue) return await interaction.reply('Bot is not playing music.');
		const queueEmbed = new MessageEmbed()
		.setTitle('Song queue:');

		let queueList = 'Songs in queue:\n';
		serverQueue.songs.forEach((song, index) => {
			queueList += `${song.title}\n`;
		});
		await interaction.reply(queueList);
	},
};