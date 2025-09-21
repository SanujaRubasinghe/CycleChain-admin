'use client'

import { createContext, useState, useEffect } from 'react';

export const BikeContext = createContext();

export const BikeProvider = ({ children }) => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBike, setSelectedBike] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchBikes = async () => {
      try {
        // In a real app, you would fetch from your API
        const res = await fetch('/api/fleet/bikes')
        const data = await res.json()
        setBikes(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bikes:', error);
        setLoading(false);
      }
    };

    fetchBikes();
  }, []);

  const addBike = (newBike) => {
    setBikes([...bikes, newBike]);
  };

  const updateBike = (updatedBike) => {
    setBikes(bikes.map(bike => bike.id === updatedBike.id ? updatedBike : bike));
  };

  const removeBike = (id) => {
    setBikes(bikes.filter(bike => bike.id !== id));
  };

  return (
    <BikeContext.Provider 
      value={{ 
        bikes, 
        loading, 
        selectedBike, 
        setSelectedBike, 
        addBike, 
        updateBike, 
        removeBike 
      }}
    >
      {children}
    </BikeContext.Provider>
  );
};