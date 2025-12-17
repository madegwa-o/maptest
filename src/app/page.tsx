"use client"

import {useEffect, useState} from "react";

interface MyPosition {
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  longitude: number;
  latitude: number;
}

export default function MapPage() {
  const [timestamp, setTimestamp] = useState<number>(0);
  const [currentPosition, setCurrentPosition] = useState<MyPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
          console.log("Position updated: ", position);
          setCurrentPosition(position.coords);
          setTimestamp(position.timestamp);
          setError(null);
        },
        (err) => {
          console.error("Geolocation error: ", err);
          setError(err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
    );

    // Cleanup function to stop watching when component unmounts
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []); // Empty dependency array - only run once on mount

  return (
      <div style={{ padding: '20px' }}>
        <h1>Location Tracker</h1>

        {error && (
            <div style={{ color: 'red' }}>
              <p>Error: {error}</p>
            </div>
        )}

        {timestamp > 0 && (
            <div>
              <p><strong>Last Updated:</strong> {new Date(timestamp).toLocaleTimeString()}</p>
            </div>
        )}

        {currentPosition ? (
            <div>
              <h2>Current Position:</h2>
              <p><strong>Latitude:</strong> {currentPosition.latitude.toFixed(6)}</p>
              <p><strong>Longitude:</strong> {currentPosition.longitude.toFixed(6)}</p>
              <p><strong>Accuracy:</strong> {currentPosition.accuracy?.toFixed(2)} meters</p>
              <p><strong>Altitude:</strong> {currentPosition.altitude?.toFixed(2) ?? 'N/A'} meters</p>
              <p><strong>Speed:</strong> {currentPosition.speed?.toFixed(2) ?? 'N/A'} m/s</p>
              <p><strong>Heading:</strong> {currentPosition.heading?.toFixed(2) ?? 'N/A'}°</p>
            </div>
        ) : (
            <p>Waiting for location data...</p>
        )}
      </div>
  )
}