import Classifier from './lib/classifier';
import Spotify from './lib/spotify';

const spotify = new Spotify();
const classifier = new Classifier();

spotify.authorize('f7cbeaaf92314828ac13affb1ddcd928', 'c77be55828cc401e89645a659d8141ca');

/*
 * Classifier public API
 */

/**
 * Fit data to classifier
 * @param {Object} data Song data to fit to classifier model
 * @param {DataFrame} data.X Song data
 * @param {DataFrame} data.Y Song data labels
 */
exports.fit = (data) => {
    return new Promise( (resolve, reject) => {
        classifier.fit(data.X, data.Y);
        resolve();
    });
}

/**
 * Classify song
 * @param {DataFrame} songData Song data to classify
 * @returns {String} Song classification
 */
exports.predict = (songData) => {
    return new Promise( (resolve, reject) => {
        const classification = classifier.predict(songData);
        resolve(classification);
    });
}


/*
 * Spotify public API
 */

/**
 * Collect the top 100 songs of a given genre
 * @param {String} [genre="holidays"] Genre to query. Defaults to Christmas music
 */
exports.collectTop100 = (genre = 'holidays') => {
    return new Promise( (resolve, reject) => {
        spotify.getTop100AudioData(genre).then( data => {
            resolve(data);
        }).catch( err => {
            console.error(err);
            reject(err);
        });
    });
}