import Axios from 'axios';

/**
 * Delay execution (ms)
 * @param {Number} delay Time in ms
 */
const sleep = (delay) => new Promise( resolve => setTimeout(resolve(), delay) );

/**
 * Remove unnecessary data from a song analysis object (Low Level)
 * @param {Object} songData Song to trim
 * @returns {Object} Trimmed song object
 */
const trimSongData = (songData) => {
    delete songData.meta;
    delete songData.track.duration;
    delete songData.track.sample_md5;
    delete songData.track.loudness;
    delete songData.track.codestring;
    delete songData.track.code_version;
    delete songData.track.echoprintstring;
    delete songData.track.echoprint_version;
    delete songData.track.synchstring;
    delete songData.track.synch_version;
    delete songData.track.rhythmstring;
    delete songData.track.rhythm_version;

    return songData;
}

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
     * @typedef {Object} SongData 100 songs, keyed by spotify track ID
     * @property {String} name Song name
     * @property {Number} popularity Song popularity according to spotify (out of 100)
     * @property {Object} features Audio features (High level)
     * @property {Object} analysis Audio analysis (Low level)
     */

    /**
     * Get up to the top 100 songs from the specified genre playlist.
     * 
     * @see {@link https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/ High Level Audio Data} schema
     * @see {@link https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-analysis/ Low Level Audio Data} schema
     * 
     * NOTE-> Only retrieves the first playlist of the queried genre.
     * NOTE-> Rate limiting negatively affects audio analysis (Low Level) data collection.
     * Supported params: 
     *   'toplists',         'hiphop',     'pop',
     *   'country',          'workout',    'rock',
     *   'latin',            'holidays',   'mood',
     *   'rnb',              'gaming',     'shows_with_music',
     *   'focus',            'edm_dance',  'blackhistorymonth',
     *   'chill',            'at_home',    'indie_alt',
     *   'inspirational',    'decades',    'instrumental',
     *   'alternative',      'wellness',   'in_the_car',
     *   'pride',            'party',      'sleep',
     *   'classical',        'jazz',       'roots',
     *   'soul',             'sessions',   'dinner',
     *   'romance',          'kpop',       'punk',
     *   'regional_mexican', 'popculture', 'blues',
     *   'arab',             'desi',       'radar',
     *   'anime',            'thirdparty', 'afro',
     *   'comedy',           'metal',      'caribbean',
     *   'sports',           'funk'
     * @param {String} genre Genre to query
     * @returns {SongData} Top 100 songs audio data
     */
    getTop100AudioData(genre, lowLevelData = false) {
        if(typeof genre !== 'string')
            throw new Error("parameter `genre` must be of type string");
        if(typeof lowLevelData !== 'boolean')
            throw new Error("parameter `lowLevelData` must be of type boolean");

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
                        genre: genre,
                        popularity: trackItem.track.popularity
                    };
                });

                const featuresRequest = {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${this.accessToken}` },
                    url: featureUrl.slice(0, -1)
                };
                return Axios(featuresRequest);
            }).then( response => {
                let promises = [];
                response.data.audio_features.forEach( song => {
                    delete song.type;
                    delete song.uri;
                    delete song.track_href;
                    songData[song.id].features = song;
                    
                    if(lowLevelData) {
                        const analysisRequest = {
                            method: 'GET',
                            headers: { Authorization: `Bearer ${this.accessToken}` },
                            url: song.analysis_url
                        };
                        promises.push(Axios(analysisRequest).catch( err => {
                            return {
                                status: err.response.status,
                                url: err.config.url,
                                timeout: err.response.headers['retry-after'] ? parseInt(err.response.headers['retry-after']) : NaN
                            };
                        }));
                    }
                });

                return Promise.all(promises);
            }).then( songs => {
                let errors = [];
                songs.forEach( song => {
                    if(song.status !== 200)
                        errors.push(song);
                    else {
                        const id = song.request.path.split('/')[3];
                        songData[id].analysis = trimSongData(song.data);
                    }
                });

                if(errors.length > 0) {
                    let timeout = 0;
                    let promises = [];

                    for(let i = 0; i < errors.length; i++) {
                        if(errors[i].status === 429) {
                            timeout = (errors[i].timeout * 1000) + 2;
                            break;
                        }
                    }

                    // One retry attempt for audio analysis data.
                    resolve( sleep(timeout).then( () => {
                        errors.forEach( error => {
                            const retry = {
                                method: 'GET',
                                headers: { Authorization: `Bearer ${this.accessToken}` },
                                url: error.url
                            };
                            promises.push( Axios(retry).catch( err => {return {}}) );
                        });

                        return Promise.all(promises).then( retries => {
                            let i = 0;
                            retries.forEach( song => {
                                if( (song.status || '') === 200 ) {
                                    const id = song.request.path.split('/')[3];
                                    songData[id].analysis = trimSongData(song.data);
                                }
                                else i++;
                            });

                            if( i > 0 )
                                console.error(`${i} song(s) audio analysis (Low Level) data could not be retrieved`);
                            return songData;
                        });
                    }) );
                } else {
                    resolve(songData);
                }
            }).catch( err => {
                console.error("error collecting top 100 songs of genre playlist:", err);
                reject(err);
            });
        });
    }
}

export default Spotify;