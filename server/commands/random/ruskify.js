const { SlashCommandBuilder } = require('@discordjs/builders');
const translate = require('@vitalets/google-translate-api');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('ruskify')
		.setDescription('Translates english to our language.')
        .addStringOption(option => option.setName('word').setDescription('Word or sentence to translate.').setRequired(true)),
	async execute(interaction) {
        const stringToTranslate = interaction.options.getString('word');
        translate(stringToTranslate, {from: 'en', to: 'ru'}).then(res => {
            console.log(res);
            interaction.reply(res.text);
        });
	},
};
