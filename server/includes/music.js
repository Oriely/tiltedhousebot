class Queue {
    constructor(client, { connection, player ,voiceChannel, interactionTextChannel }){
        this.songs = [];
        this.currentSong = null;
        this.connection = connection;
        this.player = player;
        this.isPlaying = false;
        this.textChannel = interactionTextChannel;
        this.voiceChannel = voiceChannel;
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

    nowPlaying() {
        return this.currentSong;
    }

    addSong(song) {
        this.songs.push(song)
    }

}

module.exports = { Queue }