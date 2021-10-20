const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nowplaying')
		.setDescription('Tells what song is currently playing.'),
	async execute(interaction) {
        console.log(interaction.member.voice);
		await interaction.reply('Songname...');
	},
};
