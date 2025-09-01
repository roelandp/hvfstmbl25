
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface LocationData {
  latitude: number;
  longitude: number;
  heading?: number;
}

interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceInterval?: number;
}

export function useLocation(options: UseLocationOptions = {}) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const headingSubscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const {
    enableHighAccuracy = false,
    timeout = 15000,
    maximumAge = 60000, // 1 minute cache
    distanceInterval = 10 // Only update every 10 meters
  } = options;

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Access',
          'Location access is needed to show your position on the map. You can enable it in your device settings.',
          [{ text: 'OK' }]
        );
      }
      
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      setHasPermission(false);
      return false;
    }
  };

  const startTracking = async () => {
    if (isTracking) return;

    const hasAccess = hasPermission ?? await requestPermissions();
    if (!hasAccess) return;

    try {
      setIsTracking(true);

      // Get initial position
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: enableHighAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
        timeout,
        maximumAge
      });

      setLocation({
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        heading: initialLocation.coords.heading || undefined
      });

      // Start watching position with battery-optimized settings
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: enableHighAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
          timeInterval: 30000, // Update every 30 seconds max
          distanceInterval, // Only update if moved specified distance
        },
        (newLocation) => {
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            heading: newLocation.coords.heading || undefined
          });
        }
      );

      // Watch heading separately for compass
      try {
        headingSubscriptionRef.current = await Location.watchHeadingAsync((headingData) => {
          setLocation(prev => prev ? {
            ...prev,
            heading: headingData.trueHeading || headingData.magHeading
          } : null);
        });
      } catch (headingError) {
        console.log('Heading not available on this device:', headingError);
      }

    } catch (error) {
      console.error('Error starting location tracking:', error);
      setIsTracking(false);
    }
  };

  const stopTracking = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    if (headingSubscriptionRef.current) {
      headingSubscriptionRef.current.remove();
      headingSubscriptionRef.current = null;
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return {
    location,
    hasPermission,
    isTracking,
    startTracking,
    stopTracking,
    requestPermissions
  };
}
