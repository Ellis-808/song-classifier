import Classifier from '../src/lib/classifier';
import Spotify from '../src/lib/spotify'

const spotify = new Spotify();
const classifier = new Classifier();

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

    // Do this in before() to initialize spotify instance for rest of tests.
    // it('authorize_spotify', (done) => {
    //     const spotify = new Spotify();
    //     spotify.authorize('f7cbeaaf92314828ac13affb1ddcd928', 'c77be55828cc401e89645a659d8141ca').then( () => {
    //         done();
    //     }).catch( err => {
    //         done(err);
    //     });
    // });
    
    it('get_top_100_spotify', done => {
        spotify.getTop100AudioData('holidays').then( data => {
            console.log("Top 100 data (1st entry): ", data[Object.keys(data)[0]]);
            done();
        }).catch( err => {
            done(err);
        });
    });
});