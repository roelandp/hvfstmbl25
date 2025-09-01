
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from '../utils/useLocation';

interface LocationContextType {
  location: { latitude: number; longitude: number; heading?: number } | null;
  showUserLocation: boolean;
  isTracking: boolean;
  hasPermission: boolean | null;
  toggleLocationTracking: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [showUserLocation, setShowUserLocation] = useState(false);
  
  const { location, hasPermission, isTracking, startTracking, stopTracking } = useLocation({
    distanceInterval: 20,
    enableHighAccuracy: false
  });

  const toggleLocationTracking = async () => {
    if (!showUserLocation) {
      console.log('Enabling global location tracking...');
      setShowUserLocation(true);
      await startTracking();
    } else {
      console.log('Disabling global location tracking...');
      setShowUserLocation(false);
      stopTracking();
    }
  };

  return (
    <LocationContext.Provider value={{
      location,
      showUserLocation,
      isTracking,
      hasPermission,
      toggleLocationTracking
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useGlobalLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useGlobalLocation must be used within a LocationProvider');
  }
  return context;
}
