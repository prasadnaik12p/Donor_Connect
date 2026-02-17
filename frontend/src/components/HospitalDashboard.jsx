import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const HospitalDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [bedData, setBedData] = useState({
    generalBeds: { total: 0, occupied: 0 },
    icuBeds: { total: 0, occupied: 0 },
    ventilatorBeds: { total: 0, occupied: 0 },
    pediatricIcuBeds: { total: 0, occupied: 0 }
  })
  const [cashDonations, setCashDonations] = useState({})
  const navigate = useNavigate()

  const hospital = JSON.parse(localStorage.getItem('hospital') || '{}')
  const token = localStorage.getItem('hospitalToken')

  useEffect(() => {
    if (!token || !hospital.id) {
      navigate('/hospital-login')
      return
    }
    fetchDashboardData()
  }, [])

  // Initialize bed data and cash donations when dashboard data loads
  useEffect(() => {
    if (dashboardData?.bedData) {
      setBedData({
        generalBeds: { 
          total: dashboardData.bedData.generalBeds?.total || 0, 
          occupied: dashboardData.bedData.generalBeds?.occupied || 0 
        },
        icuBeds: { 
          total: dashboardData.bedData.icuBeds?.total || 0, 
          occupied: dashboardData.bedData.icuBeds?.occupied || 0 
        },
        ventilatorBeds: { 
          total: dashboardData.bedData.ventilatorBeds?.total || 0, 
          occupied: dashboardData.bedData.ventilatorBeds?.occupied || 0 
        },
        pediatricIcuBeds: { 
          total: dashboardData.bedData.pediatricIcuBeds?.total || 0, 
          occupied: dashboardData.bedData.pediatricIcuBeds?.occupied || 0 
        }
      })
    }

    // Initialize cash donations for each fund request
    if (dashboardData?.recentFundRequests) {
      const initialCashDonations = {}
      dashboardData.recentFundRequests.forEach(request => {
        initialCashDonations[request._id] = {
          amount: '',
          donorName: '',
          description: ''
        }
      })
      setCashDonations(initialCashDonations)
    }
  }, [dashboardData])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/hospitals/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setDashboardData(response.data);
      } else {
        console.error('Failed to fetch dashboard data:', response.data.message)
        alert('Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('hospitalToken')
        localStorage.removeItem('hospital')
        navigate('/hospital-login')
      } else {
        alert('Error loading dashboard: ' + (error.response?.data?.message || error.message))
      }
    } finally {
      setLoading(false)
    }
  }

  const updateBedAvailability = async () => {
    try {
      const response = await axios.put('/hospitals/update-beds', bedData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        alert('Bed availability updated successfully!')
        fetchDashboardData() // Refresh dashboard data
      } else {
        alert('Failed to update beds: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error updating beds:', error)
      alert('Failed to update bed availability: ' + (error.response?.data?.message || error.message))
    }
  }

  const requestBlood = async () => {
    const bloodGroup = prompt('Enter blood group required:')
    const units = prompt('Enter units required:')
    const patientName = prompt('Enter patient name:')

    if (bloodGroup && units && patientName) {
      try {
        const response = await axios.post('/hospitals/request-blood', {
          bloodGroup,
          unitsRequired: parseInt(units),
          patientName,
          urgency: 'high'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.data.success) {
          alert('Blood request sent to nearby donors!')
        } else {
          alert('Failed to send blood request: ' + response.data.message)
        }
      } catch (error) {
        console.error('Error requesting blood:', error)
        alert('Failed to send blood request: ' + (error.response?.data?.message || error.message))
      }
    }
  }

  const requestFund = async () => {
    const patientName = prompt('Enter patient name:')
    const patientId = prompt('Enter patient ID:')
    const amount = prompt('Enter amount required:')
    const purpose = prompt('Enter purpose:')

    if (patientName && patientId && amount && purpose) {
      try {
        const response = await axios.post('/hospitals/request-fund', {
          patientName,
          patientId,
          amountRequired: parseFloat(amount),
          purpose,
          contactInfo: { phone: hospital.phone, email: hospital.email }
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.data.success) {
          alert('Fund request created successfully!')
          fetchDashboardData() // Refresh to show new request
        } else {
          alert('Failed to create fund request: ' + response.data.message)
        }
      } catch (error) {
        console.error('Error creating fund request:', error)
        alert('Failed to create fund request: ' + (error.response?.data?.message || error.message))
      }
    }
  }

  const updateFundRequest = async (requestId) => {
    const request = dashboardData.recentFundRequests.find(req => req._id === requestId)
    
    // Only allow editing pending requests
    if (request.status !== 'Pending') {
      alert('Only pending fund requests can be edited.')
      return
    }

    const patientName = prompt('Enter updated patient name:', request.patientName)
    const patientId = prompt('Enter updated patient ID:', request.patientId)
    const amount = prompt('Enter updated amount required:', request.amountRequired)
    const purpose = prompt('Enter updated purpose:', request.purpose)

    if (patientName && patientId && amount && purpose) {
      try {
        const response = await axios.put(`/funds/${requestId}`, {
          patientName,
          patientId,
          amountRequired: parseFloat(amount),
          purpose
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.data.success) {
          alert('Fund request updated successfully!')
          fetchDashboardData() // Refresh dashboard data
        } else {
          alert('Failed to update fund request: ' + response.data.message)
        }
      } catch (error) {
        console.error('Error updating fund request:', error)
        const errorMessage = error.response?.data?.message || error.message
        alert('Failed to update fund request: ' + errorMessage)
      }
    }
  }

  const deleteFundRequest = async (requestId) => {
    const request = dashboardData.recentFundRequests.find(req => req._id === requestId)
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the fund request for ${request.patientName}? This action cannot be undone.`
    )
    
    if (confirmDelete) {
      try {
        const response = await axios.delete(`/funds/${requestId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.data.success) {
          alert('Fund request deleted successfully!')
          fetchDashboardData() // Refresh dashboard data
        } else {
          alert('Failed to delete fund request: ' + response.data.message)
        }
      } catch (error) {
        console.error('Error deleting fund request:', error)
        const errorMessage = error.response?.data?.message || error.message
        alert('Failed to delete fund request: ' + errorMessage)
      }
    }
  }

  // Handle cash donation input change
  const handleCashDonationChange = (requestId, field, value) => {
    setCashDonations(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [field]: value
      }
    }))
  }

  // Record cash donation
  const recordCashDonation = async (requestId) => {
    const request = dashboardData.recentFundRequests.find(req => req._id === requestId)
    const donation = cashDonations[requestId]
    
    if (!donation.amount || donation.amount <= 0) {
      alert('Please enter a valid donation amount.')
      return
    }

    if (!donation.donorName) {
      alert('Please enter donor name.')
      return
    }

    const remainingAmount = request.amountRequired - (request.amountCollected || 0)
    
    if (donation.amount > remainingAmount) {
      alert(`Cannot record donation of ₹${donation.amount}. Only ₹${remainingAmount} remaining to reach the required amount.`)
      return
    }

    const confirmRecord = window.confirm(
      `Record cash donation of ₹${donation.amount} from ${donation.donorName} for ${request.patientName}?`
    )

    if (confirmRecord) {
      try {
        const response = await axios.post(`/funds/${requestId}/cash-donation`, {
          amount: parseFloat(donation.amount),
          donorName: donation.donorName,
          description: donation.description || 'Cash donation received at hospital',
          receivedBy: hospital.name,
          receivedAt: new Date().toISOString()
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data.success) {
          alert('Cash donation recorded successfully!')
          // Reset the form
          setCashDonations(prev => ({
            ...prev,
            [requestId]: {
              amount: '',
              donorName: '',
              description: ''
            }
          }))
          fetchDashboardData() // Refresh to show updated amounts
        } else {
          alert('Failed to record cash donation: ' + response.data.message)
        }
      } catch (error) {
        console.error('Error recording cash donation:', error)
        const errorMessage = error.response?.data?.message || error.message
        alert('Failed to record cash donation: ' + errorMessage)
      }
    }
  }

  // Calculate progress percentage
  const calculateProgress = (request) => {
    const collected = request.amountCollected || 0
    const required = request.amountRequired
    return Math.min((collected / required) * 100, 100)
  }

  // Check if request is fully funded
  const isFullyFunded = (request) => {
    return (request.amountCollected || 0) >= request.amountRequired
  }

  const handleLogout = async () => {
    try {
      await axios.post('/hospitals/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('hospitalToken')
      localStorage.removeItem('hospital')
      navigate('/hospital-login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Hospital Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-600 mb-4 text-lg">Failed to load dashboard data</p>
          <button 
            onClick={fetchDashboardData} 
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const { hospital: hospitalData, stats, recentFundRequests, ambulances, bedData: currentBedData } = dashboardData

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-xl w-12 h-12 flex items-center justify-center shadow-lg">
                <span className="text-2xl text-blue-600">🏥</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{hospitalData.name}</h1>
                <p className="text-blue-100">{hospitalData.city}, {hospitalData.state}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                hospitalData.isApprovedByAdmin 
                  ? 'bg-green-100 text-green-800 shadow-sm' 
                  : 'bg-yellow-100 text-yellow-800 shadow-sm'
              }`}>
                {hospitalData.isApprovedByAdmin ? '✅ Approved' : '⏳ Pending Approval'}
              </span>
              {/* <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 hover:shadow-lg transition-all duration-300"
              >
                Logout
              </button> */}
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Stats Overview */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Available Beds Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-2">Available Beds</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.availableBeds}</h3>
                <p className="text-gray-500 text-sm mt-1">Total capacity</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🛏️</span>
              </div>
            </div>
          </div>

          {/* Active Fund Requests Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-green-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold mb-2">Active Fund Requests</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.activeFundRequests}</h3>
                <p className="text-gray-500 text-sm mt-1">Seeking support</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">💰</span>
              </div>
            </div>
          </div>

          {/* Ambulances Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold mb-2">Ambulances</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.approvedAmbulances}/{stats.totalAmbulances}</h3>
                <p className="text-gray-500 text-sm mt-1">Approved/Total</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🚑</span>
              </div>
            </div>
          </div>

          {/* Total Requests Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-red-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-semibold mb-2">Total Requests</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalFundRequests}</h3>
                <p className="text-gray-500 text-sm mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 p-2">
              {[
                { id: 'overview', label: 'Dashboard', icon: '📊' },
                { id: 'beds', label: 'Bed Management', icon: '🛏️' },
                { id: 'requests', label: 'Fund Requests', icon: '💰' },
                { id: 'ambulances', label: 'Ambulances', icon: '🚑' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Enhanced Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Fund Requests */}
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Recent Fund Requests</h3>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {recentFundRequests.length} Active
                      </span>
                    </div>
                    {recentFundRequests.length > 0 ? (
                      <div className="space-y-4">
                        {recentFundRequests.slice(0, 3).map((request) => {
                          const progress = calculateProgress(request)
                          const fullyFunded = isFullyFunded(request)
                          
                          return (
                            <div key={request._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{request.patientName}</p>
                                  <p className="text-lg font-bold text-green-600 mt-1">₹{request.amountRequired}</p>
                                  <p className="text-sm text-gray-600 mt-1">{request.purpose}</p>
                                  
                                  {/* Progress Bar */}
                                  <div className="mt-3">
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                      <span>Progress: {progress.toFixed(1)}%</span>
                                      <span>₹{request.amountCollected || 0} / ₹{request.amountRequired}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${
                                          fullyFunded ? 'bg-green-500' : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${progress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                  request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {fullyFunded ? '✅ Funded' : request.status}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">💸</span>
                        </div>
                        <p className="text-gray-500">No recent fund requests</p>
                      </div>
                    )}
                  </div>

                  {/* Ambulances */}
                  <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Hospital Ambulances</h3>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {ambulances.filter(a => a.status === 'available').length} Available
                      </span>
                    </div>
                    {ambulances.length > 0 ? (
                      <div className="space-y-4">
                        {ambulances.slice(0, 3).map((ambulance) => (
                          <div key={ambulance._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-gray-900">{ambulance.name}</p>
                                <p className="text-sm text-gray-600">{ambulance.driverName}</p>
                                <p className="text-xs text-gray-500">{ambulance.phone}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                ambulance.status === 'available' ? 'bg-green-100 text-green-800' :
                                ambulance.status === 'onDuty' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {ambulance.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">🚑</span>
                        </div>
                        <p className="text-gray-500">No ambulances registered</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={requestBlood}
                      className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">🩸</div>
                        <span className="font-semibold">Request Blood</span>
                      </div>
                    </button>
                    <button
                      onClick={requestFund}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">💰</div>
                        <span className="font-semibold">Create Fund Request</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('beds')}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">🛏️</div>
                        <span className="font-semibold">Update Beds</span>
                      </div>
                    </button>
                    <button
                      onClick={fetchDashboardData}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔄</div>
                        <span className="font-semibold">Refresh Data</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Current Bed Status */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Current Bed Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { type: 'generalBeds', label: 'General Beds', color: 'blue' },
                      { type: 'icuBeds', label: 'ICU Beds', color: 'red' },
                      { type: 'ventilatorBeds', label: 'Ventilator Beds', color: 'green' },
                      { type: 'pediatricIcuBeds', label: 'Pediatric ICU', color: 'purple' }
                    ].map((bed) => (
                      <div key={bed.type} className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                        <div className={`w-12 h-12 bg-${bed.color}-100 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                          <span className="text-lg">🛏️</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-2">{bed.label}</h4>
                        <div className="text-2xl font-bold text-blue-600">
                          {currentBedData[bed.type]?.available || 0}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Available</div>
                        <div className="text-xs text-gray-400 mt-2">
                          Total: {currentBedData[bed.type]?.total || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Bed Management Tab */}
            {activeTab === 'beds' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Bed Availability Management</h3>
                    <p className="text-gray-600">Update your hospital's bed capacity and occupancy</p>
                  </div>
                  <button
                    onClick={fetchDashboardData}
                    className="bg-gradient-to-r from-gray-500 to-gray-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Refresh Status
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[
                    { type: 'generalBeds', label: 'General Beds', icon: '🛏️', color: 'blue' },
                    { type: 'icuBeds', label: 'ICU Beds', icon: '💙', color: 'red' },
                    { type: 'ventilatorBeds', label: 'Ventilator Beds', icon: '🌬️', color: 'green' },
                    { type: 'pediatricIcuBeds', label: 'Pediatric ICU Beds', icon: '👶', color: 'purple' }
                  ].map((bed) => (
                    <div key={bed.type} className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-10 h-10 bg-${bed.color}-100 rounded-lg flex items-center justify-center`}>
                          <span className="text-lg">{bed.icon}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-lg">{bed.label}</h4>
                      </div>
                      
                      <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                        <div className="text-sm text-gray-600 mb-2">Current Status</div>
                        <div className="flex justify-between text-sm">
                          <span>Available: <strong>{currentBedData[bed.type]?.available || 0}</strong></span>
                          <span>Total: <strong>{currentBedData[bed.type]?.total || 0}</strong></span>
                          <span>Occupied: <strong>{currentBedData[bed.type]?.occupied || 0}</strong></span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Total Beds</label>
                          <input
                            type="number"
                            value={bedData[bed.type].total}
                            onChange={(e) => setBedData(prev => ({
                              ...prev,
                              [bed.type]: { ...prev[bed.type], total: parseInt(e.target.value) || 0 }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Occupied Beds</label>
                          <input
                            type="number"
                            value={bedData[bed.type].occupied}
                            onChange={(e) => setBedData(prev => ({
                              ...prev,
                              [bed.type]: { ...prev[bed.type], occupied: parseInt(e.target.value) || 0 }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-700 font-medium">
                          After update: <span className="text-lg">{Math.max(0, (bedData[bed.type].total || 0) - (bedData[bed.type].occupied || 0))}</span> beds available
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center pt-6">
                  <button
                    onClick={updateBedAvailability}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Update All Bed Availability
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced Fund Requests Tab with Cash Donation */}
            {activeTab === 'requests' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Fund Requests Management</h3>
                    <p className="text-gray-600">Create and manage patient fund requests</p>
                  </div>
                  <button
                    onClick={requestFund}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    + Create New Request
                  </button>
                </div>
                
                {recentFundRequests.length > 0 ? (
                  <div className="grid gap-6">
                    {recentFundRequests.map((request) => {
                      const progress = calculateProgress(request)
                      const remainingAmount = Math.max(0, request.amountRequired - (request.amountCollected || 0))
                      const fullyFunded = isFullyFunded(request)
                      
                      return (
                        <div key={request._id} className="bg-gradient-to-br from-white to-green-50 p-6 rounded-2xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                          {/* Request Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                  <span className="text-lg">💰</span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg text-gray-900">{request.patientName}</h4>
                                  <p className="text-sm text-gray-600">ID: {request.patientId}</p>
                                </div>
                              </div>
                              <p className="text-gray-700 mb-2">{request.purpose}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>Collected: ₹{request.amountCollected || 0}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {fullyFunded ? '✅ Fully Funded' : request.status}
                              </span>
                              <div className="mt-3">
                                <div className="text-2xl font-bold text-green-600">₹{request.amountRequired}</div>
                                <div className="text-sm text-gray-500">Required Amount</div>
                              </div>
                              {/* Update and Delete Buttons */}
                              <div className="flex space-x-2 mt-4">
                                <button
                                  onClick={() => updateFundRequest(request._id)}
                                  disabled={request.status !== 'Pending'}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                    request.status === 'Pending'
                                      ? 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                                  title={request.status !== 'Pending' ? 'Only pending requests can be edited' : 'Edit this request'}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteFundRequest(request._id)}
                                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 hover:shadow-md transition-all duration-300"
                                  title="Delete this request"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Progress: {progress.toFixed(1)}%</span>
                              <span>₹{request.amountCollected || 0} / ₹{request.amountRequired}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full ${
                                  fullyFunded ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            {fullyFunded && (
                              <div className="text-center mt-2">
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                  ✅ Fully Funded - No more donations needed
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Cash Donation Form */}
                          {!fullyFunded && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                              <h5 className="font-semibold text-gray-900 mb-3">Record Cash Donation</h5>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name *</label>
                                  <input
                                    type="text"
                                    value={cashDonations[request._id]?.donorName || ''}
                                    onChange={(e) => handleCashDonationChange(request._id, 'donorName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter donor name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                                  <input
                                    type="number"
                                    value={cashDonations[request._id]?.amount || ''}
                                    onChange={(e) => handleCashDonationChange(request._id, 'amount', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter amount"
                                    min="1"
                                    max={remainingAmount}
                                  />
                                  <div className="text-xs text-gray-500 mt-1">
                                    Max: ₹{remainingAmount}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                  <input
                                    type="text"
                                    value={cashDonations[request._id]?.description || ''}
                                    onChange={(e) => handleCashDonationChange(request._id, 'description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Optional description"
                                  />
                                </div>
                                <div className="flex items-end">
                                  <button
                                    onClick={() => recordCashDonation(request._id)}
                                    disabled={!cashDonations[request._id]?.amount || !cashDonations[request._id]?.donorName || cashDonations[request._id]?.amount > remainingAmount}
                                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300"
                                  >
                                    Record Cash
                                  </button>
                                </div>
                              </div>
                              {cashDonations[request._id]?.amount > remainingAmount && (
                                <div className="text-red-500 text-xs mt-2">
                                  Amount exceeds remaining requirement of ₹{remainingAmount}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">💸</span>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">No Fund Requests Yet</h4>
                    <p className="text-gray-600 mb-6">Create your first fund request to help patients in need</p>
                    <button
                      onClick={requestFund}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      Create Your First Fund Request
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Ambulances Tab */}
            {activeTab === 'ambulances' && (
              <div>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">Ambulance Management</h3>
                  <p className="text-gray-600">Manage your hospital's ambulance fleet</p>
                </div>
                
                {ambulances.length > 0 ? (
                  <div className="grid gap-6">
                    {ambulances.map((ambulance) => (
                      <div key={ambulance._id} className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-2xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                              <span className="text-2xl">🚑</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">{ambulance.name}</h4>
                              <p className="text-gray-600">{ambulance.driverName}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                <span>📞 {ambulance.phone}</span>
                                <span>•</span>
                                <span>Type: {ambulance.type}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex flex-col items-end space-y-2">
                              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                ambulance.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {ambulance.isApproved ? '✅ Approved' : '⏳ Pending'}
                              </span>
                              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                ambulance.status === 'available' ? 'bg-green-100 text-green-800' :
                                ambulance.status === 'onDuty' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {ambulance.status === 'available' ? '🟢 Available' :
                                 ambulance.status === 'onDuty' ? '🟡 On Duty' : '🔴 Unavailable'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">🚑</span>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">No Ambulances Registered</h4>
                    <p className="text-gray-600">Contact the admin to register ambulances for your hospital</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HospitalDashboard