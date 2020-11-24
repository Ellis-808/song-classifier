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
        this.model = tf.sequential();
        // this.model.add(tf.layers.lstm({ units: 18, inputShape: [611, 12] }));
        // this.model.add(tf.layers.lstm({ units: 18 }));
        // this.model.add(tf.layers.dense({ units: 18, activation: 'relu' }));
        // this.model.add(tf.layers.dense({ units: 9, activation: 'softmax' }));
        this.model.add(tf.layers.dense({ units: 18, inputShape: [12], activation: 'relu' }));
        this.model.add(tf.layers.dense({ units: 9, activation: 'softmax' }));
        this.model.compile({ optimizer: 'adam', loss: 'sparseCategoricalCrossentropy', metrics: 'accuracy' });
    }

    /**
     * Fit the training data to the model
     * @param {DataFrame} X Preproccessed song data
     * @param {DataFrame} Y Preprocessed song classifications
     */
    fit(X, Y, epochs = 5) {
        const X_Tensor = X.to_json({ orient: 'values' });
        const Y_Tensor = Y.to_json({ orient: 'values' }).flat();
        // console.log(X_Tensor);
        // return this.model.fit(X_Tensor, Y_Tensor, {epochs: epochs}).then( () => {
        //     return;
        // });
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