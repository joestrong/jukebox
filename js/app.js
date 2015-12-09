(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var socket = io('//:3000');
socket.on('connect', function(){
    console.log('connected to websocket server');
});

socket.on('disconnect', function(){
    console.log('disconnected');
    $('.media-controls .btn, #shutdown').addClass('disabled');
});

setTimeout(googleApiClientReady, 1000);
function googleApiClientReady() {
    gapi.client.setApiKey('AIzaSyC5ZNaxUE7HwOxi6r5xMq9aeRlUVdJXU7I');
    gapi.auth.init(function() {
        gapi.client.load('youtube', 'v3', function () {
            handleAPILoaded();
        });
    });
}

function notify(title, content) {
    if (window.Notification) {
        if (Notification.permission === "granted") {
            var notification = new Notification(title, { 'body': content, 'icon': '/favicon.ico' });
        } else {
            Notification.requestPermission(function(permission) {
                var notification = new Notification(title, { 'body': content, 'icon': '/favicon.ico' });
            });
        }
    }
}

function handleAPILoaded()
{
    $('#search').prop('disabled', false);
}

$('#search').on('keyup', function () {
    search($('#search').val());
});

function search(query) {
    var request = gapi.client.youtube.search.list({
        q: query,
        part: 'snippet',
        maxResults: '25'
    });

    request.execute(function (response) {
        console.log(response.result);
        $('#search-container').html('');
        $.each(response.result.items, function(index, item) {
            if (item.id.kind == "youtube#video") {
                var el = $('<div />', { 'class': 'songResult' });
                el.data('url', item.id.videoId);
                var image = $('<img />', { src: item.snippet.thumbnails.default.url });
                var descWrap = $('<div />');
                var title = $('<p />', { text: item.snippet.title, 'class': 'title' });
                //var author = $('<p />', { text: item.snippet.channelTitle, 'class': 'description' });
                descWrap.append(title);
                //descWrap.append(author);
                var imgwrap = $('<div />', { 'class': 'imageWrapper' });
                imgwrap.append(image);
                el.append(imgwrap);
                el.append(descWrap);
                $('#search-container').append(el);
            }
        })
    });
}

$('#search-container').on('click', '> div', function() {
    var song = {
        id: $(this).data('url'),
        title: $(this).find('p.title').text(),
        thumbnail: $(this).find('img').attr('src')
    };
    addSong(song);
    $(this).addClass('added');
});

function addSong(song) {
    console.log('Adding.. ' + song.id);
    socket.emit('addsong', song);
}

$('#pauseButton').click(function() {
    socket.emit('pause');
});

$('#playButton').click(function() {
    socket.emit('play');
});

$('#addButton').click(function() {
    showAddDialog();
});

$(document).keyup(function(event){
    // Keys when form input isn't focused
    if (!$(event.target).is('input')) {
        // A or Enter triggers dialog
        if (event.keyCode == 65 || event.keyCode == 13) {
            showAddDialog();
        }
    }
    // Esc closes dialog
    if (event.keyCode == 27) {
        closeAddDialog();
    }
});

function showAddDialog() {
    $('#addDialog').show();
    $('#search').focus().val('');
}

$('#addDialogClose').click(function() {
    closeAddDialog();
});

function closeAddDialog() {
    $('#addDialog').hide();
}

$('#volupButton').click(function() {
    socket.emit('volUp');
});

$('#voldownButton').click(function() {
    socket.emit('volDown');
});

$('#forwardButton').click(function() {
    socket.emit('skipsong');
});

socket.on('newsong', function(song) {
    console.log('From websocket: new song' + song.id);
    addToQueue(song);
    notify('New Song Added', song.title);
});

socket.on('resolved', function(song) {
    $('.queue-container #song-'+song.id+'[data-resolving="true"]').remove();
});

socket.on('resolving', function(song) {
    addToQueue(song, true);
});

socket.on('resolved failed', function(song) {
    $('.queue-container #song-'+song.id).attr('data-resolving','failed');
});

socket.on('queuelist', function(data) {
    console.log('From websocket: whole list');
    setQueue(data);
    var queueEl = $('.queue-container');
    var title = queueEl.find('> :first-child .title').text();
    updateNowPlaying(title);
});

socket.on('song finished', function() {
    var queueEl = $('.queue-container');
    queueEl.find('> :first-child').remove();
    if (queueEl.find('> div').length > 0) {
        var title = queueEl.find('> :first-child .title').text();
        notify('Next Up', title);
        updateNowPlaying(title);
    } else {
        updateNowPlaying('');
    }
});

socket.on('controlstatus', function(controlStatus) {
    var pauseEl = $('#pauseButton');
    var playEl = $('#playButton');
    if (controlStatus.paused) {
        pauseEl.addClass('disabled');
        playEl.removeClass('disabled');
    } else {
        pauseEl.removeClass('disabled');
        playEl.addClass('disabled');
    }
});

function addToQueue(song, resolving) {
    var item = $('<div />', { 'class': 'songResult', 'id': 'song-'+song.id });

    item.attr('data-resolving',!!resolving);

    var image = $('<img />', { src: song.thumbnail });
    var title = $('<p />', { 'class': 'title', text: song.title });
    var imgwrap = $('<div />', { 'class': 'imageWrapper' });
    imgwrap.append(image);
    item.append(imgwrap);
    item.append(title);
    $('.queue-container').append(item);
}

function setQueue(data) {
    $('.queue-container').html('');
    $.each(data, function(index, item) {
        addToQueue(item);
    });
}

function updateNowPlaying(title) {
    if (title == '') {
        $('title').text('Freshleaf Jukebox');
    } else {
        $('title').text(title + ' - Freshleaf Jukebox');
    }
}
$(window).on('scroll', function() {
    var y_scroll_pos = window.pageYOffset;
    var scroll_pos_test = 120;             // set to whatever you want it to be

    if(y_scroll_pos > scroll_pos_test) {
        $('header').addClass('scrolled');
    }
    else {
        $('header').removeClass('scrolled');
    }
});


},{}]},{},[1])