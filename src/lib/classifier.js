import * as tf from '@tensorflow/tfjs';
import {
    Series,
    DataFrame
} from 'pandas-js';

/**
 * Tensorflow classifier
 */
export class Classifier {
    constructor() {
    }

    // pls delete
    mcTest() {
        let df1 = new DataFrame([{A: 1, B: 2}, {A: 3, B: 4}]);
        console.log( df1.toString() );
    }

    /**
     * Fit the training data to the model
     * @param {DataFrame} X Preproccessed song data
     * @param {DataFrame} Y Preprocessed song classifications
     */
    fit(X, Y) {

    }

    /**
     * Classify a song
     * @param {DataFrame} songData Song data to predict against
     * @returns {String} Song classification
     */
    predict(songData) {

    }
}

export default Classifier;