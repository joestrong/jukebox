var io = require('socket.io')(3000);
var fs  = require("fs");

io.on('connection', function(socket){
    console.log('a user connected');

    fs.readFile('playlist', function(err, f){
        var queue = f.toString().split('\n');
        socket.emit('queuelist', queue);
    });

    socket.on('addsong', function(data) {
        fs.appendFile('playlist', data.id + "\n", function (err) {
            console.log('song added: ' + data.id);
            io.emit('newsong', data);
        });
    });
});

