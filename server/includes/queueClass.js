class Queue {
    constructor(client){
        this.songs = [];
        this.currentSong = null;
    }

    shuffle() {
        var m = array.length, t, i;
        // While there remain elements to shuffle…
        while (m) {
            console.log(m)
          // Pick a remaining element…
          i = Math.floor(Math.random() * m--);
      
          // And swap it with the current element.
          t = array[m];
          array[m] = array[i];
          array[i] = t;
        }
      
        return array;
    }

    nowPlaying() {
        const embed = new MessageEmbed()
        .setTitle(title)
        .setDescription(desc)
        .setThumbnail(thumb)
        .setColor('#1B1C31');
    
        await textChannel.send({embeds: [embed]});
    }

    getSong() {
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

    playSong() {
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
}