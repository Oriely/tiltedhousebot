
const { default: Collection } = require('@discordjs/collection');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const logger = require('../utils/Logger');

class CommandHandler {
    constructor(config) {
        this.token = config.token
        this.clientId = config.clientId;
        this.guildId = config.guildId;
        this.isProduction = config.isProduction;
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

        if(categoryFolders.length === 1) return logger.error('Found no category', '[CommandHandler]');

        logger.log(`Found ${categoryFolders.length} category folders`, '[CommandHandler]');

        for(const folder of categoryFolders) {
            logger.log(`Found category '${folder}'`, '[CommandHandler]')
            this.categories.push(folder);
        }
        return this;
    }

    getCommands() {

        
        for(const category of this.categories) {

            const commandFiles = fs.readdirSync(`${this.commandFolder}/${category}`).filter( file => file.endsWith('.js'));

            for(const command of commandFiles) {
                const _command = require(`${this.commandFolder}/${category}/${command}`)

                logger.log(`Command '${_command.data.name}' added.`, '[CommandHandler]')
                this.commands.set(_command.data.name, _command);
                this.commandArray.push(_command.data.toJSON());
            }
        }

        return this;
    }

    async registerSlashCommands() {

        const rest = new REST({ version: '9' }).setToken(this.token);

        if(!this.isProduction) {
            try {
                logger.log('Started refreshing application (/) commands.', '[CommandHandler]');
    
                await rest.put(
                Routes.applicationGuildCommands(this.clientId, this.guildId),
                { body: this.commandArray },
                );
    
                logger.log('Successfully reloaded application (/) commands.');
            } catch (error) {
                logger.error(error, '[CommandHandler]')
            }
        } else {
            // try {
            //     await rest.put(
            //         Routes.applicationCommands(this.clientId),
            //         { body: commands },
            //     );
            // } catch(error) {
            //     logger.error(error, '[CommandHandler]')
            // }
        }
    }
}

module.exports = CommandHandler