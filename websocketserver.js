var io = require('socket.io')(3000);
var fs  = require("fs");
var process = require('child_process');

var playerState = 'stopped';

var songCacheFile = 'songcache.json';
var songQueueFile = 'songqueue.json';
var songCache = {};
var songQueue = [];

fs.readFile(songCacheFile, function(err, f) {
    var songCacheJson = f.toString();
    songCache = JSON.parse(songCacheJson);
});

fs.readFile(songQueueFile, function(err, f) {
    var songQueueJson = f.toString();
    songQueue = JSON.parse(songQueueJson);
});

if(songQueue.length > 0) {
    playQueue();
}

function control(action) {
    process.exec('./control.sh '+action);
}

function commitCache() {
    fs.writeFile(songCacheFile, JSON.stringify(songCache));
}

function commitQueue() {
    fs.writeFile(songQueueFile, JSON.stringify(songQueue));
}

function playQueue() {

    // Check there are some queued songs and that we aren't already playing
    if(songQueue.length === 0 || playerState === 'playing') {
        return;
    }

    // Get the song to play
    var songID = songQueue.slice(0,1);

    playerState = 'playing';
    console.log(songID+': Playing');

    // Run the player
    process.exec('./play.sh "'+songCache[songID]['URL']+'"', function (error, stdout, stderr) {

        if (error !== null) {
            console.error(songID+': Failed to play!');
            return;
        }

        console.log(songID+': Finished!');

        // Remove from queue
        songQueue.shift();
        commitQueue();

        playerState = 'stopped';

        // Keep playing
        if (songQueue.length > 0) {
            playQueue();
        }
    });
}

function queueSong(song) {

    console.log(song.id+': Adding to the queue');

    songQueue.push(song.id);
    commitQueue();

    io.emit('newsong', song);

    if (playerState === 'stopped') {
        playQueue(song);
    }
}

io.on('connection', function(socket){
    console.log('User connected');

    songQueueFull = songQueue.map(function(item) {
        return songCache[item];
    });
    socket.emit('queuelist', songQueueFull);

    socket.on('addsong', function(song) {

        console.log(song.id+': Resolving...');

        // Check if we have already resolved this songs ID
        if (typeof songCache[song.id] !== 'undefined' && typeof songCache[song.id]['URL'] !== 'undefined') {
            console.log(song.id+': Already resolved. Using cached URL');
            queueSong(song);
            return;
        }

        // Set the songs state to resolving
        song['state'] = 'resolving';

        // Add the the song to the cache
        songCache[song.id] = song;
        commitCache();

        // Run the resolver
        process.exec('./resolve.sh '+song.id, function (error, stdout, stderr) {

            if (error !== null) {
                console.error(song.id+': Failed to resolve!');
                songCache[song.id]['state'] = 'failed';
                commitCache();
                return;
            }

            // The resolve.sh will return the URL
            songCache[song.id]['URL'] = stdout;
            songCache[song.id]['state'] = 'resolved';
            commitCache();

            console.log(song.id+': Resolved!');
            queueSong(song);
        });
    });
    socket.on('pause', function() {
        control('pause');
    });
    socket.on('play', function() {
        control('play');
    });
});

