const { Client, Intents, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const ytdl = require('ytdl-core-discord');
const { OpusEncoder } = require('@discordjs/opus');
const fs = require('fs');
const path = require('path');
const db = require('./database/db');
const { Economy } = require('./database/economy');

require('dotenv').config({path: '.env.local'});
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_VOICE_STATES,
	],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});		

client.commands = new Collection();
client.guildQueues = new Map();
client.userData = new Map();

	
const functions = fs.readdirSync('./functions').filter(file => file.endsWith('.js'));
const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const commandFolders = fs.readdirSync('./commands');

(async () => {


	await db.tryconnect()


	for(const file of functions) {
		require(`./functions/${file}`)(client);
	}

	console.log(client.guilds);

	client.handleEvents(events, './events');
	client.handleCommands(commandFolders, './commands');

	const token = process.env.NODE_ENV === "production" ? process.env.TOKEN : process.env.TEST_BOT_TOKEN;
	client.login(process.env.TOKEN);
}

)();
