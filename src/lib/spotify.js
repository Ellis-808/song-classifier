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
        const request = {
            method: 'POST',
            header: {
                'Authorization': `Basic ${Buffer.from( String(clientId + ':' + clientSecret) )}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: {
                grant_type: 'client_credentials'
            },
            url: 'https://accounts.spotify.com/api/token'
        };
        return Axios(request).then( response => {
            this.accessToken = response.data.access_token;
            Promise.resolve();
        }).catch( err => {
            console.error(err);
            Promise.reject(err);
        });
    }

    /**
     * Get top 100 songs audio data
     * @param {String} [genre] Filter by genre
     */
    getTop100AudioData(genre = 'happy_holidays') {
        const request = {
            method: 'POST',
            headers: `Bearer ${this.accessToken}`,
            url: `https://api.spotify.com/v1/browse/categories/${genre}`
        };
        return Axios(request).then( response => {
            console.log( response.data );
        }).catch( err => {
            console.error(err);
            Promise.reject(err);
        });
    }
}