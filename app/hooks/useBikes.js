'use client';
import { useContext } from 'react';
import { BikeContext } from '../context/BikeContext';

export function useBikes() {
  const context = useContext(BikeContext);
  
  if (context === undefined) {
    throw new Error('useBikes must be used within a BikeProvider');
  }
  
  return context;
}