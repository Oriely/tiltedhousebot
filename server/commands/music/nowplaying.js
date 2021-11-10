const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('nowplaying')
		.setDescription('Tells what song is currently playing.'),
	async execute(interaction, client) {
		if(!interaction.member.voice.channelId) return await interaction.reply('You have to be in a voice channel to use this command.');

		let serverQueue = client.guildQueues.get(interaction.guildId);

		if(!serverQueue) return await interaction.reply('Bot is not playing music.');

		const currentSong = serverQueue.nowPlaying();

		const embed = new MessageEmbed()

		.setTitle('Now playing')
		.setDescription(currentSong.title)
		.setThumbnail(currentSong.thumbnail_url)
		.setColor('#1B1C31');
		await interaction.reply({embeds: [embed]});
	},
};
