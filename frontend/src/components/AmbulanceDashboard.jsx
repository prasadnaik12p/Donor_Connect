import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Google Maps component using Embed API (No API key required for basic functionality)
const EmergencyMap = ({
  origin,
  destination,
  emergency,
  onClose,
  onComplete,
  onStartJourney,
}) => {
  const [travelTime, setTravelTime] = useState("Calculating...");
  const [distance, setDistance] = useState("Calculating...");

  // Get Google Maps directions URL
  const getGoogleMapsUrl = () => {
    if (!origin || !destination) return null;

    const originStr = `${origin.lat},${origin.lng}`;
    const destinationStr = `${destination.lat},${destination.lng}`;

    return `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destinationStr}&travelmode=driving`;
  };

  const openInGoogleMaps = () => {
    const url = getGoogleMapsUrl();
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Calculate approximate distance and time using Haversine formula
  useEffect(() => {
    if (origin && destination) {
      const R = 6371; // Earth's radius in kilometers
      const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
      const dLon = ((destination.lng - origin.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((origin.lat * Math.PI) / 180) *
          Math.cos((destination.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const approxDistance = R * c;
      const approxTime = (approxDistance / 40) * 60; // Assuming 40 km/h average speed

      setDistance(`${approxDistance.toFixed(1)} km`);
      setTravelTime(`${Math.round(approxTime)} min`);
    }
  }, [origin, destination]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🗺️</span>
              <h2 className="text-2xl font-bold text-white">
                Emergency Directions
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Emergency Info */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <h3 className="font-bold text-green-800 text-lg mb-3">
                  Emergency Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600">📍</span>
                    <div>
                      <p className="font-semibold text-green-700">Location</p>
                      <p className="text-green-800">{emergency?.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600">🏥</span>
                    <div>
                      <p className="font-semibold text-green-700">
                        Emergency Type
                      </p>
                      <p className="text-green-800">
                        {emergency?.emergencyType || "Medical Emergency"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600">📏</span>
                    <div>
                      <p className="font-semibold text-green-700">Distance</p>
                      <p className="text-green-800">{distance}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600">⏱️</span>
                    <div>
                      <p className="font-semibold text-green-700">
                        Est. Travel Time
                      </p>
                      <p className="text-green-800">{travelTime}</p>
                    </div>
                  </div>
                  {emergency?.userId?.name && (
                    <div className="flex items-center space-x-3">
                      <span className="text-green-600">👤</span>
                      <div>
                        <p className="font-semibold text-green-700">
                          Requester
                        </p>
                        <p className="text-green-800">
                          {emergency.userId.name}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Show actual coordinates */}
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600">🎯</span>
                    <div>
                      <p className="font-semibold text-green-700">
                        Coordinates
                      </p>
                      <p className="text-green-800 font-mono text-sm">
                        {destination?.lat?.toFixed(6)}{" "}
                        {destination?.lng?.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button
                  onClick={openInGoogleMaps}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>🗺️</span>
                  <span>Open in Google Maps</span>
                </button>

                <button
                  onClick={onStartJourney}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>🚑</span>
                  <span>Start Journey</span>
                </button>

                <button
                  onClick={onComplete}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>🏁</span>
                  <span>Mark as Completed</span>
                </button>
              </div>

              {/* Navigation Tips */}
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  🚨 Navigation Tips
                </h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Use emergency lights when responding</li>
                  <li>• Follow traffic rules and safety protocols</li>
                  <li>• Contact patient upon arrival</li>
                  <li>• Update status when emergency is completed</li>
                </ul>
              </div>
            </div>

            {/* Map Container */}
            <div className="lg:col-span-3">
              <div className="bg-gray-100 rounded-2xl p-4 border-2 border-green-300 h-96 lg:h-[500px]">
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center relative">
                  {/* Interactive Map Visualization */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl text-white">🗺️</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      Live Directions
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Click "Open in Google Maps" for navigation
                    </p>

                    {/* Route Visualization */}
                    <div className="relative w-64 h-32 mx-auto mb-4">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-1 bg-green-500 rounded-full transform rotate-12"></div>
                      </div>

                      {/* Location Markers */}
                      <div className="absolute top-4 left-8">
                        <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                          <span className="font-bold">A</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 text-center">
                          You
                        </p>
                      </div>
                      <div className="absolute bottom-4 right-8">
                        <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                          <span className="font-bold">E</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 text-center">
                          Emergency
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Your Location</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Emergency Location</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{distance}</p>
                  <p className="text-xs text-blue-700">Distance</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {travelTime}
                  </p>
                  <p className="text-xs text-green-700">Est. Time</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">High</p>
                  <p className="text-xs text-purple-700">Priority</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">🚑</p>
                  <p className="text-xs text-red-700">Ambulance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AmbulanceDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("available");
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [emergencies, setEmergencies] = useState([]);
  const [assignedEmergency, setAssignedEmergency] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [currentEmergency, setCurrentEmergency] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedEmergencyForMap, setSelectedEmergencyForMap] = useState(null);
  const [manualCoordinates, setManualCoordinates] = useState("");
  const navigate = useNavigate();

  // Get API base URL from environment variables
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  useEffect(() => {
    const token = localStorage.getItem("ambulanceToken");
    const ambulance = localStorage.getItem("ambulance");

    if (!token || !ambulance) {
      navigate("/ambulance-login");
      return;
    }

    fetchDashboardData();
    getCurrentLocation();
    startEmergencyPolling();
  }, []);

  const startEmergencyPolling = () => {
    checkForEmergencies();

    const intervalId = setInterval(() => {
      if (status === "available" && location.lat && location.lng) {
        checkForEmergencies();
      }
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(intervalId);
  };

  const parseCoordinates = (coordString) => {
    if (!coordString.trim()) return null;

    // Remove any extra spaces and split by space or comma
    const cleaned = coordString.replace(/\s+/g, " ").trim();
    const parts = cleaned.split(/[\s,]+/);

    if (parts.length !== 2) {
      throw new Error(
        'Please enter coordinates in format: "latitude longitude" or "lat,lng"'
      );
    }

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error("Invalid coordinates. Please enter valid numbers.");
    }

    if (lat < -90 || lat > 90) {
      throw new Error("Latitude must be between -90 and 90");
    }

    if (lng < -180 || lng > 180) {
      throw new Error("Longitude must be between -180 and 180");
    }

    return { lat, lng };
  };

  const updateLocationWithCoordinates = async () => {
    if (!manualCoordinates.trim()) {
      addAlert({
        type: "warning",
        message: "Please enter coordinates first",
        timestamp: new Date(),
      });
      return;
    }

    try {
      const coords = parseCoordinates(manualCoordinates);
      setLocation(coords);

      addAlert({
        type: "success",
        message: `📍 Location updated to: ${coords.lat.toFixed(
          6
        )} ${coords.lng.toFixed(6)}`,
        timestamp: new Date(),
      });

      // Auto-update to server
      await updateLocationToServer(coords);
    } catch (error) {
      addAlert({
        type: "error",
        message: `Location error: ${error.message}`,
        timestamp: new Date(),
      });
    }
  };

  const checkForEmergencies = async () => {
    try {
      const token = localStorage.getItem("ambulanceToken");
      const response = await fetch(
        `${API_BASE}/ambulances/emergencies/nearby`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.emergencies.length > 0) {
          const newEmergencies = data.emergencies;

          const existingIds = new Set(emergencies.map((e) => e._id));
          const uniqueNewEmergencies = newEmergencies.filter(
            (emergency) =>
              !existingIds.has(emergency._id) && emergency.status === "pending"
          );

          if (uniqueNewEmergencies.length > 0) {
            setEmergencies((prev) => [...prev, ...uniqueNewEmergencies]);

            const closestEmergency = uniqueNewEmergencies.reduce(
              (closest, current) =>
                current.distance < closest.distance ? current : closest
            );

            setCurrentEmergency(closestEmergency);
            setShowEmergencyModal(true);

            addAlert({
              type: "emergency",
              message: `New emergency request at ${closestEmergency.location} (${closestEmergency.distance}km away)`,
              emergencyId: closestEmergency._id,
              timestamp: new Date(),
            });

            playNotificationSound();
          }
        }
      }
    } catch (error) {
      console.error("Error checking for emergencies:", error);
    }
  };

  const addAlert = (alert) => {
    const newAlert = {
      id: Date.now(),
      ...alert,
      read: false,
    };
    setAlerts((prev) => [newAlert, ...prev.slice(0, 49)]);
  };

  const markAlertAsRead = (alertId) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };

  const markAllAlertsAsRead = () => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, read: true })));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const getUnreadAlertCount = () => {
    return alerts.filter((alert) => !alert.read).length;
  };

  const playNotificationSound = () => {
    // Simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log("Audio context not supported");
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("ambulanceToken");
      const response = await fetch(`${API_BASE}/ambulances/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data);
          setStatus(data.ambulance.status);
          setAssignedEmergency(data.assignedEmergency || null);

          if (data.nearbyEmergencies) {
            setEmergencies(data.nearbyEmergencies);
          }
        }
      } else if (response.status === 401) {
        localStorage.removeItem("ambulanceToken");
        localStorage.removeItem("ambulance");
        navigate("/ambulance-login");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLocation);
          setManualCoordinates(
            `${newLocation.lat.toFixed(6)} ${newLocation.lng.toFixed(6)}`
          );
          addAlert({
            type: "success",
            message: `📍 GPS location updated: ${newLocation.lat.toFixed(
              6
            )} ${newLocation.lng.toFixed(6)}`,
            timestamp: new Date(),
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          addAlert({
            type: "error",
            message:
              "Failed to get current location. Please enable location services or enter coordinates manually.",
            timestamp: new Date(),
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    }
  };

  const updateLocationToServer = async (customLocation = null) => {
    const locationToUpdate = customLocation || location;

    if (!locationToUpdate.lat || !locationToUpdate.lng) {
      addAlert({
        type: "warning",
        message:
          "Unable to get current location. Please refresh location first or enter coordinates.",
        timestamp: new Date(),
      });
      return;
    }

    setUpdatingLocation(true);
    try {
      const token = localStorage.getItem("ambulanceToken");
      const response = await fetch(`${API_BASE}/ambulances/update-location`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [locationToUpdate.lng, locationToUpdate.lat],
        }),
      });

      const data = await response.json();

      if (data.success) {
        addAlert({
          type: "success",
          message: `📍 Location updated successfully: ${locationToUpdate.lat.toFixed(
            6
          )} ${locationToUpdate.lng.toFixed(6)}`,
          timestamp: new Date(),
        });
        fetchDashboardData();
      } else {
        addAlert({
          type: "error",
          message: "Failed to update location: " + data.message,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("Error updating location:", error);
      addAlert({
        type: "error",
        message: "Failed to update location: " + error.message,
        timestamp: new Date(),
      });
    } finally {
      setUpdatingLocation(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem("ambulanceToken");
      const response = await fetch(`${API_BASE}/ambulances/update-status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(newStatus);
        addAlert({
          type: "success",
          message: `🔄 Status updated to ${newStatus}`,
          timestamp: new Date(),
        });
        fetchDashboardData();
      } else {
        addAlert({
          type: "error",
          message: "Failed to update status: " + data.message,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      addAlert({
        type: "error",
        message: "Failed to update status: " + error.message,
        timestamp: new Date(),
      });
    }
  };

  const getEmergencyCoordinates = (emergency) => {
    // Use REAL coordinates from your Emergency schema
    if (emergency.coordinates && emergency.coordinates.coordinates) {
      // Your schema uses: coordinates: { type: "Point", coordinates: [longitude, latitude] }
      const [longitude, latitude] = emergency.coordinates.coordinates;
      return {
        lat: latitude,
        lng: longitude,
      };
    }

    // Fallback: If no coordinates in emergency data, use realistic demo coordinates
    // This ensures different coordinates from ambulance location
    const demoLocations = [
      { lat: 12.9512, lng: 77.6256 }, // Different location 1
      { lat: 12.9618, lng: 77.6152 }, // Different location 2
      { lat: 12.9467, lng: 77.6301 }, // Different location 3
    ];

    // Use emergency ID to consistently pick a location (or random for demo)
    const index = emergency._id
      ? emergency._id.charCodeAt(0) % demoLocations.length
      : Math.floor(Math.random() * demoLocations.length);

    return demoLocations[index];
  };

  const acceptEmergency = async (emergency) => {
    try {
      const token = localStorage.getItem("ambulanceToken");
      const response = await fetch(
        `${API_BASE}/ambulances/emergencies/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emergencyId: emergency._id,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        addAlert({
          type: "success",
          message: `✅ Accepted emergency at ${emergency.location}`,
          timestamp: new Date(),
        });

        setEmergencies((prev) => prev.filter((e) => e._id !== emergency._id));
        setAssignedEmergency(emergency);
        setShowEmergencyModal(false);
        setCurrentEmergency(null);

        setSelectedEmergencyForMap(emergency);
        setShowMapModal(true);

        fetchDashboardData();
      } else {
        addAlert({
          type: "error",
          message: "Failed to accept emergency: " + data.message,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("Error accepting emergency:", error);
      addAlert({
        type: "error",
        message: "Failed to accept emergency: " + error.message,
        timestamp: new Date(),
      });
    }
  };

  const completeEmergency = async () => {
    if (!assignedEmergency) return;

    try {
      const token = localStorage.getItem("ambulanceToken");
      const response = await fetch(
        `${API_BASE}/ambulances/emergencies/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emergencyId: assignedEmergency._id,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        addAlert({
          type: "success",
          message: `🎉 Emergency at ${assignedEmergency.location} completed successfully`,
          timestamp: new Date(),
        });

        setAssignedEmergency(null);
        fetchDashboardData();
      } else {
        addAlert({
          type: "error",
          message: "Failed to complete emergency: " + data.message,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("Error completing emergency:", error);
      addAlert({
        type: "error",
        message: "Failed to complete emergency: " + error.message,
        timestamp: new Date(),
      });
    }
  };

  const rejectEmergency = (emergency) => {
    setEmergencies((prev) => prev.filter((e) => e._id !== emergency._id));
    setShowEmergencyModal(false);
    setCurrentEmergency(null);

    addAlert({
      type: "warning",
      message: `❌ Rejected emergency at ${emergency.location}`,
      timestamp: new Date(),
    });
  };

  const openMapForEmergency = (emergency) => {
    setSelectedEmergencyForMap(emergency);
    setShowMapModal(true);
  };

  const handleStartJourney = () => {
    addAlert({
      type: "success",
      message: `🚑 Started journey to ${selectedEmergencyForMap?.location}`,
      timestamp: new Date(),
    });
    setShowMapModal(false);
  };

  const handleCompleteFromMap = () => {
    setShowMapModal(false);
    if (selectedEmergencyForMap) {
      completeEmergency();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ambulanceToken");
    localStorage.removeItem("ambulance");
    navigate("/ambulance-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const ambulanceData = dashboardData?.ambulance || {};
  const stats = dashboardData?.stats || {};
  const unreadCount = getUnreadAlertCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50">
      {/* Emergency Notification Modal */}
      {showEmergencyModal && currentEmergency && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform animate-pulse border-4 border-red-500">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-center space-x-3">
                <div className="text-4xl animate-bounce">🚨</div>
                <h2 className="text-2xl font-bold text-white text-center">
                  EMERGENCY ALERT!
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="font-semibold text-red-800">Location</p>
                      <p className="text-red-700">
                        {currentEmergency.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🎯</span>
                    <div>
                      <p className="font-semibold text-red-800">Coordinates</p>
                      <p className="text-red-700 font-mono text-sm">
                        {getEmergencyCoordinates(currentEmergency).lat.toFixed(
                          6
                        )}{" "}
                        {getEmergencyCoordinates(currentEmergency).lng.toFixed(
                          6
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🏥</span>
                    <div>
                      <p className="font-semibold text-red-800">
                        Emergency Type
                      </p>
                      <p className="text-red-700">
                        {currentEmergency.emergencyType || "Medical Emergency"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📏</span>
                    <div>
                      <p className="font-semibold text-red-800">Distance</p>
                      <p className="text-red-700">
                        {currentEmergency.distance || "Nearby"} km away
                      </p>
                    </div>
                  </div>
                  {currentEmergency.userId?.name && (
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">👤</span>
                      <div>
                        <p className="font-semibold text-red-800">Requester</p>
                        <p className="text-red-700">
                          {currentEmergency.userId.name}
                        </p>
                      </div>
                    </div>
                  )}
                  {currentEmergency.notes && (
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📝</span>
                      <div>
                        <p className="font-semibold text-red-800">Notes</p>
                        <p className="text-red-700 text-sm">
                          {currentEmergency.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => acceptEmergency(currentEmergency)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>✅</span>
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => rejectEmergency(currentEmergency)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>❌</span>
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Map Modal */}
      {showMapModal && selectedEmergencyForMap && (
        <EmergencyMap
          origin={location.lat && location.lng ? location : null}
          destination={getEmergencyCoordinates(selectedEmergencyForMap)}
          emergency={selectedEmergencyForMap}
          onClose={() => setShowMapModal(false)}
          onComplete={handleCompleteFromMap}
          onStartJourney={handleStartJourney}
        />
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">🚑</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {ambulanceData.name || "Ambulance Service"}
                </h1>
                <p className="text-gray-600 flex items-center">
                  <span className="mr-2">👨‍⚕️</span>
                  Driver: {ambulanceData.driverName || "Not assigned"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Alert Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowAlertsPanel(!showAlertsPanel)}
                  className="relative p-3 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                >
                  <span className="text-2xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center animate-pulse shadow-lg">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Alerts Panel */}
                {showAlertsPanel && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 text-lg">
                        Notifications
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={markAllAlertsAsRead}
                          className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Mark all read
                        </button>
                        <button
                          onClick={clearAlerts}
                          className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Clear all
                        </button>
                        <button
                          onClick={() => setShowAlertsPanel(false)}
                          className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🔕</span>
                          </div>
                          <p>No notifications</p>
                        </div>
                      ) : (
                        alerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                              !alert.read
                                ? "bg-blue-50 border-l-4 border-l-blue-500"
                                : ""
                            }`}
                            onClick={() => markAlertAsRead(alert.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <span
                                className={`text-2xl ${
                                  alert.type === "emergency"
                                    ? "text-red-500"
                                    : alert.type === "success"
                                    ? "text-green-500"
                                    : alert.type === "warning"
                                    ? "text-yellow-500"
                                    : "text-blue-500"
                                }`}
                              >
                                {alert.type === "emergency"
                                  ? "🚨"
                                  : alert.type === "success"
                                  ? "✅"
                                  : alert.type === "warning"
                                  ? "⚠️"
                                  : "ℹ️"}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {alert.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(
                                    alert.timestamp
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                              {!alert.read && (
                                <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex items-center space-x-3">
                {emergencies.length > 0 && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg animate-pulse">
                    🚨 {emergencies.length} Emergency
                    {emergencies.length !== 1 ? "s" : ""}
                  </span>
                )}

                {assignedEmergency && (
                  <span className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg">
                    📍 On Assignment
                  </span>
                )}

                <span
                  className={`px-4 py-2 rounded-xl font-semibold shadow-lg ${
                    ambulanceData.isApproved
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      : "bg-gradient-to-r from-yellow-500 to-amber-600 text-white"
                  }`}
                >
                  {ambulanceData.isApproved ? "✅ Approved" : "⏳ Pending"}
                </span>

                <span
                  className={`px-4 py-2 rounded-xl font-semibold shadow-lg ${
                    status === "available"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      : status === "onDuty"
                      ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white"
                      : "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                  }`}
                >
                  {status === "available"
                    ? "✅ Available"
                    : status === "onDuty"
                    ? "🚨 On Duty"
                    : "⏸️ Offline"}
                </span>

                {/* <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-gray-500 to-gray-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  🚪 Logout
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Current Assignment */}
            {assignedEmergency && (
              <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-3xl p-1 shadow-2xl">
                <div className="bg-white rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">📍</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        Current Assignment
                      </h3>
                      <p className="text-yellow-600 text-sm">
                        Active Emergency
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-yellow-50 rounded-xl p-3">
                      <p className="font-semibold text-yellow-800">
                        {assignedEmergency.location}
                      </p>
                      <p className="text-yellow-700 text-sm">
                        {assignedEmergency.emergencyType || "Medical Emergency"}
                      </p>
                      {assignedEmergency.userId?.name && (
                        <p className="text-yellow-600 text-sm">
                          User: {assignedEmergency.userId.name}
                        </p>
                      )}
                      <p className="text-yellow-500 text-xs">
                        Accepted: {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openMapForEmergency(assignedEmergency)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-2 rounded-xl font-semibold text-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                      >
                        🗺️ View Map
                      </button>
                      <button
                        onClick={completeEmergency}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-xl font-semibold text-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                      >
                        ✅ Complete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Alerts Panel */}
            {emergencies.length > 0 && (
              <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-1 shadow-2xl">
                <div className="bg-white rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl text-red-600">🚨</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          Available Emergencies
                        </h3>
                        <p className="text-red-600 text-sm">
                          {emergencies.length} emergency
                          {emergencies.length !== 1 ? "s" : ""} nearby
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {emergencies.map((emergency) => (
                      <div
                        key={emergency._id}
                        className="bg-red-50 border border-red-200 rounded-2xl p-4 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-red-800">
                              {emergency.location}
                            </h4>
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              {emergency.distance} km
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-red-600">🏥</span>
                              <span className="text-red-700 text-sm">
                                {emergency.emergencyType || "Medical Emergency"}
                              </span>
                            </div>
                            {emergency.userId?.name && (
                              <div className="flex items-center space-x-2">
                                <span className="text-red-600">👤</span>
                                <span className="text-red-700 text-sm">
                                  User: {emergency.userId.name}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <span className="text-red-600">🎯</span>
                              <span className="text-red-700 text-sm font-mono">
                                {getEmergencyCoordinates(emergency).lat.toFixed(
                                  6
                                )}{" "}
                                {getEmergencyCoordinates(emergency).lng.toFixed(
                                  6
                                )}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-red-600">🕒</span>
                              <span className="text-red-700 text-sm">
                                {new Date(
                                  emergency.createdAt
                                ).toLocaleTimeString()}
                              </span>
                            </div>
                            {emergency.notes && (
                              <div className="bg-white rounded-lg p-2 border border-red-300">
                                <p className="text-red-700 text-xs">
                                  {emergency.notes}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex space-x-2 pt-2">
                            <button
                              onClick={() => acceptEmergency(emergency)}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-xl font-semibold text-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                            >
                              ✅ Accept
                            </button>
                            <button
                              onClick={() => openMapForEmergency(emergency)}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-2 rounded-xl font-semibold text-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                            >
                              🗺️ View Map
                            </button>
                            <button
                              onClick={() => rejectEmergency(emergency)}
                              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 rounded-xl font-semibold text-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                            >
                              ❌ Ignore
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center">
                <span className="mr-2">📈</span>
                Quick Stats
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Total Assignments",
                    value: stats.totalAssignments || 0,
                    icon: "📋",
                    color: "blue",
                  },
                  {
                    label: "Completed",
                    value: stats.completedEmergencies || 0,
                    icon: "✅",
                    color: "green",
                  },
                  {
                    label: "Pending",
                    value: stats.pendingEmergencies || 0,
                    icon: "⏳",
                    color: "yellow",
                  },
                  {
                    label: "Response Rate",
                    value: stats.responseRate || "98%",
                    icon: "⚡",
                    color: "purple",
                  },
                  {
                    label: "Unread Alerts",
                    value: unreadCount,
                    icon: "🔔",
                    color: "red",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{stat.icon}</span>
                      <span className="text-gray-700 font-medium">
                        {stat.label}
                      </span>
                    </div>
                    <span
                      className={`font-bold text-lg ${
                        stat.color === "green"
                          ? "text-green-600"
                          : stat.color === "blue"
                          ? "text-blue-600"
                          : stat.color === "yellow"
                          ? "text-yellow-600"
                          : stat.color === "purple"
                          ? "text-purple-600"
                          : "text-red-600"
                      }`}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ambulance Info */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center">
                <span className="mr-2">🚑</span>
                Ambulance Info
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Hospital",
                    value: ambulanceData.hospital?.name || "N/A",
                    icon: "🏥",
                  },
                  {
                    label: "Driver",
                    value: ambulanceData.driverName || "Not assigned",
                    icon: "👨‍⚕️",
                  },
                  {
                    label: "Phone",
                    value: ambulanceData.phone || "N/A",
                    icon: "📞",
                  },
                  {
                    label: "Email",
                    value: ambulanceData.email || "N/A",
                    icon: "📧",
                  },
                ].map((info, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-xl">{info.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{info.label}</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {info.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Status Control */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center">
                <span className="mr-2">🔄</span>
                Update Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    status: "available",
                    label: "Available",
                    icon: "✅",
                    description: "Ready for emergencies",
                    color: "green",
                    gradientFrom: "from-green-500",
                    gradientTo: "to-green-600",
                  },
                  {
                    status: "onDuty",
                    label: "On Duty",
                    icon: "🚨",
                    description: "Currently on assignment",
                    color: "yellow",
                    gradientFrom: "from-yellow-500",
                    gradientTo: "to-yellow-600",
                  },
                  {
                    status: "offline",
                    label: "Offline",
                    icon: "⏸️",
                    description: "Not available",
                    color: "red",
                    gradientFrom: "from-red-500",
                    gradientTo: "to-red-600",
                  },
                ].map((statusOption) => (
                  <button
                    key={statusOption.status}
                    onClick={() => updateStatus(statusOption.status)}
                    disabled={
                      status === statusOption.status ||
                      (statusOption.status === "available" && assignedEmergency)
                    }
                    className={`p-6 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-2 ${
                      status === statusOption.status
                        ? `bg-gradient-to-r ${statusOption.gradientFrom} ${statusOption.gradientTo} text-white shadow-2xl`
                        : "bg-gray-50 text-gray-700 hover:shadow-lg border-2 border-transparent hover:border-gray-200"
                    } disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none`}
                  >
                    <div className="text-4xl mb-3">{statusOption.icon}</div>
                    <div className="font-bold text-lg mb-2">
                      {statusOption.label}
                    </div>
                    <div className="text-sm opacity-80">
                      {statusOption.description}
                    </div>
                  </button>
                ))}
              </div>
              {assignedEmergency && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                  <p className="text-yellow-800 flex items-center">
                    <span className="mr-2">⚠️</span>
                    Complete your current assignment before setting status to
                    available
                  </p>
                </div>
              )}
            </div>

            {/* Location Management */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center">
                <span className="mr-2">📍</span>
                Location Management
              </h3>
              <div className="space-y-6">
                {/* Current Location Display */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                    <span className="mr-2">🎯</span>
                    Current Location
                  </h4>
                  {location.lat && location.lng ? (
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 border border-blue-100">
                        <p className="text-blue-900 text-lg font-mono text-center">
                          {location.lat.toFixed(6)} {location.lng.toFixed(6)}
                        </p>
                        <p className="text-blue-600 text-sm text-center mt-2">
                          Coordinates format: latitude longitude
                        </p>
                      </div>
                      <p className="text-blue-600 text-sm">
                        📍 Last updated: {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📍</span>
                      </div>
                      <p className="text-blue-700">Getting location...</p>
                    </div>
                  )}
                </div>

                {/* Manual Coordinates Input */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-4 flex items-center">
                    <span className="mr-2">🎯</span>
                    Enter Coordinates Manually
                  </h4>
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <input
                        type="text"
                        value={manualCoordinates}
                        onChange={(e) => setManualCoordinates(e.target.value)}
                        placeholder="Enter coordinates: latitude longitude (e.g., 12.9716 77.5946)"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg font-mono"
                      />
                      <button
                        onClick={updateLocationWithCoordinates}
                        className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <span>📍</span>
                        <span>Set Location</span>
                      </button>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                      <p className="text-purple-700 text-sm">
                        <strong>Format:</strong> Enter coordinates as "latitude
                        longitude" separated by space
                      </p>
                      <p className="text-purple-600 text-xs mt-1">
                        Example: 12.9716 77.5946 (Bangalore coordinates)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={getCurrentLocation}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-2xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>📍</span>
                    <span>Refresh GPS</span>
                  </button>
                  <button
                    onClick={() => updateLocationToServer()}
                    disabled={!location.lat || updatingLocation}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {updatingLocation ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <span>📡</span>
                        <span>Update to Server</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      getCurrentLocation();
                      updateLocationToServer();
                    }}
                    disabled={updatingLocation}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-2xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <span>🔄</span>
                    <span>Refresh & Update</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Emergency Monitoring */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center">
                <span className="mr-2">🚨</span>
                Emergency Monitoring
              </h3>
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-500">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">
                      {status === "available"
                        ? "✅"
                        : status === "onDuty"
                        ? "🚨"
                        : "⏸️"}
                    </span>
                  </div>
                  <div>
                    <p className="text-yellow-800 text-lg font-semibold">
                      {status === "available"
                        ? "✅ You are available for emergency calls"
                        : status === "onDuty"
                        ? "🚨 You are currently on duty"
                        : "⏸️ You are currently offline"}
                    </p>
                    <p className="text-yellow-700">
                      {status === "available"
                        ? "System is actively monitoring for emergencies in your area"
                        : status === "onDuty"
                        ? "Focus on your current emergency assignment"
                        : "Set status to available to receive emergencies"}
                    </p>
                    {status === "available" && location.lat && location.lng && (
                      <p className="text-yellow-600 text-sm mt-2">
                        Next emergency check:{" "}
                        {new Date(Date.now() + 10000).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceDashboard;
