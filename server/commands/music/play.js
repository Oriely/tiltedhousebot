const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core-discord');
const { OpusEncoder } = require('@discordjs/opus');
const { MessageEmbed } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, AudioPlayerStatus, createAudioResource, VoiceConnectionStatus} = require('@discordjs/voice');
const yt_search = require('yt-search');

function paginateArray() {

}

async function videoFinder(query) {
    const videoResult =  await yt_search(query);
    return (videoResult.videos.length > 1) ? videoResult.videos.slice(0, 5) : null;
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
    return new Promise((resolve, reject) => {
        (async () => {
            let reYTurl = new RegExp('^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$');
            if(ytdl.validateURL(args) && reYTurl.test(args)) {
                const songInfo = await ytdl.getInfo(args, {downloadURL: true});
                resolve({
                    title: songInfo.videoDetails.title,
                    url: args,
                    thumbnail_url: songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url
                }); 
            } else {
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
                            } else {
                                return false;
                            }
                        });
                    };
                    
                    interaction.reply({embeds:[selectVideoEmbed], code:'js'}, { fetchReply: true })
                        .then(() => {
                            interaction.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
                                .then(collected => {
                                    interaction.followUp(`You selected ${videos[selectedVideo].title}`);
                                    console.log(videos[selectedVideo]);
                                    resolve({
                                        title: videos[selectedVideo].title,
                                        url: videos[selectedVideo].url,
                                        thumbnail_url: videos[selectedVideo].thumbnail,
                                        duration: videos[selectedVideo].duration.timestamp
                                    });
    
                                })
                                .catch(collected => {
                                    interaction.followUp('You didnt selected a video in time, try again.');
                                });
                        });
                 
                } else {
                    interaction.reply('Error finding video');
                    reject(null);
                }
            }
        })()
    });
}


async function songPlayer(client, guildId, song) {
    const serverQueue = client.guildQueues.get(guildId);

    if(!song) {
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

    if(!serverQueue.connection) {
        console.log('No existing connection found, creating one.')
        const connection = await joinVoiceChannel({
            channelId: serverQueue.voiceChannel.id,
            guildId: serverQueue.voiceChannel.guild.id,
            adapterCreator: serverQueue.voiceChannel.guild.voiceAdapterCreator
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('Connection has entered ready state - ready to play audio.');
            const subscrition = serverQueue.connection.subscribe(serverQueue.player);
            serverQueue.player.play(audioresource);

            
        });                                                                                                                     

        serverQueue.connection = connection;
    } else {
        sendSongEmbed(serverQueue.textChannel, 'Now playing:', song.title, song.thumbnail_url);
        serverQueue.player.play(audioresource);
    }

    serverQueue.player.on(AudioPlayerStatus.Idle, () => {
        serverQueue.songs.shift();
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

        let channel = interaction.channel;

		if(!interaction.member.voice.channelId) return await interaction.reply('You have to be in a voice channel to use this command.');

        if(connection) {
            if(connection.joinConfig.channelId != interaction.member.voice.channelId) {
                console.log('not in same channel ');
                return await interaction.reply('You have to be in a voice channel to use this command.');

            }
        }

        let args = interaction.options.getString('song');

        const serverQueue = client.guildQueues.get(interaction.guildId);

        const song = await getSong(interaction, args);

        const songTitle = song.title

        if(!song) return;


        if(!serverQueue) {
            const queueConstructor = {
                connection: null,
                songs: [],
                player: createAudioPlayer(),
                isPlaying: false,
                textChannel: interaction.channel,
                voiceChannel:interaction.member.voice.channel
            }
            client.guildQueues.set(interaction.guildId, queueConstructor);
            queueConstructor.songs.push(song);
            try {
                songPlayer(client, interaction.guildId, queueConstructor.songs[0]);
                sendSongEmbed(queueConstructor.textChannel,'Added song to the queue', song.title, song.thumbnail_url);
            } catch(err) {
                client.guildQueues.delete(interaction.guildId);
                return channel.send('There was an error connecting!');
            }
        } else {
            // push song to queue    
            serverQueue.songs.push(song);
            sendSongEmbed(serverQueue,'Added song to the queue', song.title, song.thumbnail_url);
        }
	}
};
