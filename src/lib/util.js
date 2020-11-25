import {
    concat,
    Series,
    DataFrame
} from 'pandas-js';

/**
 * Pseudo-random integer generator between 0(inclusive) - max(exclusive)
 * @param {Number} max Max range
 * @returns {Number} Randomly generated integer
 */
const randomInt = (max) => Math.floor(Math.random() * Math.floor(max));

/* ------------------------------------ Exported Functions ------------------------------------- */

/**
 * Process song data collected from Spotify and place into a Pandas DataFrame
 * @param {Object} songData JSON object containing spotify data
 * @returns {DataFrame} DataFrame containing spotify song features
 */
export function JsonToDataFrame(songData) {
    const songIndicies = Object.keys(songData);
    const data = [];

    songIndicies.forEach( index => {
        const features = songData[index].features
        delete features.id;
        delete features.analysis_url;
        delete features.duration_ms;

        features.genre = songData[index].genre;
        data.push(features);
    });

    return new DataFrame(data);
}

/**
 * Encode data labels to integers for classifier.
 * @param {DataFrame} df Pandas DataFrame of labels to encode
 * @returns {DataFrame} Encoded labels
 */
export function labelEncoder(df) {
    const data = df.to_json({ orient: 'values' }).flat();
    const labels = [];
    const encodings = {};
    const encodedData = [];

    data.forEach( label => {
        if(! labels.includes(label))
            labels.push(label);
    });

    for(let i = 0; i < labels.length; i++) {
        encodings[labels[i]] = i;
    }

    data.forEach( label => {
        encodedData.push({ genre: encodings[label] });
    });

    return {
        encodedData: new DataFrame(encodedData),
        encodings: encodings
    }
}

/**
 * Process song data in preparation for model fitting
 * @param {DataFrame} dfs Song data to process
 * @returns {DataFrame} Processed song data
 */
export function preprocess(dfs) {
    if(! Array.isArray(dfs) && ! dfs.every( df => df instanceof DataFrame ))
        throw new Error("parameter `dfs` must be an array of Pandas DataFrames");

    const data = [];
    let min = Number.MAX_SAFE_INTEGER;

    dfs.forEach( df => min = df.length < min ? df.length : min );
    dfs.forEach( df => {
        if(df.length > min)
            data.push(df.iloc([0, min]));
        else
            data.push(df);
    });

    return concat(data);
}

/**
 * @typedef TrainTestData Object containing split song data
 * @property {DataFrame} X_Train Song training features
 * @property {DataFrame} X_Test Song testing features
 * @property {DataFrame} Y_Train Song training labels
 * @property {DataFrame} Y_Test Song testing labels
 */

/**
 * Split data into training and testing sets, with both sets being split further
 * into X: features and Y: labels.
 * @param {DataFrame} df Pandas DataFrame containing song data
 * @param {Number} [testSize=0] Test size: Defaults to 30% of the song count
 * @returns {TrainTestData} Split song data
 */
export function trainTestSplit(df, testSize = 0) {
    if(! (df instanceof DataFrame))
        throw new Error("parameter `df` must be an instance of a Pandas DataFrame");
    if(typeof testSize !== 'number')
        throw new Error("parameter `testSize` must be an integer");

    const songCount = df.length;
    if(testSize === 0)
        testSize = Math.floor(songCount * 0.3);
    if(songCount <= testSize)
        throw new Error("testSize must not exceed the provided DataFrame's index count");

    // Generate random indexes to use as training set
    let numbers = [];
    while(numbers.length != testSize) {
        const number = randomInt(songCount);
        if(numbers.includes(number))
            continue;
        numbers.push(number);
    }

    // Split data
    let trainSet = [];
    let testSet = [];
    for(const [row,idx] of df.iterrows()) {
        if(numbers.includes(idx))
            testSet.push(df.iloc(idx).to_json({ orient: 'records' }));
        else
            trainSet.push(df.iloc(idx).to_json({ orient: 'records' }));
    }
    trainSet = trainSet.flat();
    testSet = testSet.flat();

    // Seperate labels from features
    let trainLabels = [];
    let testLabels = [];
    for(let i = 0; i < trainSet.length; i++) {
        trainLabels.push({ genre: trainSet[i].genre });
        delete trainSet[i].genre;
    }
    for(let i = 0; i < testSet.length; i++) {
        testLabels.push({ genre: testSet[i].genre });
        delete testSet[i].genre;
    }

    return {
        X_Train: new DataFrame(trainSet),
        X_Test: new DataFrame(testSet),
        Y_Train: new DataFrame(trainLabels),
        Y_Test: new DataFrame(testLabels)
    }
}