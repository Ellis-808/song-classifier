import Classifier from '../src/lib/classifier';
import Spotify from '../src/lib/spotify'

const spotify = new Spotify();
// const classifier = new Classifier();

describe('API check', function() {
    before( done => {
        spotify.authorize('f7cbeaaf92314828ac13affb1ddcd928', 'c77be55828cc401e89645a659d8141ca').then( () => {
            done();
        }).catch( err => {
            done(err);
        });
    });

    // it('authorize_spotify', (done) => {
    //     const spotify = new Spotify();
    //     spotify.authorize('f7cbeaaf92314828ac13affb1ddcd928', 'c77be55828cc401e89645a659d8141ca').then( () => {
    //         done();
    //     }).catch( err => {
    //         done(err);
    //     });
    // });
    
    it('get_top_100_spotify', function(done) {
        spotify.getTop100AudioData().then( data => {
            console.log("Top 100 data: ", data);
            done();
        }).catch( err => {
            done(err);
        });
    });
});