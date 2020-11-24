import { concat } from 'pandas-js';
import * as tf from '@tensorflow/tfjs';
import Classifier from '../src/lib/classifier';
import Spotify from '../src/lib/spotify'

import {
    labelEncoder,
    preprocess,
    trainTestSplit
} from '../src/lib/util';

const fs = require('fs');
const spotify = new Spotify();
const classifier = new Classifier("sequential");

const sleep = (delay) => new Promise( resolve => setTimeout(resolve(), delay) );

describe('song-classifier', function() {
    this.timeout(600000);

    before( done => {
        spotify.authorize('f7cbeaaf92314828ac13affb1ddcd928', 'c77be55828cc401e89645a659d8141ca').then( () => {
            console.log("Spotify API Token:", spotify.accessToken);
            done();
        }).catch( err => {
            done(err);
        });
    });
    
    xit('get_top_100_spotify', (done) => {
        const genre = 'chill';
        spotify.getTop100AudioData(genre).then( data => {
            if (! fs.existsSync('./data/')) {
                fs.mkdirSync('./data/');
            }

            fs.writeFileSync(`./data/${genre}.json`, JSON.stringify(data, null, 4));
            done();
        }).catch( err => {
            done(err);
        });
    });

    // Disabled optional test to collect a series of genres in one go
    // NOTE-> Long execution time. (30 second sleep() per genre)
    // NOTE-> DO NOT USE. Fails to retrieve half the data
    xit('get_top_100_spotify_batch', (done) => {
        const genres = ['country', 'edm_dance', 'hiphop', 'holidays', 'jazz', 'metal',
                        'pop', 'rnb', 'rock'];
        let promises = [];

        let delay = 1;
        genres.forEach( genre => {
            promises.push( sleep(delay * 1000).then( () => {
                return spotify.getTop100AudioData(genre).catch( err => {
                    console.error(`Error collecting ${genre}:`, err);
                    return {};
                });
            }) );
            delay += 30;
        });

        Promise.all(promises).then( results => {
            let i = 0;
            results.forEach( result => {
                if(Object.keys(result).length >= 0 && result.constructor === Object)
                    fs.writeFileSync(`./data/${genres[i]}.json`, JSON.stringify(result, null, 4));
                i++;
            });
            done()
        }).catch( err => {
            done(err);
        });
    });

    xit('fit_data', (done) => {
        const data = JSON.parse(fs.readFileSync('./data/chill.json'));
        const df = preprocess(data);
        const trainTest = trainTestSplit(df);

        console.log("X_Train\n", trainTest.X_Train.toString());
        console.log("X_Test\n", trainTest.X_Test.toString());
        done();
    });

    // Modify to include/exclude genres you want to train on
    it('create_dataset', (done) => {
        const country = JSON.parse(fs.readFileSync('./data/country.json'));
        const edm_dance = JSON.parse(fs.readFileSync('./data/edm_dance.json'));
        const hiphop = JSON.parse(fs.readFileSync('./data/hiphop.json'));
        const holidays = JSON.parse(fs.readFileSync('./data/holidays.json'));
        const jazz = JSON.parse(fs.readFileSync('./data/jazz.json'));
        const metal = JSON.parse(fs.readFileSync('./data/metal.json'));
        const pop = JSON.parse(fs.readFileSync('./data/pop.json'));
        const rnb = JSON.parse(fs.readFileSync('./data/rnb.json'));
        const rock = JSON.parse(fs.readFileSync('./data/rock.json'));

        // See the number of songs for each genre
        // console.log(Object.keys(country).length);
        // console.log(Object.keys(edm_dance).length);
        // console.log(Object.keys(hiphop).length);
        // console.log(Object.keys(holidays).length);
        // console.log(Object.keys(jazz).length);
        // console.log(Object.keys(metal).length);
        // console.log(Object.keys(pop).length);
        // console.log(Object.keys(rnb).length);
        // console.log(Object.keys(rock).length);

        // shuffle later to randomize for training purposes
        const country_df = preprocess(country);
        const edm_dance_df = preprocess(edm_dance);
        const hiphop_df = preprocess(hiphop);
        const holidays_df = preprocess(holidays);
        const jazz_df = preprocess(jazz);
        const metal_df = preprocess(metal);
        const pop_df = preprocess(pop);
        const rnb_df = preprocess(rnb);
        const rock_df = preprocess(rock);

        const data = concat([country_df, edm_dance_df, hiphop_df, holidays_df, jazz_df, metal_df, pop_df, rnb_df, rock_df]);
        const { X_Train, X_Test, Y_Train, Y_Test } = trainTestSplit(data);

        const Y_Train_Encoded = labelEncoder(Y_Train);
        const Y_Test_Encoded = labelEncoder(Y_Test);
        console.log( Y_Test_Encoded.length );
        // this.model.add(tf.layers.lstm({ units: 18, inputShape: [611, 12] }));
        // this.model.add(tf.layers.lstm({ units: 18 }));

        const layers = [tf.layers.dense({ units: 18, inputShape: [12], activation: 'relu' }), tf.layers.dense({ units: 9, activation: 'softmax' })];
        classifier.addLayers(layers);
        classifier.compile('adam', 'sparseCategoricalCrossentropy', 'accuracy');
        // this.model.add(tf.layers.dense({ units: 18, inputShape: [12], activation: 'relu' }));
        // this.model.add(tf.layers.dense({ units: 9, activation: 'softmax' }));
        // this.model.compile({ optimizer: 'adam', loss: 'sparseCategoricalCrossentropy', metrics: 'accuracy' });
        classifier.fit(X_Train, Y_Train_Encoded).then( () => {
            const prediction = classifier.predict(X_Test);
            const allPredictions =  prediction.arraySync().map( row => Math.max.apply(Math, row) );
            console.log(prediction.arraySync().indexOf(Math.max(...prediction.arraySync())));
            done();
        }).catch( err => {
            done(err);
        });
    });
});