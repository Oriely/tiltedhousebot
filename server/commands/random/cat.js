const { SlashCommandBuilder } = require('@discordjs/builders');
const { Discord, MessageAttachment} = require('discord.js');
const fetch = require('node-fetch');
const request = require('request')
const fs = require('fs')

async function download(url, path, callback) {
	return new Promise((resolve, reject) => {
		const req = request.head(url, (err, res, body) => {
			request(url)
			.pipe(fs.createWriteStream(path))
			.on('close', () => {
				resolve(fs.readFileSync(path));
			})
		})
		req.on('error', (error) => {
			reject()
			throw error;
		})
	})
}
module.exports = {
	data: new SlashCommandBuilder()
		.setName('cat')
		.setDescription('Random cat.'),
	async execute(interaction) {
		download('https://cataas.com/cat', 'tmp/images/cat.jpg')
		.then(image => {
			const catAttachment = await new MessageAttachment().setFile(image);
			interaction.reply({files: [catAttachment]});
		});
	},
};
