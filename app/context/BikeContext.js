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
        const mockBikes = [
          {
            id: '1',
            name: 'City Bike 001',
            status: 'available',
            battery: 85,
            lastMaintenance: '2023-05-15',
            location: { lat: 40.7128, lng: -74.0060 },
            qrCode: 'bike-001-qr'
          },
          // Add more mock bikes...
        ];
        setBikes(mockBikes);
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