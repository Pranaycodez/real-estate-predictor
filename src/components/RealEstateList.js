import React, { useEffect, useState } from 'react';
import realEstateData from '../data/real_estate_dataset.json';

function RealEstateList() {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(realEstateData);
  }, []);

  return (
    <div>
      <h2>Real Estate Data</h2>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item.PropertyName}</li>
        ))}
      </ul>
    </div>
  );
}

export default RealEstateList;
