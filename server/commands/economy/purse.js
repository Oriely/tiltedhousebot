const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const fs = require('fs');
const economy = require('../../database/economy');
module.exports = {
    data: new SlashCommandBuilder()
    .setName('purse')
    .setDescription('Check your balance.'),
    async execute(interaction, client) {
    const messageAuthor = interaction.user.id;

    const userData = client.dbCache.users.get(messageAuthor);

    const purseImage = fs.readFileSync('./assets/images/economy/purse.png');
    const attachment = new MessageAttachment(purseImage, 'purse.png');

    console.log(userData)
    const embed = new MessageEmbed()
    .setTitle(`Your purse`)
    .setDescription(`Current balance: ${userData.data.economy.balance}`)
    .setThumbnail(`attachment://purse.png`);

    interaction.reply({embeds: [embed], files:[attachment]});
},
};
