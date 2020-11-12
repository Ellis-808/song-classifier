import { Spotify } from '../src/lib';

describe('API check', function() {
    it('authorize_spotify', (done) => {
        const spotify = Spotify();
        spotify.authorize('f7cbeaaf92314828ac13affb1ddcd928', 'c77be55828cc401e89645a659d8141ca').then( () => {
            done();
        }).catch( err => {
            done(err);
        });
    });
    
    it('get_top_100_spotify', function() {
        const spotify = Spotify();
        spotify.authorize('f7cbeaaf92314828ac13affb1ddcd928', 'c77be55828cc401e89645a659d8141ca').then( () => {
            spotify.getTop100AudioData().then( response => {
                console.log("Top 100 data: ", response.data);
                done();
            }).catch( err => {
                done(err);
            });
        }).catch( err => {
            done(err);
        });
    });
});