import { useState, useEffect, useRef } from 'react';

export type GeoStatus = 'idle' | 'pending' | 'granted' | 'denied' | 'unavailable';

export interface GeoPosition {
  lat: number;
  lon: number;
  accuracy: number; // meters
}

export function useGeolocation(): {
  position: GeoPosition | null;
  status: GeoStatus;
  request: () => void;
} {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [status, setStatus] = useState<GeoStatus>('idle');
  const watchIdRef = useRef<number | null>(null);

  const request = () => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      return;
    }
    setStatus('pending');
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setStatus('granted');
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable');
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { position, status, request };
}
