const { SlashCommandBuilder } = require('@discordjs/builders');
const { } = require('ytdl-core-discord');
const { OpusEncoder } = require('@discordjs/opus');
const { MessageEmbed } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, AudioPlayerStatus, createAudioResource, VoiceConnectionStatus, StreamType} = require('@discordjs/voice');
const {  } = require('yt-search');
const prism = require('prism-media')
let collectorRunning =  false;
const http = require('http');
const ytdl = require('ytdl-core');
const { CONNREFUSED } = require('dns');
const { runInThisContext } = require('vm');
const {Readable} = require('stream');

const stream_1 = __importDefault(require("stream"));
class LimitedReadWriteStream extends stream_1.default.Transform {
    constructor(chunkLimit) {
        super();
        this.chunkAmount = 0;
        this.limit = chunkLimit;
    }
    _transform(chunk, encoding, done) {
        if (!this.limit || this.chunkAmount < this.limit)
            this.push(chunk, encoding);
        if (this.limit && this.chunkAmount >= this.limit)
            this.end();
        this.chunkAmount++;
        done();
    }
}

class Queue {
    constructor({ voiceConnection, player ,voiceChannel, interactionTextChannel }){
        this.songs = [];
        this.currentSong = null;
        this.previousSong = null;
        this.voiceConnection = voiceConnection;
        this.player = createAudioPlayer();
        this.isPlaying = false;
        this.textChannel = interactionTextChannel;
        this.voiceChannel = voiceChannel;
        this.queueLock = false;
        this.volume = 0.1;
        this.voiceConnection.on('stateChange', async (oldState, newState) => {
            if(newState.status === VoiceConnectionStatus.Destroyed) {
                if(newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
                    try {
						await entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
					} catch {
						this.voiceConnection.destroy();
					}
                }
                else if(this.voiceConnection.rejoinAttempts < 5) {
                    await new Promise(res => setTimeout((res) => {res},5000));
                    this.voiceConnection.rejoinAttempts + 1
                    this.voiceConnection.rejoin();
                } else {
                    this.voiceConnection.destroy();
                }
            } else if(newState.status === VoiceConnectionStatus.Destroyed) {
                this.readyLock = true;
				try {
					await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 20_000);
				} catch {
					if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) this.voiceConnection.destroy();
				} finally {
					this.readyLock = false;
				}
            }
        });

        this.player.on('stateChange', (oldState, newState) => {
            if(newState.status === AudioPlayerStatus.Idle  && oldState !== AudioPlayerStatus.Idle) {

                (oldState.resource).metadata.onFinish({
                    url: this.currentSong.url, 
                    thumbnail_url: this.currentSong.thumbnail_url,
                    title: this.currentSong.title
                });
                this.play();
            } else if (newState.status === AudioPlayerStatus.Playing) {
                (newState.resource).metadata.onStart({
                    url: this.currentSong.url, 
                    thumbnail_url: this.currentSong.thumbnail_url,
                    title: this.currentSong.title
                });
            }
        });

        this.player.on('error', (error) => {
            console.log(error)
            (error.resource).metadata.onError(error)
           
        })

        this.voiceConnection.subscribe(this.player);
    }

    shuffle() {
        let array = this.songs;
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
        this.songs = array;
    }

    stop() {
        this.songs = []
        this.player.stop(true);
    }

    nowPlaying() {
        return this.currentSong;
    }

    enqueue(song) {
        console.log('enqueued')
        this.songs.push(song)
        this.play();
    }

    pause() {
        this.player.pause();
    }

    resume() {
        this.player.resume();
    }

    async play() {
        if(this.queueLock || this.player.state.status != AudioPlayerStatus.Idle || this.songs.length === 0) {
            console.log('Somethingsomething')
            return;
        }

        this.queueLock = true;
        this.previousSong = this.currentSong;
        this.currentSong = this.songs.shift();
        
        try {
            const resource = await this.currentSong.createAudioResource();
            this.player.play(resource);
            this.queueLock = false;

        } catch(err) {
            console.log(err)
            this.queueLock = false;
            this.currentSong.onError(err);
            this.play();
            return this.textChannel.send(err);
        }
    }

}

class Track {
    constructor({ url, title, thumbnail_url, timestamp, isYouTube, isSoundCloud, isRadio, onStart, onFinish, onError}) {
        this.url = url;
        this.title = title;
        this.thumbnail_url = thumbnail_url;
        this.isSoundCloud = isSoundCloud;
        this.isYouTube = isYouTube;
        this.isRadio = isRadio;
        this.onError = onError;
        this.onStart = onStart;
        this.onFinish = onFinish;
     }

    async createAudioResource() {
        return new Promise( async (resolve, reject) => {
            if(this.isYouTube) {
                const ytdlstream = ytdl(this.url, {
                    filter: "audioonly",
                    opusEncoded: true,
                    bitrate: 320,
                    quality: "highestaudio",
                    liveBuffer: 40000,
                    highWaterMark: 1 << 25, 
            
                });

                ytdlstream.on('error', (error) => {
                    reject(this.onError(error));
                });
                
                ytdlstream.once('readable', () => {
                    resolve(createAudioResource(ytdlstream, {metadata: this, inlineVolume: true}))
                })
            } else if(this.isSoundCloud) {
                
            } else if(this.isRadio) {
                // let {Readable} = require('stream');

                // let stream = new Readable;

                
                
                
                let FFmpeg = ["-i", this.url, "-analyzeduration", "0", "-loglevel", "0", "-f", "s16le", "-acodec", "libopus", "-f", "opus", "-ar", "48000", "-ac", "2"];
                
                const ffmpeginstance =  new prism.FFmpeg({
                    args: FFmpeg
                });

                return resolve(await createAudioResource(this.url,{metadata: this}))
            }

        })
    }
}

async function createYTTrack(url, methods) {
    try {
        const info = await ytdl.getInfo(url);
                
        const wrappedMethods = {
            onStart(track) {
                wrappedMethods.onStart = () => {};
                methods.onStart(track);
            },
            onFinish(track) {
                wrappedMethods.onFinish = () => {};
                methods.onFinish(track);
            },
            onError(error) {
                wrappedMethods.onError = () => {};
                methods.onError(error);
            },
        };
        const track = new Track({
            url: await info.videoDetails.video_url,
            title:  await info.videoDetails.title,
            thumbnail_url:  await info.videoDetails.thumbnails[0].url,
            timestamp: null,
            isYouTube: true,
            isSoundCloud: false,
            ...wrappedMethods
        });
        return track;
    } catch(err) {
        console.warn(err);

    }

}

async function createSCTrack(url) {
    const info = await ytdl.getInfo(url);
    const track = new Track({
        url: await info.videoDetails.video_url,
        title:  await info.videoDetails.title,
        thumbnail_url:  await info.videoDetails.thumbnails[0].url,
        timestamp: null,
        isSoundCloud: true
    });
    return track;
}


async function createRadioTrack(url, methods) {
    try {
                
        const wrappedMethods = {
            onStart(track) {
                wrappedMethods.onStart = () => {};
                methods.onStart(track);
            },
            onFinish(track) {
                wrappedMethods.onFinish = () => {};
                methods.onFinish(track);
            },
            onError(error) {
                wrappedMethods.onError = () => {};
                methods.onError(error);
            },
        };
        const track = new Track({
            url: url,
            title:  'Radio',
            thumbnail_url:  '',
            timestamp: null,
            isYouTube: false,
            isSoundCloud: false,
            isRadio:true,
            ...wrappedMethods
        });
        return track;
    } catch(err) {
        console.warn(err);

    }

}

module.exports = { Queue, Track, createYTTrack, createRadioTrack }