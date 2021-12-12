require('dotenv').config({path: '.env.local'});
const config = require('./config');
const { Client, Intents, Collection } = require('discord.js');
const express = require('express');
const app_api = express();
const CommandHandler = require('./functions/commandHandler');
const EventHandler  = require('./functions/eventHandler');
const db = require('./database/db');
const TiltedBotClient = require('./includes/TiltedBot');

const client = new TiltedBotClient({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_VOICE_STATES,
	],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.logger = require('./utils/Logger');
client.commandHandler = new CommandHandler({
	token: config.token,
	guildId: config.guildId,
	clientId: config.clientId
});
client.eventHandler = new EventHandler();
client.guildQueues = new Map();
client.userData = new Map();
client.userStates = new Map();
client.dbCache = {
	guilds: new Collection(),
	users: new Collection()
};

(async () => {

	client.isReady = false;

	await db.connect();

	client.db = db.getPool();

	client.commandHandler
	.setCommandsFolder(__dirname+'/commands')
	.getCategories()
	.getCommands()
	.registerSlashCommands();

	client.eventHandler
	.setEventsFolder(__dirname+'/events')
	.getEventTypes()
	.getEvents();

	client.eventHandler
	.handle(client);

	app_api.listen(process.env.PORT, () => {
		client.logger.log('API Listening on port ' + process.env.PORT)
	});

	client.login(config.token);

})();