import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Ambulance = ({ user }) => {
  const [ambulances, setAmbulances] = useState([])
  const [loading, setLoading] = useState(false)
  const [emergencyLoading, setEmergencyLoading] = useState(false)
  const [location, setLocation] = useState({ lat: null, lng: null })
  const [searchType, setSearchType] = useState('auto')
  const [manualCity, setManualCity] = useState('')
  const [manualCoordinates, setManualCoordinates] = useState('')
  const [locationError, setLocationError] = useState('')
  const [emergencyCreated, setEmergencyCreated] = useState(false)
  const [currentEmergency, setCurrentEmergency] = useState(null)
  const [emergencyStatus, setEmergencyStatus] = useState('')
  const [statusInterval, setStatusInterval] = useState(null)
  const [selectedAmbulance, setSelectedAmbulance] = useState(null)
  const [checks, setChecks] = useState(0)

  useEffect(() => {
    if (searchType === 'auto') {
      getCurrentLocation()
    }
    
    return () => {
      if (statusInterval) {
        clearInterval(statusInterval)
      }
    }
  }, [searchType])

  const getCurrentLocation = () => {
    setLocationError('')
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLocationError('')
        },
        (error) => {
          console.error('Error getting location:', error)
          let errorMessage = 'Unable to get your location. '
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access or use manual search.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information unavailable. Use manual search.'
              break
            case error.TIMEOUT:
              errorMessage += 'Location request timed out. Please try again.'
              break
            default:
              errorMessage += 'An unknown error occurred.'
          }
          setLocationError(errorMessage)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      setLocationError('Geolocation is not supported by this browser. Use manual search.')
    }
  }

  const parseCoordinates = (coordString) => {
    if (!coordString.trim()) return null
    
    // Remove any extra spaces and split by space or comma
    const cleaned = coordString.replace(/\s+/g, ' ').trim()
    const parts = cleaned.split(/[\s,]+/)
    
    if (parts.length !== 2) {
      throw new Error('Please enter coordinates in format: "latitude longitude" or "lat,lng"')
    }
    
    const lat = parseFloat(parts[0])
    const lng = parseFloat(parts[1])
    
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid coordinates. Please enter valid numbers.')
    }
    
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90')
    }
    
    if (lng < -180 || lng > 180) {
      throw new Error('Longitude must be between -180 and 180')
    }
    
    return { lat, lng }
  }

  const fetchNearbyAmbulances = async () => {
    setLoading(true)
    setAmbulances([])

    try {
      let params = {}
      
      if (searchType === 'auto' && location.lat && location.lng) {
        params = {
          lng: location.lng,
          lat: location.lat,
          radius: 10000
        }
      } else if (searchType === 'manual' && manualCity.trim()) {
        params = {
          city: manualCity.trim()
        }
      } else if (searchType === 'coordinates' && manualCoordinates.trim()) {
        try {
          const coords = parseCoordinates(manualCoordinates)
          params = {
            lng: coords.lng,
            lat: coords.lat,
            radius: 10000
        }
        } catch (error) {
          alert(error.message)
          setLoading(false)
          return
        }
      } else if (searchType === 'all') {
        params = {}
      } else {
        alert('Please provide location information')
        setLoading(false)
        return
      }

      const response = await axios.get('/ambulances/nearby', { params })
      
      if (response.data.success) {
        setAmbulances(response.data.ambulances || [])
        if (response.data.ambulances.length === 0) {
          alert('No ambulances found in your area. Try expanding search or using manual location.')
        }
      } else {
        alert('Failed to fetch ambulances: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error fetching ambulances:', error)
      alert('Failed to fetch nearby ambulances: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Success tone sequence
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log('Audio not supported')
    }
  }

  const createEmergencyRequest = async () => {
    if (!user) {
      alert('Please login to trigger emergency')
      return
    }

    let emergencyLocation = ''
    let emergencyCoords = { lat: 0, lng: 0 }

    if (searchType === 'auto') {
      if (!location.lat || !location.lng) {
        await getCurrentLocation()
        if (!location.lat || !location.lng) {
          alert('Unable to get your location. Please use manual search or allow location access.')
          return
        }
      }
      emergencyLocation = `${location.lat.toFixed(6)} ${location.lng.toFixed(6)}`
      emergencyCoords = { lat: location.lat, lng: location.lng }
    } else if (searchType === 'manual') {
      if (!manualCity.trim()) {
        alert('Please enter a city name')
        return
      }
      emergencyLocation = `${manualCity} (manual search)`
      // For manual city search, we'll use default coordinates or geocode in real app
      emergencyCoords = { lat: 0, lng: 0 }
    } else if (searchType === 'coordinates') {
      if (!manualCoordinates.trim()) {
        alert('Please enter coordinates')
        return
      }
      try {
        const coords = parseCoordinates(manualCoordinates)
        emergencyLocation = `${coords.lat.toFixed(6)} ${coords.lng.toFixed(6)}`
        emergencyCoords = coords
      } catch (error) {
        alert(error.message)
        return
      }
    }

    setEmergencyLoading(true)
    try {
      const emergencyData = {
        userId: user.id,
        location: emergencyLocation,
        coordinates: emergencyCoords,
        emergencyType: 'Medical Emergency',
        notes: 'User requested emergency assistance through the app'
      }

      const response = await axios.post('/emergencies/create', emergencyData)
      
      if (response.data.success) {
        setEmergencyCreated(true)
        setCurrentEmergency(response.data.emergency)
        setEmergencyStatus('searching')
        setChecks(0)
        
        await fetchNearbyAmbulances()
        
        alert(`🚨 Emergency request created successfully! 
        
Emergency ID: ${response.data.emergency._id}
Location: ${emergencyData.location}

Searching for available ambulances... You will be notified immediately when one accepts.`)

        checkEmergencyStatus(response.data.emergency._id)
      } else {
        alert('Failed to create emergency: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error creating emergency:', error)
      alert('Failed to create emergency request: ' + (error.response?.data?.message || error.message))
    } finally {
      setEmergencyLoading(false)
    }
  }

  const checkEmergencyStatus = async (emergencyId) => {
    let checkCount = 0
    const maxChecks = 60 // 3 minutes total with 3-second intervals
    let lastStatus = 'searching'
    
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/emergencies/status/${emergencyId}`)
        
        if (response.data.success) {
          const emergency = response.data.emergency
          
          // Only update if status changed
          if (emergency.status !== lastStatus) {
            lastStatus = emergency.status
            setEmergencyStatus(emergency.status)
            
            if (emergency.status === 'assigned' && emergency.assignedAmbulance) {
              clearInterval(interval)
              setStatusInterval(null)
              
              // Create a more prominent notification
              const ambulance = emergency.assignedAmbulance
              const notificationMessage = `
🎉 EMERGENCY ACCEPTED!

AMBULANCE DETAILS:
🚑 ${ambulance.name}
👨‍⚕️ Driver: ${ambulance.driverName}
📞 Phone: ${ambulance.phone}
📍 Status: On the way to your location

Estimated arrival time: ${Math.round(emergency.estimatedTime || 10)} minutes

Stay calm and wait for the ambulance to arrive. Keep your phone accessible.
              `.trim()
              
              alert(notificationMessage)
              
              // Update current emergency with assigned ambulance
              setCurrentEmergency(emergency)
              
              // Play success sound
              playSuccessSound()
            }
          }
          
          // Show timeout warning at 2 minutes
          if (checkCount === 40) { // 2 minutes
            alert('⚠️ Still searching for available ambulances. If no ambulance responds within 1 minute, please try again or call emergency services directly.')
          }
        }
        
        checkCount++
        setChecks(checkCount)
        
        if (checkCount >= maxChecks) {
          clearInterval(interval)
          setEmergencyStatus('timeout')
          setStatusInterval(null)
          
          const timeoutMessage = `
⏰ EMERGENCY REQUEST TIMEOUT

No ambulances were available to accept your emergency request.

Please:
1. Try creating a new emergency request
2. Contact emergency services directly
3. Try expanding your search area

We apologize for the inconvenience.
          `.trim()
          
          alert(timeoutMessage)
        }
      } catch (error) {
        console.error('Error checking emergency status:', error)
        checkCount++
        setChecks(checkCount)
        
        // Show error after multiple failures
        if (checkCount % 10 === 0) {
          console.log('Connection issues while checking emergency status')
        }
        
        if (checkCount >= maxChecks) {
          clearInterval(interval)
          setStatusInterval(null)
        }
      }
    }, 1000) // Check every 3 seconds instead of 10
    
    setStatusInterval(interval)
  }

  const handleSearchTypeChange = (type) => {
    setSearchType(type)
    setAmbulances([])
    setManualCity('')
    setManualCoordinates('')
    setLocationError('')
    setEmergencyCreated(false)
    setCurrentEmergency(null)
    setEmergencyStatus('')
    setSelectedAmbulance(null)
    setChecks(0)
    
    // Clear any existing interval
    if (statusInterval) {
      clearInterval(statusInterval)
      setStatusInterval(null)
    }
  }

  const getLocationDisplay = () => {
    if (searchType === 'auto' && location.lat && location.lng) {
      return `${location.lat.toFixed(6)} ${location.lng.toFixed(6)}`
    } else if (searchType === 'manual' && manualCity) {
      return manualCity
    } else if (searchType === 'coordinates' && manualCoordinates) {
      return manualCoordinates
    } else {
      return 'Unknown location'
    }
  }

  const contactAmbulance = (ambulance) => {
    setSelectedAmbulance(ambulance)
    if (currentEmergency) {
      alert(`Contacting ${ambulance.driverName} about your emergency...\n\nAmbulance: ${ambulance.name}\nPhone: ${ambulance.phone}\nEmergency ID: ${currentEmergency._id}`)
    } else {
      alert(`Contacting ${ambulance.driverName} at ${ambulance.phone}...`)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200'
      case 'onDuty': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'offline': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return '🟢'
      case 'onDuty': return '🟡'
      case 'offline': return '🔴'
      default: return '⚪'
    }
  }

  const handleCoordinatesExample = () => {
    setManualCoordinates('12.9716 77.5946')
    alert('Example coordinates for Bangalore added! Format: "latitude longitude"')
  }

  const getProgressPercentage = () => {
    return Math.min(100, (checks / 60) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">🚑</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Emergency Ambulance Services</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Quick access to nearby ambulances and emergency medical assistance
          </p>
        </div>

        {/* Emergency Alert Section */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Emergency Assistance</h2>
                <p className="text-red-100 text-lg">
                  <strong>Current Location:</strong> {getLocationDisplay()}
                </p>
              </div>
              <div className="text-6xl animate-pulse">🚨</div>
            </div>
            
            {emergencyCreated && currentEmergency && (
              <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-6 backdrop-blur-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    emergencyStatus === 'searching' ? 'bg-yellow-400' :
                    emergencyStatus === 'assigned' ? 'bg-green-400' :
                    emergencyStatus === 'timeout' ? 'bg-red-400' :
                    'bg-blue-400'
                  }`}></div>
                  <p className="font-semibold">
                    {emergencyStatus === 'searching' ? '🔍 Searching for available ambulances...' :
                     emergencyStatus === 'assigned' ? '✅ Ambulance assigned!' :
                     emergencyStatus === 'timeout' ? '⏰ No ambulances available' :
                     '🕒 Waiting for ambulance response...'}
                  </p>
                </div>
                <p className="text-red-100 text-sm mb-2">
                  ID: {currentEmergency._id}
                  {emergencyStatus === 'assigned' && currentEmergency.assignedAmbulance && (
                    <span> • Assigned to: {currentEmergency.assignedAmbulance.name}</span>
                  )}
                </p>
                
                {/* Progress indicator */}
                {emergencyStatus === 'searching' && (
                  <div className="mt-2">
                    <div className="bg-white bg-opacity-30 rounded-full h-2 mb-1">
                      <div 
                        className="bg-green-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                    <p className="text-red-100 text-xs text-center">
                      Searching... {Math.round(getProgressPercentage())}% • Time remaining: {Math.round((60 - checks) * 3 / 60)} min
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={createEmergencyRequest}
              disabled={!user || emergencyLoading || 
                (searchType === 'manual' && !manualCity.trim()) ||
                (searchType === 'coordinates' && !manualCoordinates.trim())}
              className="bg-white text-red-600 px-12 py-4 rounded-xl text-xl font-bold hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl w-full md:w-auto"
            >
              {emergencyLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Emergency...</span>
                </div>
              ) : (
                  <>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🚨</span>
                  <span className='text-black'>Trigger Emergency / Get Update</span>
                  </div>
                  </>
              )}
            </button>
            
            
            {!user && (
              <p className="text-red-500 mt-4 text-center bg-white bg-opacity-20 rounded-lg p-3">
                🔒 Please login to use emergency services
              </p>
            )}
          </div>
        </div>

        {/* Search Options */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Ambulances</h2>
          
          {/* Search Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { type: 'auto', icon: '📍', title: 'Auto Location', desc: 'Use device GPS', color: 'blue' },
              { type: 'manual', icon: '🏙️', title: 'City Search', desc: 'Enter city name', color: 'green' },
              { type: 'coordinates', icon: '🎯', title: 'Coordinates', desc: 'Enter coordinates', color: 'purple' },
              { type: 'all', icon: '🌍', title: 'All Available', desc: 'Show all ambulances', color: 'gray' }
            ].map((option) => (
              <button
                key={option.type}
                onClick={() => handleSearchTypeChange(option.type)}
                className={`p-6 rounded-xl border-2 text-left transition-all duration-300 transform hover:scale-105 ${
                  searchType === option.type 
                    ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700 shadow-lg` 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="text-3xl mb-3">{option.icon}</div>
                <div className="font-semibold text-lg mb-1">{option.title}</div>
                <div className="text-gray-600 text-sm">{option.desc}</div>
              </button>
            ))}
          </div>

          {/* Location Input */}
          <div className="mb-8">
            {searchType === 'auto' && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h3 className="font-semibold text-blue-900 text-lg">📍 Your Current Location</h3>
                  <button
                    onClick={getCurrentLocation}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span>🔄</span>
                    <span>Refresh Location</span>
                  </button>
                </div>
                {location.lat && location.lng ? (
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-blue-800 font-medium text-center text-lg">
                      {location.lat.toFixed(6)} {location.lng.toFixed(6)}
                    </p>
                    <p className="text-blue-600 text-sm text-center mt-2">
                      Coordinates format: latitude longitude
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">Requesting location access...</p>
                  </div>
                )}
                {locationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <p className="text-red-700 text-sm">{locationError}</p>
                  </div>
                )}
              </div>
            )}

            {searchType === 'manual' && (
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="font-semibold text-green-900 text-lg mb-4">🏙️ Search by City</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    placeholder="Enter city name (e.g., Mumbai, Delhi, Bangalore)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setManualCity('')}
                      className="bg-gray-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors duration-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {searchType === 'coordinates' && (
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-purple-900 text-lg">🎯 Enter Coordinates</h3>
                  <button
                    onClick={handleCoordinatesExample}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200 text-sm"
                  >
                    Show Example
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <input
                      type="text"
                      value={manualCoordinates}
                      onChange={(e) => setManualCoordinates(e.target.value)}
                      placeholder="Enter coordinates: latitude longitude (e.g., 12.9716 77.5946)"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg font-mono"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setManualCoordinates('')}
                        className="bg-gray-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors duration-200"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <p className="text-purple-700 text-sm">
                      <strong>Format:</strong> Enter coordinates as "latitude longitude" separated by space
                    </p>
                    <p className="text-purple-600 text-xs mt-1">
                      Example: 12.9716 77.5946 (Bangalore coordinates)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {searchType === 'all' && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">All Available Ambulances</h3>
                    <p className="text-gray-700">Showing all available ambulances regardless of location</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Controls */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={fetchNearbyAmbulances}
              disabled={loading || 
                (searchType === 'manual' && !manualCity.trim()) ||
                (searchType === 'coordinates' && !manualCoordinates.trim())}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Find Ambulances</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => setAmbulances([])}
              className="bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500 transition-all duration-300 transform hover:scale-105"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Results Header */}
        {ambulances.length > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Found {ambulances.length} Ambulance{ambulances.length !== 1 ? 's' : ''}
                </h3>
                <p className="text-green-100">
                  {searchType === 'auto' && 'Available near your location'}
                  {searchType === 'manual' && `Available in ${manualCity}`}
                  {searchType === 'coordinates' && 'Available near specified coordinates'}
                  {searchType === 'all' && 'Available across all locations'}
                </p>
              </div>
              <div className="text-4xl">🎉</div>
            </div>
            {emergencyCreated && (
              <div className="bg-white bg-opacity-20 rounded-lg p-3 mt-4">
                <p className="text-green-100 text-sm">
                  These ambulances have been notified of your emergency request
                </p>
              </div>
            )}
          </div>
        )}

        {/* Ambulances Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {ambulances.map((ambulance) => (
            <div key={ambulance._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🚑</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{ambulance.name}</h3>
                      <p className="text-gray-500 text-sm">{ambulance.type || 'Medical Ambulance'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ambulance.status)}`}>
                    {getStatusIcon(ambulance.status)} {ambulance.status}
                  </span>
                </div>
                
                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <span className="w-5">👨‍⚕️</span>
                    <span className="flex-1">
                      <strong>Driver:</strong> {ambulance.driverName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <span className="w-5">📞</span>
                    <span className="flex-1">
                      <strong>Phone:</strong> {ambulance.phone}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <span className="w-5">🏥</span>
                    <span className="flex-1">
                      <strong>Hospital:</strong> {ambulance.hospital?.name || 'Independent'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <span className="w-5">📍</span>
                    <span className="flex-1">
                      <strong>Location:</strong> {ambulance.hospital?.city || ambulance.city || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {ambulance.status === 'available' && user && (
                  <div className="space-y-3">
                    <button
                      onClick={() => contactAmbulance(ambulance)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <span>📞</span>
                      <span>Contact Ambulance</span>
                    </button>
                    
                    {!emergencyCreated && (
                      <button
                        onClick={() => {
                          alert(`Direct emergency alert sent to ${ambulance.name}! They will contact you shortly.`)
                          createEmergencyRequest()
                        }}
                        className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-500 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                      >
                        <span>🚨</span>
                        <span>Emergency Alert</span>
                      </button>
                    )}
                  </div>
                )}

                {ambulance.status !== 'available' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                    <p className="text-yellow-800 font-medium">
                      {ambulance.status === 'onDuty' ? '🚗 Currently on duty' : '🔴 Currently offline'}
                    </p>
                    <p className="text-yellow-700 text-sm mt-1">
                      {ambulance.status === 'onDuty' ? 'This ambulance is currently serving another emergency' : 'This ambulance is not available at the moment'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {ambulances.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🚑</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchType === 'auto' ? 'No ambulances found nearby' :
               searchType === 'manual' ? 'No ambulances found in this city' :
               searchType === 'coordinates' ? 'No ambulances found near these coordinates' :
               'No ambulances currently available'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Try changing your search criteria, expanding the search radius, or contact emergency services directly.
            </p>
            <button
              onClick={getCurrentLocation}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Refresh Location
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchType === 'auto' ? 'Searching for ambulances near you...' :
               searchType === 'manual' ? `Searching in ${manualCity}...` :
               searchType === 'coordinates' ? 'Searching near coordinates...' :
               'Loading all available ambulances...'}
            </h3>
            <p className="text-gray-600">Please wait while we find the best options for you</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Ambulance