const { Client, Intents, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const ytdl = require('ytdl-core-discord');
const { OpusEncoder } = require('@discordjs/opus');
const fs = require('fs');
const path = require('path');
const pg = require('pg');

require('dotenv').config();

let dbConnectionRetries = 5;

// while(dbConnectionRetries > 0) {
// 	try {
// 	} catch (err) {

// 		dbConnectionRetries -= 1;
// 		console.log(err, `${dbConnectionRetries} retries left. Trying again.`);
// 		await new Promise(res => setTimeout(res, 5000));
// 	}
// }

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
	
const functions = fs.readdirSync('./functions').filter(file => file.endsWith('.js'));
const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const commandFolders = fs.readdirSync('./commands');

(async () => {

	for(const file of functions) {
		require(`./functions/${file}`)(client);
	}

	client.handleEvents(events, './events');
	client.handleCommands(commandFolders, './commands');
	client.login(process.env.TOKEN);
}

)();
