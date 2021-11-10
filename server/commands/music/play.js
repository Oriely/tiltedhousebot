const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core-discord');
const { OpusEncoder } = require('@discordjs/opus');
const { MessageEmbed } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, AudioPlayerStatus, createAudioResource, VoiceConnectionStatus} = require('@discordjs/voice');
const yt_search = require('yt-search');
const { Queue } = require('../../includes/music');

let collectorRunning =  false;

async function videoFinder(query) {
    const videoResult =  await yt_search(query);
    return (videoResult.videos.length > 1) ? videoResult.videos.slice(0, 5) : null;
}

class YouTube {
    constructor() {
        
    }
}

async function sendSongEmbed( textChannel,title, desc, thumb ) {
    const embed = new MessageEmbed()
    .setTitle(title)
    .setDescription(desc)
    .setThumbnail(thumb)
    .setColor('#1B1C31');

    await textChannel.send({embeds: [embed]});
}

async function getSong(interaction, args) {
    return new Promise(async (resolve, reject) => {

            let reYTurl = new RegExp('^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$');

            if(ytdl.validateURL(args) && reYTurl.test(args)) {
                const songInfo = await ytdl.getInfo(args, {downloadURL: true});
                resolve({
                    title: songInfo.videoDetails.title,
                    url: args,  
                    thumbnail_url: songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url
                }); 
            }
            const videos = await videoFinder(args);

            if(videos) {
                let videoFields = '';
                for(let x = 0; x < videos.length; x++ ) {
                    videoFields += `${x + 1}. ${videos[x].title}\n`;
                }

                const selectVideoEmbed = new MessageEmbed()
                .setTitle('Select video to play')
                .setDescription(videoFields)
                .setColor('#1B1C31');


                let selectedVideo = null;
                const filter = response => {
                    return videos.some((video, index) => {
                        if(index == parseInt(response.content) -1){
                            selectedVideo = index;
                            return true;
                        }   
                        return false;
                    });
                };


                // TODO fix bug where you are able to use play command again before collector is finished
                if(collectorRunning) return;
                interaction.reply({embeds:[selectVideoEmbed], code:'js'}, { fetchReply: true })
                    .then(() => {
                        
                        interaction.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
                            .then(collected => {
                                const songData = {
                                    title: videos[selectedVideo].title,
                                    url: videos[selectedVideo].url,
                                    thumbnail_url: videos[selectedVideo].thumbnail,
                                    duration: videos[selectedVideo].duration.timestamp
                                }

                                interaction.followUp(`You selected ${videos[selectedVideo].title}`);
                                resolve(songData);

                            })
                            .catch(collected => {
                                collectorRunning = false;
                                interaction.followUp('You didnt selected a video in time, try again.');
                            });
                    });
            
            } else {
                reject(null);
            }
    });
}


async function songPlayer(client, guildId, song) {
    const serverQueue = client.guildQueues.get(guildId);

    if(!song) {
        console.log(serverQueue);
        serverQueue.connection.destroy();
        serverQueue.textChannel.send('No more songs to play. Leaving channel.');
        client.guildQueues.delete(guildId);
        return;
    }

    const ytdlstream = await ytdl(song.url, {
        filter: "audioonly",
        opusEncoded: true,
        bitrate: 320,
        quality: "highestaudio",
        liveBuffer: 40000,
        highWaterMark: 1 << 25, 

    });

    let audioresource = createAudioResource(ytdlstream, {inlineVolume: true});

    audioresource.volume.setVolume(0.1);
    
    serverQueue.connection.subscribe(serverQueue.player);

    serverQueue.currentSong = song;

    serverQueue.songs.shift();

    serverQueue.player.play(audioresource);

    sendSongEmbed(serverQueue.textChannel, 'Now playing:', song.title, song.thumbnail_url);

    serverQueue.player.once(AudioPlayerStatus.Idle, () => {
        songPlayer(client, guildId,serverQueue.songs[0]);
    }); 
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play a song.')
        .addStringOption(option => option.setName('song').setDescription('Type in a youtube url').setRequired(true)),
	async execute(interaction, client) {
        let connection = await getVoiceConnection(interaction.guildId);
        let interactionChannel = interaction.channel;
        let channel = interaction.channel;
        let voiceChannel = interaction.member.voice.channel;

        if(!client.userData.has(interaction.user.id)) {
            client.userData.set(interaction.user.id, {
                isSelectingVideo: false
            })
        }

		if(!voiceChannel) return await interaction.reply('You have to be in a voice channel to use this command.');

        if(connection) {
            if(connection.joinConfig.channelId != interaction.member.voice.channelId) {
                return await interaction.reply('You have to be in a voice channel to use this command.');
            }
        } else {
            connection = await joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator
            });
        }

        const serverQueue = client.guildQueues.get(interaction.guildId);
        const song = await getSong(interaction, interaction.options.getString('song'));
        if(!song) return;


        if(!serverQueue) {

            const queue = new Queue(client, {
                connection: connection,
                player: createAudioPlayer(),
                voiceChannel: voiceChannel,
                interactionTextChannel: interactionChannel,
            });

            queue.addSong(song);
            client.guildQueues.set(interaction.guildId, queue);
            
            try {
                songPlayer(client, interaction.guildId, queue.songs[0]);
                sendSongEmbed(queue.textChannel,'Added song to the queue', song.title, song.thumbnail_url);
            } catch(err) {
                client.guildQueues.delete(interaction.guildId);
                return channel.send('There was an error connecting!');
            }

        } else {

            // push song to queue    

            serverQueue.addSong(song);

            sendSongEmbed(serverQueue.textChannel,'Added song to the queue', song.title, song.thumbnail_url);
        }
	}
};
