import Axios from 'axios';

/**
 * Spotify API interface
 */
export class Spotify {
    constructor() {
        this.accessToken = '';
    }

    /**
     * Authorize and retreive spotify access token
     * @param {String} clientId Spotify client ID
     * @param {String} clientSecret Spotify client secret
     */
    authorize(clientId, clientSecret) {
        return new Promise( (resolve, reject) => {
            const request = {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${Buffer.from( String(clientId + ':' + clientSecret) ).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                params: {
                    grant_type: 'client_credentials'
                },
                url: 'https://accounts.spotify.com/api/token'
            };
            Axios(request).then( response => {
                this.accessToken = response.data.access_token;
                resolve();
            }).catch( err => {
                console.error(err);
                reject(err);
            });
        });
    }

    /**
     * Get top 100 songs from specified genre playlist.
     * 
     * NOTE-> Only retrieves the first playlist of the queried genre.
     * @param {String} genre Genre to query
     */
    getTop100AudioData(genre) {
        if(typeof genre !== 'string')
            throw new Error("parameter `genre` must be of type string");

        const songData = {};
        return new Promise( (resolve, reject) => {
            const playlistRequest = {
                method: 'GET',
                headers: { Authorization: `Bearer ${this.accessToken}` },
                url: `https://api.spotify.com/v1/browse/categories/${genre}/playlists`
            };
            return Axios(playlistRequest).then( response => {
                const tracklistRequest = {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${this.accessToken}` },
                    url: response.data.playlists.items[0].tracks.href
                };
                return Axios(tracklistRequest);
            }).then( response => {
                let featureUrl = "https://api.spotify.com/v1/audio-features/?ids=";
                response.data.items.forEach( trackItem => {
                    featureUrl += trackItem.track.id + ',';
                    songData[trackItem.track.id] = {
                        name: trackItem.track.name,
                        popularity: trackItem.track.popularity
                    };
                });

                const request = {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${this.accessToken}` },
                    url: featureUrl.slice(0, -1)
                };
                return Axios(request);
            }).then( response => {
                response.data.audio_features.forEach( song => {
                    songData[song.id].features = song;
                });
                resolve(songData);
            }).catch( err => {
                console.error("error collecting top 100 songs of genre playlist:", err);
                reject(err);
            });
        });
    }
}

export default Spotify;