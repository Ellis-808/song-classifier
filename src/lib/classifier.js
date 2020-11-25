import * as tf from '@tensorflow/tfjs';
import {
    Series,
    DataFrame
} from 'pandas-js';

/**
 * Tensorflow classifier
 */
export class Classifier {
    /**
     * Initialize the classifier model
     * @param {String} modelType Tensorflow model type
     * @param {Array<tf.layers.Layer} layers Tensorflow model layers
     */
    constructor(modelType, layers = []) {
        if(typeof modelType !== 'string')
            throw new Error("parameter `modelType` must be a string");
        if(! Array.isArray(layers))
            throw new Error("parameter `layers` must be an array");

        if(modelType === 'sequential')
            this.model = tf.sequential();
        else if(modelType === 'model')
            this.model = tf.model();
        else
            throw new Error("invalid Tensorflow model type");

        if(layers.length !== 0)
            this.addLayers(layers);
    }

    /**
     * Insert layers into model sequentially.
     * @param {Array<tf.layers.Layer>} layers Model layers
     */
    addLayers(layers) {
        if(! Array.isArray(layers))
            throw new Error("parameter `layers` must be an array");
        if(! layers.every( layer => layer instanceof tf.layers.Layer ))
            throw new Error("parameter `layers` must ONLY contain Tensorflow layers");

        layers.forEach( layer => {
            this.model.add(layer);
        });

        return;
    }

    /**
     * Compile the model in preperation of training.
     * @param {String} optimizer Model optimizer
     * @param {String} loss Loss function
     * @param {String|Array<String>} metrics Measured metrics
     */
    compile(optimizer = 'adam', loss = 'sparseCategoricalCrossentropy', metrics = 'accuracy') {
        if(typeof optimizer !== 'string')
            throw new Error("parameter `optimizer` must be a string");
        if(typeof loss !== 'string')
            throw new Error("parameter `loss` must be a string");
        if(typeof metrics !== 'string' && (! Array.isArray(metrics) || ! metrics.every( metric => typeof metric === 'string' )))
            throw new Error("parameter `metrics` must be a string or an array of strings");

        this.model.compile({ optimizer: optimizer, loss: loss, metrics: metrics });
        return;
    }

    /**
     * Fit the training data to the model
     * @param {DataFrame} X Preproccessed song data
     * @param {DataFrame} Y Preprocessed song 
     * @param {Object} [opts] Model fitting options
     * @param {Number} [opts.epochs=5] Model training epochs (training loops)
     * @param {Number} [opts.batchSize=32] Model training batch size
     * @param {Boolean} [opts.shuffle=true] Shuffle training data each epoch?
     * @returns {Promise<void>} Completed operation
     */
    fit(X, Y, opts = { epochs: 5, batchSize: 32, shuffle: true }) {
        if(! X instanceof DataFrame)
            throw new Error("parameter `X` must be a Pandas DataFrame");
        if(! Y instanceof DataFrame)
            throw new Error("parameter `Y` must be a Pandas DataFrame");
        if(typeof opts !== 'object')
            throw new Error("parameter `opts` must be an object");

        if(typeof opts.epochs === 'undefined')
            opts.epochs = 5;
        if(typeof opts.batchSize === 'undefined')
            opts.batchSize = 32;
        if(typeof opts.shuffle === 'undefined')
            opts.shuffle = true;

        if(typeof opts.epochs !== 'number')
            throw new Error("parameter `opts.epochs` must be an integer");
        if(typeof opts.batchSize !== 'number')
            throw new Error("parameter `opts.batchSize` must be an integer");
        if(typeof opts.shuffle !== 'boolean')
            throw new Error("parameter `opts.shuffle` must be a boolean");

        const X_Tensor = tf.tensor( X.to_json({ orient: 'values' }) );
        const Y_Tensor = tf.tensor( Y.to_json({ orient: 'values' }).flat() );

        return this.model.fit(X_Tensor, Y_Tensor,
            {epochs: opts.epochs, batchSize: opts.batchSize, shuffle: opts.shuffle})
        .then( () => {
            return;
        });
    }

    /**
     * Classify a song
     * @param {DataFrame} X Song data to predict against
     * @returns {String} Song classification
     */
    predict(X) {
        const X_Tensor = tf.tensor( X.to_json({ orient: 'values' }) );
        return this.model.predict(X_Tensor);
    }
}

export default Classifier;