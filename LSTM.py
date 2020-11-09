import math
import numpy as np

class LSTM:    
    @staticmethod
    def sigmoid_function(x):
        return 1 / (1 + math.exp(-x))

    @staticmethod
    def sigmoid_derivative(x):
        return x * (1 - x)

    @staticmethod
    def tanh_function(x):
        return (math.exp(x) - math.exp(-x)) / (math.exp(x) + math.exp(-x))

    @staticmethod
    def tanh_derivative(x):
        return 1 - (x**2)

    @staticmethod
    def softmax_function(x):
        return math.exp(x) / sum(math.exp(x), 1)

    @staticmethod
    def one_hot(text):
        vocab = np.unique(text.split())
        words = {}

        for i, word in enumerate(vocab):
            words[word] = i

        print( words )
        x = len(words)
        encoded = np.zeros((x, x))

        for word, i in words.items():
            encoded[i][i] = 1
        
        text_encoded = []
        for word in text.split():
            text_encoded.append( encoded[words[word]] )
        return text_encoded

    @staticmethod
    def wordEmbeddings(data, embeddings):
        return np.matmul(data, embeddings)


    def __init__(self, units, inputs=100, hidden_neurons=256, learning_rate=0.005):
        self.__inputs = inputs
        self.__hidden_neurons = hidden_neurons
        self.__units = units
        self.__learning_rate = learning_rate
        self.__weights = {}
        
    def __initialize_weights(self, mean=0, std=0.01):
        self.__weights['forget_gate'] = np.random.normal(mean, std, (self.__units + self.__hidden_neurons, self.__hidden_neurons))
        self.__weights['input_gate'] = np.random.normal(mean, std, (self.__units + self.__hidden_neurons, self.__hidden_neurons))
        self.__weights['output_gate'] = np.random.normal(mean, std, (self.__units + self.__hidden_neurons, self.__hidden_neurons))
        self.__weights['gate_gate'] = np.random.normal(mean, std, (self.__units + self.__hidden_neurons, self.__hidden_neurons))
        self.__weights['hidden_output'] = np.random.normal(mean, std, (self.__hidden_neurons, self.__units))

        return

    def train(self, dataset, iterations=1000, batch_size=20):
        self.__initialize_weights()


    def create_cell(self, data, last_activation, last_cell):
        pass

    def run_cell(self, activation):
        pass

    def forward_propagation(self, batches, embeddings):
        pass

    def backward_propagation(self, lstm_cache, embedding_cache, activation_cache, cell_cache, output_cache):
        pass

    def calculate_metrics(self):
        pass

    def calculate_cell_error(self):
        pass

print( LSTM.one_hot( "This is a test of a test" ) )