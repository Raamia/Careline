'use client';

import { useState, useCallback } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  zipCode?: string;
  city?: string;
  state?: string;
}

interface GeolocationError {
  code: number;
  message: string;
}

export function useGeolocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GeolocationError | null>(null);

  const getLocation = useCallback(async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocoding to get ZIP code and city
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const geocodingData = await response.json();
        
        const locationData: LocationData = {
          latitude,
          longitude,
          zipCode: geocodingData.postcode || undefined,
          city: geocodingData.city || geocodingData.locality || undefined,
          state: geocodingData.principalSubdivision || undefined
        };
        
        setLocation(locationData);
        setLoading(false);
        return locationData;
        
      } catch (geocodingError) {
        console.warn('Reverse geocoding failed, using coordinates only:', geocodingError);
        
        const locationData: LocationData = {
          latitude,
          longitude
        };
        
        setLocation(locationData);
        setLoading(false);
        return locationData;
      }

    } catch (geoError: any) {
      const error: GeolocationError = {
        code: geoError.code || -1,
        message: getGeolocationErrorMessage(geoError.code || -1)
      };
      
      setError(error);
      setLoading(false);
      return null;
    }
  }, []);

  const getGeolocationErrorMessage = (code: number): string => {
    switch (code) {
      case 1:
        return 'Location access denied. Please enable location permissions.';
      case 2:
        return 'Location unavailable. Please check your connection.';
      case 3:
        return 'Location request timeout. Please try again.';
      default:
        return 'Unable to retrieve location. Please try again.';
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state === 'granted';
      }
      return true; // Assume permission if permissions API is not available
    } catch {
      return true; // Fallback to true if permission check fails
    }
  }, []);

  return {
    location,
    loading,
    error,
    getLocation,
    requestPermission,
    hasLocation: !!location
  };
}
