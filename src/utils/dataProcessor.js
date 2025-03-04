import realEstateData from '../data/real_estate_dataset.json';

// Min-max scaling for numerical features
const preprocessData = () => {
  const features = {
    area: { min: Infinity, max: -Infinity },
    bedrooms: { min: Infinity, max: -Infinity },
    bathrooms: { min: Infinity, max: -Infinity },
    age: { min: Infinity, max: -Infinity },
    price: { min: Infinity, max: -Infinity }
  };

  // Find min and max values for each feature
  realEstateData.forEach(property => {
    features.area.min = Math.min(features.area.min, property['Area (sq ft)']);
    features.area.max = Math.max(features.area.max, property['Area (sq ft)']);
    
    features.bedrooms.min = Math.min(features.bedrooms.min, property['Bedrooms']);
    features.bedrooms.max = Math.max(features.bedrooms.max, property['Bedrooms']);
    
    features.bathrooms.min = Math.min(features.bathrooms.min, property['Bathrooms']);
    features.bathrooms.max = Math.max(features.bathrooms.max, property['Bathrooms']);
    
    features.age.min = Math.min(features.age.min, property['Age of Property (years)']);
    features.age.max = Math.max(features.age.max, property['Age of Property (years)']);
    
    features.price.min = Math.min(features.price.min, property['Price (in $1000)']);
    features.price.max = Math.max(features.price.max, property['Price (in $1000)']);
  });

  // Normalize data
  const normalizedData = realEstateData.map(property => {
    const normalizedProperty = {
      input: {
        area: (property['Area (sq ft)'] - features.area.min) / (features.area.max - features.area.min),
        bedrooms: (property['Bedrooms'] - features.bedrooms.min) / (features.bedrooms.max - features.bedrooms.min),
        bathrooms: (property['Bathrooms'] - features.bathrooms.min) / (features.bathrooms.max - features.bathrooms.min),
        location: locationToVector(property['Location']),
        age: (property['Age of Property (years)'] - features.age.min) / (features.age.max - features.age.min)
      },
      output: {
        price: (property['Price (in $1000)'] - features.price.min) / (features.price.max - features.price.min)
      }
    };
    return normalizedProperty;
  });

  return {
    normalizedData,
    features
  };
};

// One-hot encoding for location
const locationToVector = (location) => {
  const locations = ['Downtown', 'Suburban', 'Rural'];
  return locations.reduce((vector, loc) => {
    vector[loc.toLowerCase()] = location === loc ? 1 : 0;
    return vector;
  }, {});
};

// Convert user input to normalized format for prediction
const normalizeInput = (input, features) => {
  const normalizedInput = {
    area: (input.area - features.area.min) / (features.area.max - features.area.min),
    bedrooms: (input.bedrooms - features.bedrooms.min) / (features.bedrooms.max - features.bedrooms.min),
    bathrooms: (input.bathrooms - features.bathrooms.min) / (features.bathrooms.max - features.bathrooms.min),
    ...locationToVector(input.location),
    age: (input.age - features.age.min) / (features.age.max - features.age.min)
  };

  return normalizedInput;
};

// Denormalize the output price
const denormalizeOutput = (normalizedPrice, features) => {
  return normalizedPrice * (features.price.max - features.price.min) + features.price.min;
};

export { preprocessData, normalizeInput, denormalizeOutput };
