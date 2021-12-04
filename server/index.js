const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const express = require('express');
const app_api = express();
const CommandHandler = require('./functions/commandHandler');
const EventHandler  = require('./functions/eventHandler');
const logger = require('./utils/Logger');
require('dotenv').config({path: '.env.local'});

const token = process.env.NODE_ENV == "production" ? process.env.TOKEN : process.env.TEST_BOT_TOKEN;
const guildId = process.env.GUILD_ID
const clientId = process.env.NODE_ENV == "production" ? process.env.CLIENT_ID : process.env.TEST_BOT_CLIENT_ID;

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
client.commandHandler = new CommandHandler();
client.eventHandler = new EventHandler();
client.guildQueues = new Map();
client.userData = new Map();
client.userStates = new Map();


const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'));


(async () => {

	client.commandHandler
	.setCommandsFolder(__dirname+'/commands')
	.getCategories()
	.getCommands();

	client.commandHandler
	.registerSlashCommands({
		token: token,
		guildId: guildId,
		clientId: clientId
	});

	client.eventHandler
	.setEventsFolder(__dirname+'/events')
	.getEventTypes()
	.getEvents();

	client.eventHandler
	.handle(client);


	app_api.listen(process.env.PORT, () => {
		logger.log('API Listening on port ' + process.env.PORT)
	});

	client.login(token);
})();
