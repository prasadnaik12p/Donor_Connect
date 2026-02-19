import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [allData, setAllData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [pendingHospitals, setPendingHospitals] = useState([])
  const [pendingAmbulances, setPendingAmbulances] = useState([])
  const [emergencies, setEmergencies] = useState([])
  const navigate = useNavigate()

  const admin = JSON.parse(localStorage.getItem('admin') || '{}')
  const token = localStorage.getItem('adminToken')

  useEffect(() => {
    if (!token) {
      navigate('/admin-login')
      return
    }
    fetchDashboardData()
    fetchPendingApprovals()
    fetchEmergencies()
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, allDataResponse] = await Promise.all([
        axios.get("/admin/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/admin/dashboard/all-data", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDashboardData(statsResponse.data);
      setAllData(allDataResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        navigate("/admin-login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const [hospitalsResponse, ambulancesResponse] = await Promise.all([
        axios.get("/admin/hospitals/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/admin/ambulances/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setPendingHospitals(hospitalsResponse.data.hospitals || []);
      setPendingAmbulances(ambulancesResponse.data.ambulances || []);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
    }
  };

  const fetchEmergencies = async () => {
    try {
      const response = await axios.get("/admin/emergencies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmergencies(response.data.emergencies || []);
    } catch (error) {
      console.error("Error fetching emergencies:", error);
    }
  };

  // Handle Hospital Approval
  const handleHospitalApproval = async (hospitalId, action) => {
    try {
      if (action === "approve") {
        await axios.post(
          `/admin/hospitals/approve/${hospitalId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        alert("Hospital approved successfully!");
      } else {
        await axios.delete(`/admin/hospitals/reject/${hospitalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Hospital rejected successfully!");
      }
      fetchPendingApprovals();
      fetchDashboardData();
    } catch (error) {
      console.error(`Error ${action}ing hospital:`, error);
      alert(
        `Failed to ${action} hospital: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  // Handle Ambulance Approval
  const handleAmbulanceApproval = async (ambulanceId, action) => {
    try {
      if (action === "approve") {
        await axios.post(
          `/admin/ambulances/approve/${ambulanceId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        alert("Ambulance approved successfully!");
      } else {
        await axios.delete(`/admin/ambulances/reject/${ambulanceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Ambulance rejected successfully!");
      }
      fetchPendingApprovals();
      fetchDashboardData();
    } catch (error) {
      console.error(`Error ${action}ing ambulance:`, error);
      alert(
        `Failed to ${action} ambulance: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  // Handle Emergency Acceptance with Google Maps
  const handleEmergencyAccept = async (emergencyId, coordinates, location) => {
    try {
      const response = await axios.post(
        `/admin/emergencies/${emergencyId}/assign`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        openGoogleMaps(coordinates, location);
        alert(`🚑 Emergency assigned successfully! Opening Google Maps...`);
        fetchEmergencies();
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Error accepting emergency:", error);
      alert(
        `Failed to accept emergency: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  // Open Google Maps with destination coordinates
  const openGoogleMaps = (coordinates, location) => {
    const { lat, lng } = coordinates;

    if (lat && lng) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
      window.open(mapsUrl, "_blank");
    } else {
      const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
      window.open(searchUrl, "_blank");
    }
  };

  // Get current location and navigate to emergency
  const navigateToEmergencyLocation = async (
    emergencyId,
    coordinates,
    location,
  ) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${coordinates.lat},${coordinates.lng}&travelmode=driving`;
          window.open(mapsUrl, "_blank");
          handleEmergencyAccept(emergencyId, coordinates, location);
        },
        (error) => {
          console.error("Error getting current location:", error);
          openGoogleMaps(coordinates, location);
        },
      );
    } else {
      openGoogleMaps(coordinates, location);
    }
  };

  // const handleLogout = () => {
  //   localStorage.removeItem('adminToken')
  //   localStorage.removeItem('admin')
  //   navigate('/admin-login')
  // }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-600 font-medium">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!dashboardData || !allData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-600 text-lg font-semibold">
            Failed to load dashboard data
          </p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats } = dashboardData;
  const { hospitals, ambulances, fundRequests } = allData;

  const statsCards = [
    {
      title: "Total Hospitals",
      value: stats.totalHospitals,
      pending: stats.pendingHospitals,
      icon: "🏥",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Total Ambulances",
      value: stats.totalAmbulances,
      pending: stats.pendingAmbulances,
      icon: "🚑",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderColor: "border-green-200"
    },
    {
      title: "Fund Requests",
      value: stats.totalFundRequests,
      icon: "💰",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Active Emergencies",
      value: stats.activeEmergencies || emergencies.filter(e => e.status === 'pending').length,
      icon: "🩸",
      color: "from-red-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-red-50 to-orange-50",
      borderColor: "border-red-200"
    }
  ]

  const tabs = [
    { id: 'overview', name: 'Dashboard', icon: '📊' },
    { id: 'approvals', name: 'Pending Approvals', icon: '⏳' },
    { id: 'hospitals', name: 'Hospitals', icon: '🏥' },
    { id: 'ambulances', name: 'Ambulances', icon: '🚑' },
    { id: 'emergencies', name: 'Emergencies', icon: '🚨' },
    { id: 'requests', name: 'All Requests', icon: '📋' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-blue-100">System Control Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-white font-semibold">Welcome back,</p>
                <p className="text-blue-100">{admin.name || 'Administrator'}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-bold text-lg">
                  {admin.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              {/* <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
              >
                🚪 Logout
              </button> */}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Overview - Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <div 
              key={index}
              className={`${card.bgColor} border-2 ${card.borderColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">{card.title}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${card.color}">
                    {card.value}
                  </p>
                  {card.pending !== undefined && (
                    <p className="text-amber-600 text-sm font-medium mt-2">
                      ⏳ {card.pending} pending
                    </p>
                  )}
                </div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl text-white">{card.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 py-5 px-8 text-center font-semibold text-sm capitalize whitespace-nowrap transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-600 border-b-2 border-purple-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Hospitals */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Recent Hospitals</h3>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {hospitals.length} total
                      </span>
                    </div>
                    <div className="space-y-4">
                      {hospitals.slice(0, 5).map((hospital) => (
                        <div key={hospital._id} className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">{hospital.name}</p>
                              <p className="text-sm text-gray-600">{hospital.city}, {hospital.state}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              hospital.isApprovedByAdmin 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {hospital.isApprovedByAdmin ? '✅ Approved' : '⏳ Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Ambulances */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Recent Ambulances</h3>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {ambulances.length} total
                      </span>
                    </div>
                    <div className="space-y-4">
                      {ambulances.slice(0, 5).map((ambulance) => (
                        <div key={ambulance._id} className="bg-white rounded-xl p-4 shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">{ambulance.name}</p>
                              <p className="text-sm text-gray-600">{ambulance.driverName}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              ambulance.isApproved 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {ambulance.isApproved ? '✅ Approved' : '⏳ Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setActiveTab('approvals')}
                      className="bg-white rounded-xl p-4 text-left hover:shadow-md transition-all border-2 border-purple-200 hover:border-purple-300"
                    >
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                        <span className="text-xl">⏳</span>
                      </div>
                      <p className="font-semibold text-gray-900">Pending Approvals</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {pendingHospitals.length + pendingAmbulances.length} waiting
                      </p>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('emergencies')}
                      className="bg-white rounded-xl p-4 text-left hover:shadow-md transition-all border-2 border-red-200 hover:border-red-300"
                    >
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                        <span className="text-xl">🚨</span>
                      </div>
                      <p className="font-semibold text-gray-900">Active Emergencies</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {emergencies.filter(e => e.status === 'pending').length} urgent
                      </p>
                    </button>
                    
                    <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                        <span className="text-xl">📈</span>
                      </div>
                      <p className="font-semibold text-gray-900">System Health</p>
                      <p className="text-sm text-green-600 mt-1">All systems operational</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Approvals Tab */}
            {activeTab === 'approvals' && (
              <div className="space-y-8">
                {/* Pending Hospitals */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border-2 border-yellow-200">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Pending Hospital Approvals</h3>
                      <p className="text-amber-600 mt-2">Review and approve new hospital registrations</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-bold">
                      ⏳ {pendingHospitals.length} waiting approval
                    </span>
                  </div>
                  
                  {pendingHospitals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {pendingHospitals.map((hospital) => (
                        <div key={hospital._id} className="bg-white rounded-xl p-6 shadow-lg border-2 border-yellow-200 hover:shadow-xl transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                  <span className="text-xl">🏥</span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg text-gray-900">{hospital.name}</h4>
                                  <p className="text-blue-600 text-sm">📍 {hospital.city}, {hospital.state}</p>
                                </div>
                              </div>
                              <div className="space-y-2 text-sm text-gray-600">
                                <p>📧 {hospital.email}</p>
                                <p>📞 {hospital.phone}</p>
                                <p>🏛️ Registration: {hospital.registrationNumber}</p>
                                <p className="text-xs bg-gray-100 p-2 rounded-lg">{hospital.address}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-3 mt-6">
                            <button
                              onClick={() => handleHospitalApproval(hospital._id, 'approve')}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleHospitalApproval(hospital._id, 'reject')}
                              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-12 text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🎉</span>
                      </div>
                      <p className="text-green-800 text-xl font-bold">All Clear!</p>
                      <p className="text-green-600 mt-2">No pending hospital approvals at the moment.</p>
                    </div>
                  )}
                </div>

                {/* Pending Ambulances */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border-2 border-yellow-200">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Pending Ambulance Approvals</h3>
                      <p className="text-amber-600 mt-2">Review and approve new ambulance registrations</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-bold">
                      ⏳ {pendingAmbulances.length} waiting approval
                    </span>
                  </div>
                  
                  {pendingAmbulances.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {pendingAmbulances.map((ambulance) => (
                        <div key={ambulance._id} className="bg-white rounded-xl p-6 shadow-lg border-2 border-yellow-200 hover:shadow-xl transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                  <span className="text-xl">🚑</span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg text-gray-900">{ambulance.name}</h4>
                                  <p className="text-green-600 text-sm">👨‍💼 {ambulance.driverName}</p>
                                </div>
                              </div>
                              <div className="space-y-2 text-sm text-gray-600">
                                <p>📧 {ambulance.email}</p>
                                <p>📞 {ambulance.phone}</p>
                                <p>🏥 Hospital ID: {ambulance.hospital}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-3 mt-6">
                            <button
                              onClick={() => handleAmbulanceApproval(ambulance._id, 'approve')}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleAmbulanceApproval(ambulance._id, 'reject')}
                              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-12 text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🎉</span>
                      </div>
                      <p className="text-green-800 text-xl font-bold">All Clear!</p>
                      <p className="text-green-600 mt-2">No pending ambulance approvals at the moment.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Emergencies Tab */}
            {activeTab === 'emergencies' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">🚨 Active Emergency Requests</h3>
                      <p className="text-red-600 mt-2">Immediate action required for these emergencies</p>
                    </div>
                    <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-bold">
                      🔴 {emergencies.filter(e => e.status === 'pending').length} active emergencies
                    </span>
                  </div>

                  {emergencies.filter(e => e.status === 'pending').length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {emergencies
                        .filter(emergency => emergency.status === 'pending')
                        .map((emergency) => (
                          <div key={emergency._id} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-200 hover:shadow-xl transition-all">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <span className="text-xl">🚨</span>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-lg text-red-900">Emergency Alert</h4>
                                    <p className="text-red-600 text-sm">📍 {emergency.location}</p>
                                  </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
                                  <p><strong>User ID:</strong> {emergency.userId}</p>
                                  <p><strong>Type:</strong> {emergency.emergencyType}</p>
                                  <p><strong>Coordinates:</strong> {emergency.coordinates?.lat?.toFixed(6) || 'N/A'}, {emergency.coordinates?.lng?.toFixed(6) || 'N/A'}</p>
                                  <p><strong>Time:</strong> {new Date(emergency.createdAt).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-3 mt-6">
                              <button
                                onClick={() => navigateToEmergencyLocation(
                                  emergency._id, 
                                  emergency.coordinates, 
                                  emergency.location
                                )}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-4 rounded-xl hover:shadow-lg transition-all duration-300 font-bold text-lg"
                              >
                                🚑 Accept & Navigate
                              </button>
                              <button
                                onClick={() => handleEmergencyAccept(
                                  emergency._id, 
                                  emergency.coordinates, 
                                  emergency.location
                                )}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-4 rounded-xl hover:shadow-lg transition-all duration-300 font-bold"
                              >
                                📍 View on Maps
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-12 text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✅</span>
                      </div>
                      <p className="text-green-800 text-xl font-bold">All Clear!</p>
                      <p className="text-green-600 mt-2">No active emergency requests at the moment.</p>
                    </div>
                  )}
                </div>

                {/* Completed Emergencies */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">✅ Recently Completed Emergencies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {emergencies
                      .filter(emergency => emergency.status === 'assigned')
                      .slice(0, 4)
                      .map((emergency) => (
                        <div key={emergency._id} className="bg-white rounded-xl p-4 border-2 border-green-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-green-800">Assigned to Ambulance</p>
                              <p className="text-sm text-green-600">{emergency.location}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(emergency.updatedAt).toLocaleString()}
                              </p>
                            </div>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                              ✅ Assigned
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Hospitals Tab */}
            {activeTab === 'hospitals' && (
              <div className="bg-white rounded-2xl p-6 border-2 border-blue-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">🏥 All Registered Hospitals</h3>
                  <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold">
                    {hospitals.length} hospitals
                  </span>
                </div>
                <div className="overflow-x-auto rounded-2xl border-2 border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-50 to-cyan-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Hospital</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {hospitals.map((hospital) => (
                        <tr key={hospital._id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-blue-600">🏥</span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{hospital.name}</div>
                                <div className="text-sm text-gray-500">{hospital.registrationNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {hospital.city}, {hospital.state}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{hospital.email}</div>
                            <div>{hospital.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              hospital.isApprovedByAdmin 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {hospital.isApprovedByAdmin ? '✅ Approved' : '⏳ Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(hospital.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ambulances Tab */}
            {activeTab === 'ambulances' && (
              <div className="bg-white rounded-2xl p-6 border-2 border-green-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">🚑 All Registered Ambulances</h3>
                  <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold">
                    {ambulances.length} ambulances
                  </span>
                </div>
                <div className="overflow-x-auto rounded-2xl border-2 border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Ambulance</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Driver</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Approval</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {ambulances.map((ambulance) => (
                        <tr key={ambulance._id} className="hover:bg-green-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-green-600">🚑</span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{ambulance.name}</div>
                                <div className="text-sm text-gray-500">ID: {ambulance._id.slice(-6)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {ambulance.driverName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{ambulance.email}</div>
                            <div>{ambulance.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              ambulance.status === 'available' ? 'bg-green-100 text-green-800' :
                              ambulance.status === 'onDuty' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {ambulance.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              ambulance.isApproved 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {ambulance.isApproved ? '✅ Approved' : '⏳ Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">💰 Fund Requests Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fundRequests.slice(0, 9).map((request) => (
                      <div key={request._id} className="bg-white rounded-xl p-5 shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{request.patientName}</h4>
                            <p className="text-purple-600 text-sm font-medium mt-1">Purpose: {request.purpose}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p className="flex justify-between">
                            <span>Amount Required:</span>
                            <span className="font-bold text-purple-600">₹{request.amountRequired}</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Amount Raised:</span>
                            <span className="font-bold text-green-600">₹{request.amountRaised || 0}</span>
                          </p>
                          {request.hospital?.name && (
                            <p className="text-xs bg-gray-100 p-2 rounded-lg">
                              🏥 {request.hospital.name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard