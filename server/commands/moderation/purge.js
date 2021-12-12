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
			interaction.channel.bulkDelete(messages)
			.then((test) => {
				interaction.reply({content: `Deleted ${messages.size} messages`, ephemeral: true})
			}).catch(err => {
				console.log(err)
				interaction.reply(`Something went wrong trying to delete the message${messages.size > 1 ? 's' : ''}`);
			});
		})
	},
};
