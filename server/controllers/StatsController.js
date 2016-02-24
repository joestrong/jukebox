"use strict";
let fs = require('fs');

class StatsController
{

    constructor()
    {
        this.songs = {};
        this.load();
    }

    songPlay(song)
    {
        this.initSong(song);
        this.songs[song.id].plays += 1;
        this.save();
    }

    initSong(song)
    {
        if (!this.songs[song.id]) {
            this.songs[song.id] = {
                plays: 0
            };
        }
    }

    load()
    {
        fs.readFile('./stats.json', (err, data) => {
            if (err) {
                console.log("Couldn't load stats: " + err.message)
                return;
            }
            let loaded = JSON.parse(data);
            this.songs = loaded.songs;
            console.log('Loaded stats');
        });
    }

    save()
    {
        let toSave = { songs: this.songs };
        fs.writeFile('./stats.json', JSON.stringify(toSave), (err) => {
            if (err) {
                console.log("Couldn't save stats: " + err.message);
                return;
            }
            console.log('Saved stats');
        });
    }

    getMostPlayed()
    {
        var songArray = [];
        for (var id in this.songs) {
            if (this.songs.hasOwnProperty(id)) {
                var song = this.songs[id];
                songArray.push({
                    id: id,
                    plays: song.plays
                });
            }
        }
        songArray = songArray.sort((a, b) => {
            return b.plays - a.plays;
        });
        return songArray.slice(0, 25);
    }
}

module.exports = StatsController;
