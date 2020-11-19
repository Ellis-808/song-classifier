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
     * Get top 100 songs audio data
     * @param {String} genre Genre to query
     */
    getTop100AudioData(genre) {
        if(typeof genre !== 'string')
            throw new Error("parameter `genre` must be of type string");

        return new Promise( (resolve, reject) => {
            const request = {
                method: 'GET',
                headers: { Authorization: `Bearer ${this.accessToken}` },
                url: `https://api.spotify.com/v1/browse/categories/${genre}/playlists`
            };
            return Axios(request).then( response => {
                console.log( ...response.data.items );
                resolve(response.data);
            }).catch( err => {
                console.error("ERROR:", err);
                reject(err);
            });
        });
    }
}

export default Spotify;