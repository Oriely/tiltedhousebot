const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, I } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Used to bulk delete messsages in a channel.')
		.addIntegerOption(option => option.setName('number').setDescription('Number of messages to be removed.').setRequired(true)),
	async execute(interaction) {
        if(!interaction.member.permissions.has('ADMINISTRATOR')) return await interaction.reply({content: 'You do not have permission to use this command.', ephemeral: true});
        const numOfMessagesToDelete = interaction.options.getInteger('number');

		await interaction.channel.messages.fetch({ limit: numOfMessagesToDelete }).then(messages => {     
			interaction.reply(`Deleted ${messages.size} messages`);
			interaction.channel.bulkDelete(messages);
		});
	},
};
