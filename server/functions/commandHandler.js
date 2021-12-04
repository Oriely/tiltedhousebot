
const { default: Collection } = require('@discordjs/collection');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { resolve } = require('path');
const path = require('path');
const logger = require('../utils/Logger');


// (client) => {

//     client.handleCommands = async (commandFolders, path) => {

//         client.commandArray = [];
        
//         for(const folder of commandFolders) {
//             const commandFiles = fs.readdirSync(`${path}/${folder}`).filter( file => file.endsWith('.js'));
//             if(commandFiles.length > 0) {
//                 console.log('\x1b[36m%s\x1b[0m',`Found folder ${folder}, loading commands...`)
//             } else {
//                 logger.info(`Found empty folder ${folder}`);
//             }


//             for (const file of commandFiles) {
//                 const command = require(`../${path}/${folder}/${file}`);
                
//                 if(!command.data) {
//                     console.error("\x1b[41m",`Missing command data in command file: ${file}`)
//                 } else {
//                     console.log('- ', command.data.name + ` loaded.`)
//                     client.commands.set(command.data.name, command);
//                     client.commandArray.push(command.data.toJSON());
//                 }


//             }

//         }

//         const token = process.env.NODE_ENV == "production" ? process.env.TOKEN : process.env.TEST_BOT_TOKEN;
//         const guildId = process.env.NODE_ENV == "production" ? process.env.TOKEN : process.env.TEST_BOT_TOKEN;
//         const clientId = process.env.NODE_ENV == "production" ? process.env.CLIENT_ID : process.env.TEST_BOT_CLIENT_ID;

//         const rest = new REST({ version: '9' }).setToken(token);
        
//         (async () => {
//             try {
//             console.log('Started refreshing application (/) commands.');

//             await rest.put(
//             Routes.applicationGuildCommands(clientId, process.env.GUILD_ID),
//             { body: client.commandArray },
//             );

//             console.log('Successfully reloaded application (/) commands.');
//             } catch (error) {
//                 console.error(error);
//             }
//         })();

//     }


// }

class CommandHandler {
    constructor(token) {
        this.commandFolder = null; 
        this.categories = [];
        this.commands = new Collection();
        this.commandArray = [];
    };

    setCommandsFolder(path) {
        if(!path) throw new Error('test');
        this.commandFolder = path;
        return this;
    }
    
    getCategories() {
        const categoryFolders = fs.readdirSync(this.commandFolder);

        if(categoryFolders.length === 1) return logger.error('Found no category');

        logger.log(`Found ${categoryFolders.length} category folders`);

        for(const folder of categoryFolders) {
            logger.log(`Found category '${folder}'`)
            this.categories.push(folder);
        }
        return this;
    }

    getCommands() {

        
        for(const category of this.categories) {

            const commandFiles = fs.readdirSync(`${this.commandFolder}/${category}`).filter( file => file.endsWith('.js'));

            for(const command of commandFiles) {
                const _command = require(`${this.commandFolder}/${category}/${command}`)

                logger.log(`Command '${_command.data.name}' added.`)
                this.commands.set(_command.data.name, _command);
                this.commandArray.push(_command.data.toJSON());
            }
        }

        return this;
    }

    async registerSlashCommands({ token, guildId, clientId }) {

        const rest = new REST({ version: '9' }).setToken(token);

        try {
            logger.log('Started refreshing application (/) commands.');

            await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: this.commandArray },
            );

            logger.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            logger.error(error)
        }
        return this;
    }

    async registerGlobalSlashCommands() {
        try {
            await rest.put(
                Routes.applicationCommands(this.clientId),
                { body: commands },
            );
        } catch(error) {
            logger.error(error)
        }
        return this;
    }
}

module.exports = CommandHandler