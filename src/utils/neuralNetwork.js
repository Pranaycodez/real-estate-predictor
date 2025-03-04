import * as brain from 'brain.js';
import { preprocessData } from './dataProcessor';

let trainedNet = null;
let dataFeatures = null;

const trainNeuralNetwork = () => {
  const { normalizedData, features } = preprocessData();
  dataFeatures = features;
  
  const config = {
    hiddenLayers: [10, 8],
    activation: 'sigmoid',
    iterations: 2000,
    learningRate: 0.01
  };

  const net = new brain.NeuralNetwork(config);

  // Format data for Brain.js
  const trainingData = normalizedData.map(item => ({
    input: {
      area: item.input.area,
      bedrooms: item.input.bedrooms,
      bathrooms: item.input.bathrooms,
      downtown: item.input.location.downtown,
      suburban: item.input.location.suburban,
      rural: item.input.location.rural,
      age: item.input.age
    },
    output: { price: item.output.price }
  }));

  console.log('Training neural network...');
  net.train(trainingData);
  console.log('Neural network trained successfully!');
  
  trainedNet = net;
  return {
    net,
    features
  };
};

const predictPrice = (input) => {
  if (!trainedNet) {
    const { net, features } = trainNeuralNetwork();
    trainedNet = net;
    dataFeatures = features;
  }
  
  const formattedInput = {
    area: input.area,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    downtown: input.location === 'Downtown' ? 1 : 0,
    suburban: input.location === 'Suburban' ? 1 : 0,
    rural: input.location === 'Rural' ? 1 : 0,
    age: input.age
  };
  
  const prediction = trainedNet.run(formattedInput);
  
  // Denormalize the prediction
  const denormalizedPrice = prediction.price * (dataFeatures.price.max - dataFeatures.price.min) + dataFeatures.price.min;
  
  return Math.round(denormalizedPrice);
};

export { trainNeuralNetwork, predictPrice };
