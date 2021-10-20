
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('test'),
	async execute(interaction) {
        let quiz = [
            {
                "question": "What color is the sky?",
                "answers": ["blue"]
            },
            {
                "question": "How many letters are there in the alphabet?",
                "answers": ["26", "twenty-six", "twenty six", "twentysix"]
            }
        ]
        
        const item = quiz[Math.floor(Math.random() * quiz.length)];
        const filter = response => {
            return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
        };
        
        interaction.reply(item.question, { fetchReply: true })
            .then(() => {
                interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                    .then(collected => {
                        interaction.followUp(`${collected.first().author} got the correct answer!`);
                    })
                    .catch(collected => {
                        interaction.followUp('Looks like nobody got the answer this time.');
                    });
            });
        
	},
};


