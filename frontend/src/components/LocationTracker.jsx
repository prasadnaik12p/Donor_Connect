import { useEffect } from 'react';

const LocationTracker = ({ donorId }) => {
  useEffect(() => {
    if (!donorId) return;

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const coordinates = [
              position.coords.longitude,
              position.coords.latitude
            ];

            try {
              await fetch("/donors/location/update", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  donorId,
                  coordinates,
                }),
              });
              console.log('Location updated successfully');
            } catch (error) {
              console.error('Error updating location:', error);
            }
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }
    };

    // Update location immediately
    updateLocation();

    // Update location every 5 minutes
    const interval = setInterval(updateLocation, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [donorId]);

  return null;
};

export default LocationTracker;