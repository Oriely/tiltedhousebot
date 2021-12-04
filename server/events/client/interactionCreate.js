const path = require('path');
const logger = require("../../utils/Logger");

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client) {
		logger.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
        if (!interaction.isCommand()) return;
        if(!client.userStates.get(interaction.user.id)) {
            client.userStates.set(interaction.user.id, {
                isCollecting: false
            })
        }

        if(client.userStates.get(interaction.user.id).isCollecting) return;
        const command = client.commandHandler.commands.get(interaction.commandName);
        if (!command) return;
    
        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.log(error)
            logger.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
	},
};
