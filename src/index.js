import { Spotify } from './lib/spotify';

const spotify = new Spotify();
spotify.authorize('f7cbeaaf92314828ac13affb1ddcd928', 'c77be55828cc401e89645a659d8141ca');

spotify.getTop100AudioData();