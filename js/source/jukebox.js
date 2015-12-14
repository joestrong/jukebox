export default class JukeBox
{
    constructor()
    {
        this.playlists = {};
    }

    setPlaylist(playlistData)
    {
        // Try and add this playlist
        this.addPlaylist(playlistData);

        this.playlistID = playlistData.ID;
    }

    addPlaylist(playlistData, overwrite)
    {
        // Check if we have already loaded this playlist
        if (overwrite === true || typeof this.playlists[playlistData.ID] === 'undefined') {
            this.playlists[playlistData.ID] = new PlayList(playlistData);
        }
    }

    getPlaylist()
    {
        return this.playlists[this.playlistID];
    }
}

