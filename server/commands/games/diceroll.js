const { SlashCommandBuilder } = require('@discordjs/builders');
const { Discord, MessageAttachment,  MessageEmbed} = require('discord.js');
const fs = require('fs');
const { resolve } = require('path');
const economy = require('../../database/economy');
const diceImagesDir = fs.readdirSync('./assets/images/dice');
const diceEmbeds = [];

diceImagesDir.forEach((file) => {
    const image = fs.readFileSync('./assets/images/dice/' + file);
    diceEmbeds.push({
        dice: file.substr(0, file.lastIndexOf('.')),
        attachment: new MessageAttachment(image, `${file}`)
    });
});


module.exports = {
	data: new SlashCommandBuilder()
		.setName('diceroll')
		.setDescription('Bet some of your currency and win big. ')
        .addNumberOption(option => option.setName('bet').setDescription('Amount to bet').setRequired(true))
        .addIntegerOption(option => option.setName('diceroll').setDescription('What dice roll you are betting on 1-6.').setRequired(true)),
	async execute(interaction, client) {
        const messageAuthor = interaction.user.id;
        const bet = interaction.options.getNumber('bet');
        const selectedDiceRoll = interaction.options.getInteger('diceroll');
        if(selectedDiceRoll > 6 || selectedDiceRoll < 1) return interaction.reply('You have to pick a number between 1 and 6');

        let currentBalance = await economy.balance(messageAuthor);
        if(currentBalance - bet < 0) return interaction.reply(`You do not have balance to bet ${bet}, missing ${Math.abs(currentBalance - bet)}`)
        
        await economy.subtract(messageAuthor, bet);

        currentBalance = await economy.balance(messageAuthor);
        const roll = Math.round(Math.random() * 5) + 1;
        const diceEmbed = diceEmbeds[roll - 1].attachment;

        interaction.reply('You bet ' + bet + ' on '+ selectedDiceRoll + '. Rolling....')
        if(selectedDiceRoll == roll) {
            const embed = new MessageEmbed()
            .setTitle(`You bet on ${selectedDiceRoll} and won ${bet * 6}!`)
            .setDescription(`Current balance: ${currentBalance}`)
            .setThumbnail(`attachment://${roll}.png`);

            await economy.add(messageAuthor, bet * 6);

            return interaction.channel.send({ embeds: [embed], files:[diceEmbed]});
        } else {
            const embed = new MessageEmbed()
            .setTitle(`You bet ${bet} on ${selectedDiceRoll} and lost.`)
            .setDescription(`Current balance: ${currentBalance}`)
            .setThumbnail(`attachment://${roll}.png`);

            return interaction.channel.send({ embeds: [embed], files:[diceEmbed]});
        }
  
    },
};
