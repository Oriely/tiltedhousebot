const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('connect')
		.setDescription('Connects me to the voice channel you are in.'),
	async execute(interaction, client) {

		let connection = await getVoiceConnection(interaction.guildId);
		if(!interaction.member.voice.channelId) return await interaction.reply('You have to be in a voice channel to use this command.');
		
		if(!connection) {

			connection = joinVoiceChannel({
				channelId: interaction.member.voice.channelId,
				guildId: interaction.guildId,
				adapterCreator: interaction.guild.voiceAdapterCreator
			});
			console.log(connection)
			return await interaction.reply('Joined your voice channel.');
		}
		return await interaction.reply('Already in a voice channel.');

	},
};
