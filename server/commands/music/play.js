const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core-discord');
const { OpusEncoder } = require('@discordjs/opus');
const { MessageEmbed } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, AudioPlayerStatus, createAudioResource, VoiceConnectionStatus} = require('@discordjs/voice');
const yt_search = require('yt-search');
const { Queue, Track, createYTTrack, createRadioTrack } = require('../../includes/music');
const prism = require('prism-media')
let collectorRunning =  false;
const http = require('http');
const { connect } = require('http2');

async function videoFinder(query) {
    const videoResult =  await yt_search(query);
    return (videoResult.videos.length > 1) ? videoResult.videos.slice(0, 5) : null;
}

const songStateMethods = (interaction)=> {
    return {
        onStart(track) {
            
            console.log(track)
            const embed = new MessageEmbed()
            .setTitle('Now playing')
            .setDescription(track.title)
            .setThumbnail(track.thumbnail_url)
            .setColor('#1B1C31');
    
            interaction.followUp({embeds: [embed]}).catch(console.warn);
        },
        onFinish(track) {
            const embed = new MessageEmbed()
            .setTitle('Now finished')
            .setDescription(track.title)
            .setThumbnail(track.thumbnail_url)
            .setColor('#1B1C31');
            
            interaction.followUp({embeds: [embed]}).catch(console.warn);
        },
        onError(error) {
            console.warn(error);
            interaction.followUp({ content: `Error: ${error}`, ephemeral: true }).catch(console.warn);
        }
    }
}

const tryToMoveChannel = async (interaction, connection) => {
    let botVoiceChannel = await interaction.guild.channels.cache.get(connection.joinConfig.channelId);
    if(botVoiceChannel.id == interaction.member.voice.channel.id) return;
    if(botVoiceChannel.members.size === 1) {
        interaction.guild.me.voice.setChannel(interaction.member.voice.channel.id);
    } else if(botVoiceChannel.members.size > 1) {   
        interaction.followUp('Someone is using me in another channel.');
    }
    
}

async function sendSongEmbed( textChannel,title, desc, thumb ) {

}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('player')
		.setDescription('Used to play music.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('connect')
                .setDescription('Used to connect bot to channel you are in'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('yt')
                .setDescription('YouTube link to play')
                .addStringOption(option => option.setName('yturl').setDescription('YouTube video url.').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search youtube for songs.')
                .addStringOption(option => option.setName('query').setDescription('What you want to search for').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('radio')
                .setDescription('Play radio.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('queue')
                .setDescription('Lists the songs in the queue'))
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('shuffle')
                .setDescription('Shuffles the queue.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('skip')
                .setDescription('Skip the current track.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stops the music player'))

        .addSubcommand(subcommand =>
            subcommand
                .setName('nowplaying')
                .setDescription('Sends current song being played.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('pause')
                .setDescription('Pause the music player.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('resume')
                .setDescription('Resume the music player.'))
        ,
	async execute(interaction, client) {
        console.log(this.data);
        if(!voiceChannel) return interaction.reply('You have to be in a voice channel to use this command.');

        let connection = getVoiceConnection(interaction.guildId);
        let interactionChannel = interaction.channel;
        let channel = interaction.channel;
        let voiceChannel = interaction.member.voice.channel;
        const serverQueue = client.guildQueues.get(interaction.guildId);
        const { afkChannelId }= await interaction.guild.channels.guild;

        if(interaction.options.getSubcommand() === 'connect') {
            
            if(interaction.member.voice.channelId == afkChannelId) return  interaction.reply('You cant be in the afk channel.');
            
            if(!connection) {
                try {
                    connection = await joinVoiceChannel({
                        channelId: interaction.member.voice.channel.id,
                        guildId: interaction.channel.guild.id,
                        adapterCreator: interaction.channel.guild.voiceAdapterCreator,
                    });
                    interaction.reply('Connected to your channel.');
                } catch (err) {
                    console.warn(err);
                    interaction.reply('Something went wrong when trying to connect.')
                }
            } else tryToMoveChannel(interaction, connection, serverQueue) 

        }
        
        if(interaction.options.getSubcommand() === 'yt') {
            
            await interaction.deferReply();
            if(interaction.member.voice.channelId == afkChannelId) return  interaction.reply('You cant be in the afk channel.');
            
            if(!connection) {
                try {
                    connection = await joinVoiceChannel({
                        channelId: interaction.member.voice.channel.id,
                        guildId: interaction.channel.guild.id,
                        adapterCreator: interaction.channel.guild.voiceAdapterCreator,
                    });
                    interaction.followUp('Connected to your channel.');
                } catch (err) {
                    console.warn(err);
                    interaction.followUp('Something went wrong when trying to connect.')
                }
            } else tryToMoveChannel(interaction, connection, serverQueue);
            let url = interaction.options.getString('yturl');
            
            if(!ytdl.validateURL(url) && url.matches(/^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/)) return interaction.reply('Not a valid youtube link.')
            
            if(!serverQueue) {
                const queue = new Queue({
                    voiceConnection: connection,
                    voiceChannel: voiceChannel,
                    interactionTextChannel: interactionChannel,
                });
                client.guildQueues.set(interaction.guildId, queue);
                try {
                    const track = await createYTTrack(url, songStateMethods(interaction));
                    
                    queue.enqueue(track);
                    const embed = new MessageEmbed()
                        .setTitle('Added song to the queue')
                        .setDescription(track.title)
                        .setThumbnail(track.thumbnail_url)
                        .setColor('#1B1C31');
                    
                    return interaction.followUp({embeds: [embed]});
                    
                } catch(err) {
                    console.warn(err);
                    client.guildQueues.delete(interaction.guildId);
                    return interaction.followUp('There was an error connecting!');
                }
            } else {
                console.log('add song to queue')
                // push song to queue    
                const track = await createYTTrack(url, songStateMethods(interaction));
                serverQueue.enqueue(track);
                const embed = new MessageEmbed()
                    .setTitle('Added song to the queue')
                    .setDescription(track.title)
                    .setThumbnail(track.thumbnail_url)
                    .setColor('#1B1C31');
                
                return interaction.followUp({embeds: [embed]});
            }
        }


        if(interaction.options.getSubcommand() === 'search') {
            if(interaction.member.voice.channelId == afkChannelId) return  interaction.reply('You cant be in the afk channel.');

            if(!connection) {
                try {
                    connection = await joinVoiceChannel({
                        channelId: interaction.member.voice.channel.id,
                        guildId: interaction.channel.guild.id,
                        adapterCreator: interaction.channel.guild.voiceAdapterCreator,
                    });
                    interaction.followUp('Connected to your channel.');
                } catch (err) {
                    console.warn(err);
                    interaction.followUp('Something went wrong when trying to connect.')
                }
            } else tryToMoveChannel(interaction, connection, serverQueue) 
            
            if(connection.joinConfig.channelId != voiceChannel.id) return interaction.reply('You have to be in the same channel as me.');

            const searchQuery = interaction.options.getString('query');

            const videos = await videoFinder(searchQuery);

            if(!videos) return interaction.followUp('Could find any videos.');
                let videoFields = '';
                for(let x = 0; x < videos.length; x++ ) {
                    videoFields += `${x + 1}. ${videos[x].title}\n`;
                }

                const selectVideoEmbed = new MessageEmbed()
                .setTitle('Select video to play')
                .setDescription(videoFields)
                .setColor('#1B1C31');

                let selectedVideo = null;
                const filter = response => videos.some((video, index) => {
                    if(parseInt(response.content) === index && response.member.id == interaction.member.id) {
                        console.log(response.member.id, interaction.member.id);
                        selectedVideo = index;
                        return true;
                    }
                });


                // TODO fix bug where you are able to use play command again before collector is finished
                client.userStates.get(interaction.user.id).isCollecting = true;
                interaction.reply({embeds:[selectVideoEmbed], code:'js'}, { fetchReply: true }).then(() => {
                    interaction.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
                        .then(async collected => {
                            if(!serverQueue) {

                                const queue = new Queue({
                                    voiceConnection: connection,
                                    voiceChannel: voiceChannel,
                                    interactionTextChannel: interactionChannel,
                                });
                                client.guildQueues.set(interaction.guildId, queue);
                                
                                try {
                                    
                                    const track = await createYTTrack(videos[selectedVideo].url, songStateMethods(interaction));
                                    queue.enqueue(track);
                                    
                                    // songPlayer(client, interaction.guildId, queue.songs[0]);ø.
                                    const embed = new MessageEmbed()
                                    
                                    .setTitle('Added song to the queue')
                                    .setDescription(track.title)
                                    .setThumbnail(track.thumbnail_url)
                                    .setColor('#1B1C31');
                                    
                                    return interaction.followUp({embeds: [embed]});
                                    
                                    
                                } catch(err) {
                                    console.log(err)
                                    client.guildQueues.delete(interaction.guildId);
                                    return interaction.followUp('There was an error connecting!');
                                }
                                
                        } else {
                            // push song to queue    
                            const track = await createYTTrack(url, songStateMethods(interaction));
                            queue.enqueue(track);
                            
                            
                            const embed = new MessageEmbed()
                            
                            .setTitle('Added song to the queue')
                            .setDescription(track.title)
                            .setThumbnail(track.thumbnail_url)
                            .setColor('#1B1C31');
                            
                            interaction.followUp({embeds: [embed]});
                            
                        }
                            
                        interaction.followUp(`You selected ${videos[selectedVideo].title}`);
                        client.userStates.get(interaction.user.id).isCollecting = false;
                        
                    })
                    .catch(collected => {
                        client.userStates.get(interaction.user.id).isCollecting = false;
                        interaction.followUp('You didnt selected a video in time, try again.');
                    });
                });
            
        }

        if(interaction.options.getSubcommand() === 'skip') {
            if(connection.joinConfig.channelId != voiceChannel.id) return interaction.reply('You have to be in the same channel as me.');
            if(!serverQueue) return await interaction.reply('Bot is not playing music.');
            
            
            console.log('skip')
            serverQueue.player.stop();
            await interaction.reply('Skipped song!');
        }


        if(interaction.options.getSubcommand() === 'nowplaying') {
            
            if(!serverQueue) return await interaction.reply('Bot is not playing music.');

            const currentSong = serverQueue.nowPlaying();
    
            const embed = new MessageEmbed()
    
            .setTitle('Now playing')
            .setDescription(currentSong.title)
            .setThumbnail(currentSong.thumbnail_url)
            .setColor('#1B1C31');
            return interaction.reply({embeds: [embed]});
        }


        if(interaction.options.getSubcommand() === 'queue') {
            if(!serverQueue) return await interaction.reply('Bot is not playing music.');
            console.log('queue')
            const queueEmbed = new MessageEmbed()
            .setTitle('Song queue:');
    
            let queueList = 'Songs in queue:\n';
            serverQueue.songs.forEach((song, index) => {
                queueList += `${song.title}\n`;
            });
            return interaction.reply(queueList);
        }


        if(interaction.options.getSubcommand() === 'shuffle') {
            if(!serverQueue) return await interaction.reply('Bot is not playing music.');
            console.log('shuffle')
            if(serverQueue.songs === 1) return await interaction.reply(`There's only 1 song in the queue.`)
            serverQueue.shuffle();
            return interaction.reply('Shuffled queue');
            
        }



        if(interaction.options.getSubcommand() === 'radio') {
            await interaction.deferReply();
            if(!voiceChannel) return interaction.reply('You have to be in a voice channel to use this command.');
            if(interaction.member.voice.channelId == afkChannelId) return  interaction.reply('You cant be in the afk channel.');

            if(!connection) {
                try {
                    connection = await joinVoiceChannel({
                        channelId: interaction.member.voice.channel.id,
                        guildId: interaction.channel.guild.id,
                        adapterCreator: interaction.channel.guild.voiceAdapterCreator,
                    });
                    interaction.followUp('Connected to your channel.');
                } catch (err) {
                    console.warn(err);
                    interaction.followUp('Something went wrong when trying to connect.')
                }
            } else tryToMoveChannel(interaction, connection, serverQueue) 


                if(!serverQueue) {
                    const queue = new Queue({
                        voiceConnection: connection,
                        voiceChannel: voiceChannel,
                        interactionTextChannel: interactionChannel,
                    });
                    client.guildQueues.set(interaction.guildId, queue);
                    try {
                        
                        const track = await createRadioTrack('https://lyd.nrk.no/nrk_radio_alltid_nyheter_aac_h', songStateMethods(interaction)); 
                        queue.enqueue(track);
                        
                        // songPlayer(client, interaction.guildId, queue.songs[0]);ø.
                        const embed = new MessageEmbed()

                        .setTitle('Added song to the queue')
                        .setDescription(track.title)
                        .setThumbnail(track.thumbnail_url)
                        .setColor('#1B1C31');
                        
                        return interaction.followUp({embeds: [embed]});
                        

                    } catch(err) {
                        console.log(err)
                        client.guildQueues.delete(interaction.guildId);
                        return interaction.followUp('There was an error connecting!');
                    }
                    
            } else {
                // push song to queue    
                const track = await createRadioTrack('https://listen.moe/opus', songStateMethods(interaction)); 

                serverQueue.enqueue(track);
                
                // songPlayer(client, interaction.guildId, queue.songs[0]);ø.
                const embed = new MessageEmbed()

                .setTitle('Added song to the queue')
                .setDescription(track.title)
                .setThumbnail(track.thumbnail_url)
                .setColor('#1B1C31');
                
                return interaction.followUp({embeds: [embed]});
                
            }

        }

        if(interaction.options.getSubcommand() === 'nowplaying') {
            if(!serverQueue) return await interaction.reply('Bot is not playing music.');

            const currentSong = serverQueue.nowPlaying();
    
            const embed = new MessageEmbed()
    
            .setTitle('Now playing')
            .setDescription(currentSong.title)
            .setThumbnail(currentSong.thumbnail_url)

            .setColor('#1B1C31');
            return interaction.reply({embeds: [embed]});
        }

        if(interaction.options.getSubcommand() === 'pause') {
            if(!serverQueue) return await interaction.reply('Bot is not playing music.');

            serverQueue.pause();
            return interaction.reply('Paused the music playback');
        }

        if(interaction.options.getSubcommand() === 'resume') {
            if(!serverQueue) return await interaction.reply('Bot is not playing music.');

            serverQueue.resume();
            return interaction.reply('Resumed the music playback');
        }
    }
}