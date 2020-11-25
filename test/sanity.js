import * as tf from '@tensorflow/tfjs';
import Classifier from '../src/lib/classifier';
import Spotify from '../src/lib/spotify'

import {
    JsonToDataFrame,
    labelEncoder,
    preprocess,
    shuffleDataFrame,
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

    xit('pre_process_data', (done) => {
        const data = JSON.parse(fs.readFileSync('./data/chill.json'));
        const df = JsonToDataFrame(data);
        const trainTest = trainTestSplit(df);

        console.log("X_Train\n", trainTest.X_Train.toString());
        console.log("X_Test\n", trainTest.X_Test.toString());
        done();
    });

    // Modify to include/exclude genres you want to train on
    it('full_demonstration', (done) => {
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
        console.log("Country songs:", Object.keys(country).length);
        console.log("EDM songs:", Object.keys(edm_dance).length);
        console.log("Hip-Hop songs:", Object.keys(hiphop).length);
        console.log("Holiday songs:", Object.keys(holidays).length);
        console.log("Jazz songs:", Object.keys(jazz).length);
        console.log("Metal songs:", Object.keys(metal).length);
        console.log("Pop songs:", Object.keys(pop).length);
        console.log("RnB songs:", Object.keys(rnb).length);
        console.log("Rock songs:", Object.keys(rock).length);

        // shuffle later to randomize for training purposes
        const country_df = JsonToDataFrame(country);
        const edm_dance_df = JsonToDataFrame(edm_dance);
        const hiphop_df = JsonToDataFrame(hiphop);
        const holidays_df = JsonToDataFrame(holidays);
        const jazz_df = JsonToDataFrame(jazz);
        const metal_df = JsonToDataFrame(metal);
        const pop_df = JsonToDataFrame(pop);
        const rnb_df = JsonToDataFrame(rnb);
        const rock_df = JsonToDataFrame(rock);

        // const data = preprocess([country_df, edm_dance_df, hiphop_df, holidays_df, jazz_df, metal_df, pop_df, rnb_df, rock_df]);
        const data = shuffleDataFrame( preprocess([country_df, edm_dance_df, hiphop_df, holidays_df, jazz_df, metal_df, pop_df, rnb_df, rock_df]) );
        console.log("Total songs after evening out songs per genre:", data.length);

        const { X_Train, X_Test, Y_Train, Y_Test } = trainTestSplit(data, 153);
        const Y_Train_Encoded = labelEncoder(Y_Train);
        const Y_Test_Encoded = labelEncoder(Y_Test);
        const encodings = labelEncoder.encodings;

        // tf.layers.lstm({ units: 18, inputShape: [null, 12] });
        // tf.layers.lstm({ units: 18 });
        // tf.layers.dense({ units: 18, inputShape: [12], activation: 'relu' });
        // tf.layers.dense({ units: 9, activation: 'softmax' });
        // tf.layers.dense({ units: 40, inputShape: [12], activation: 'sigmoid' })
        // tf.layers.leakyReLU({ units: 40, inputShape: [12] })
        // tf.layers.gaussianDropout({ rate: 0.5 }),

        // Build model
        const layers = [tf.layers.dense({ units: 17, inputShape: [12], activation: 'softsign' }),
                        tf.layers.dense({ units: 15, activation: 'tanh' }),
                        tf.layers.dense({ units: 13, activation: 'selu' }),
                        tf.layers.dense({ units: 11, activation: 'softsign' }),
                        tf.layers.dense({ units: 9, activation: 'softmax' })];

        classifier.addLayers(layers);
        classifier.compile('adam', 'sparseCategoricalCrossentropy', 'accuracy');
        classifier.fit(X_Train, Y_Train_Encoded, { epochs: 550 }).then( () => {
            // Print metrics
            const X_Test_Tensor = tf.tensor(X_Test.to_json({ orient: 'values' }));
            const Y_Test_Tensor = tf.tensor(Y_Test_Encoded.to_json({ orient: 'values' }).flat());
            const metrics = classifier.model.evaluate(X_Test_Tensor, Y_Test_Tensor);
            console.log("Loss:", metrics[0].arraySync().toFixed(2));
            console.log("Accuracy:", (metrics[1].arraySync() * 100).toFixed(2), "%");

            // Assign genre label to predictions
            const predictions = classifier.predict(X_Test).arraySync();
            const predictedGenres = [];

            predictions.forEach( prediction => {
                const genreProbability = Math.max(...prediction); // Find highest probability for genre
                predictedGenres.push(prediction.indexOf(genreProbability));
            });

            console.log("\nTesting Set Results\n===================");
            for(let i = 0; i < Y_Test.length; i++) {
                const actual = Y_Test.iloc(i).to_json({ orient: 'values' });
                const pred = Object.keys(encodings).find( key => encodings[key] === predictedGenres[i] );
                console.log(`Prediction: ${pred}\t Actual: ${actual}` );
            }

            done();
        }).catch( err => {
            done(err);
        });
    });
});