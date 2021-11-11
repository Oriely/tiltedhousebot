
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');


module.exports = (client) => {

    client.handleCommands = async (commandFolders, path) => {

        client.commandArray = [];
        
        for(const folder of commandFolders) {


            const commandFiles = fs.readdirSync(`${path}/${folder}`).filter( file => file.endsWith('.js'));
            if(commandFiles.length > 0) {
                console.log('\x1b[36m%s\x1b[0m',`Found folder ${folder}, loading commands...`)
            } else {
                console.log(`Found empty folder ${folder}`)
            }


            for (const file of commandFiles) {
                const command = require(`../${path}/${folder}/${file}`);
                
                if(!command.data) {
                    console.error("\x1b[41m",`Missing command data in command file: ${file}`)
                } else {
                    console.log('- ', command.data.name + ` loaded.`)
                    client.commands.set(command.data.name, command);
                    client.commandArray.push(command.data.toJSON());
                }


            }

        }

        const token = process.env.NODE_ENV == "production" ? process.env.TOKEN : process.env.TEST_BOT_TOKEN;
        const guildId = process.env.NODE_ENV == "production" ? process.env.TOKEN : process.env.TEST_BOT_TOKEN;
        const clientId = process.env.NODE_ENV == "production" ? process.env.CLIENT_ID : process.env.TEST_BOT_CLIENT_ID;

        const rest = new REST({ version: '9' }).setToken(token);
        
        (async () => {
            try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
            Routes.applicationGuildCommands(clientId, process.env.GUILD_ID),
            { body: client.commandArray },
            );

            console.log('Successfully reloaded application (/) commands.');
            } catch (error) {
            console.error(error);
            }
        })();

    }


}