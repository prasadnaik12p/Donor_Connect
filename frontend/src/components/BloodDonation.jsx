import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BloodDonation = ({ user }) => {
  const [bloodRequests, setBloodRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [activeTab, setActiveTab] = useState("requests");
  const [loading, setLoading] = useState(false);
  const [newRequest, setNewRequest] = useState({
    bloodType: "",
    units: 1,
    urgency: "medium",
    location: {
      city: "",
      address: "",
      hospital: "",
    },
    notes: "",
  });
  const [editingRequest, setEditingRequest] = useState(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
    availableDonors: 0,
  });
  const navigate = useNavigate();

  // ✅ Get authentication headers with token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("❌ No token found in localStorage");
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // ✅ API call helper
  const apiCall = async (method, endpoint, data = null) => {
    const token = localStorage.getItem("token");
    
    // Allow public endpoints without token
    const publicEndpoints = ["/requests", "/donors", "/bloodbanks/nearby"];
    const isPublicEndpoint = publicEndpoints.some(ep => endpoint.includes(ep));
    
    if (!token && !isPublicEndpoint) {
      throw new Error("No authentication token found");
    }

    const config = {
      method,
      url: `/blood-donation${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(
        `API Error (${method} ${endpoint}):`,
        error.response?.data || error.message
      );
      throw error;
    }
  };

  useEffect(() => {
    if (activeTab === "requests") fetchBloodRequests();
    if (activeTab === "donors") fetchDonors();
    if (activeTab === "bloodbanks") fetchBloodBanks();
  }, [activeTab]);

  useEffect(() => {
    calculateStats();
  }, [bloodRequests, donors]);

  const calculateStats = () => {
    setStats({
      totalRequests: bloodRequests.length,
      activeRequests: bloodRequests.filter(
        (req) => req.status === "pending" || req.status === "matched"
      ).length,
      completedRequests: bloodRequests.filter(
        (req) => req.status === "completed"
      ).length,
      availableDonors: donors.length,
    });
  };

  const fetchBloodRequests = async () => {
    setLoading(true);
    try {
      const data = await apiCall("get", "/requests");
      setBloodRequests(data);
    } catch (error) {
      console.error("Error fetching blood requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const data = await apiCall("get", "/donors");
      setDonors(data);
    } catch (error) {
      console.error("Error fetching donors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBloodBanks = async () => {
    setLoading(true);
    try {
      const data = await apiCall("get", "/bloodbanks/nearby");
      setBloodBanks(data.bloodBanks || []);
    } catch (error) {
      console.error("Error fetching blood banks:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Call Donor Function
  const handleCallDonor = (donorName, phoneNumber) => {
    if (!phoneNumber) {
      alert(`Phone number not available for ${donorName}`);
      return;
    }

    // Clean the phone number (remove spaces, dashes, etc.)
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Validate phone number
    if (cleanNumber.length < 10) {
      alert('Invalid phone number format');
      return;
    }

    // Ask for confirmation before calling
    const confirmCall = window.confirm(`Call ${donorName} at ${phoneNumber}?`);
    
    if (confirmCall) {
      // Open phone dialer
      window.open(`tel:${cleanNumber}`, '_self');
    }
  };

  // ✅ NEW: Send SMS to Donor
  const handleSMSDonor = (donorName, phoneNumber) => {
    if (!phoneNumber) {
      alert(`Phone number not available for ${donorName}`);
      return;
    }

    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    if (cleanNumber.length < 10) {
      alert('Invalid phone number format');
      return;
    }

    // Open SMS app with pre-filled number
    window.open(`sms:${cleanNumber}`, '_self');
  };

  // ✅ FIXED: Create Blood Request
  const createBloodRequest = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to create a blood request");
      navigate("/login");
      return;
    }

    // Validate required fields
    if (!newRequest.bloodType) {
      alert("Please select blood type");
      return;
    }

    if (!newRequest.location.city) {
      alert("Please enter city");
      return;
    }

    setLoading(true);
    try {
      console.log("Creating blood request with data:", newRequest);
      
      const response = await apiCall("post", "/request", newRequest);
      console.log("Response:", response);
      
      alert("✅ Blood request created successfully!");

      // Reset form
      setNewRequest({
        bloodType: "",
        units: 1,
        urgency: "medium",
        location: {
          city: "",
          address: "",
          hospital: "",
        },
        notes: "",
      });

      // Refresh requests
      fetchBloodRequests();
    } catch (error) {
      console.error("Error creating blood request:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create blood request";

      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        alert(`❌ ${errorMessage}`);
        
        // Show more detailed error info for debugging
        if (error.response?.data) {
          console.error("Detailed error:", error.response.data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper to update nested location state
  const updateLocationField = (field, value) => {
    setNewRequest(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const acceptRequest = async (requestId) => {
    if (!user) {
      alert("Please login to accept a blood request");
      return;
    }

    if (!confirm("Are you sure you want to accept this blood request?")) return;

    try {
      await apiCall("put", `/requests/${requestId}/accept`, {});
      alert("✅ Blood request accepted successfully!");
      fetchBloodRequests();
    } catch (error) {
      console.error("Error accepting blood request:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to accept blood request";
      alert(`❌ ${errorMessage}`);
    }
  };

  const completeRequest = async (requestId) => {
    if (!confirm("Mark this request as completed?")) return;

    try {
      await apiCall("put", `/requests/${requestId}/complete`, {});
      alert("✅ Request marked as completed!");
      fetchBloodRequests();
    } catch (error) {
      console.error("Error completing request:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to complete request";
      alert(`❌ ${errorMessage}`);
    }
  };

  const updateRequest = async (e) => {
    e.preventDefault();

    if (!editingRequest) return;

    try {
      const { _id, ...updates } = editingRequest;
      await apiCall("put", `/requests/${_id}`, updates);
      alert("✅ Request updated successfully!");
      setEditingRequest(null);
      fetchBloodRequests();
    } catch (error) {
      console.error("Error updating request:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update request";
      alert(`❌ ${errorMessage}`);
    }
  };

  const deleteRequest = async (requestId) => {
    if (!confirm("Are you sure you want to delete this blood request?")) return;

    try {
      await apiCall("delete", `/requests/${requestId}`);
      alert("🗑️ Request deleted successfully!");
      fetchBloodRequests();
    } catch (error) {
      console.error("Error deleting request:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete request";
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleEditRequest = (request) => {
    setEditingRequest({
      _id: request._id,
      bloodType: request.bloodType,
      units: request.units,
      urgency: request.urgency,
      location: request.location || { city: "", address: "", hospital: "" },
      notes: request.notes || "",
    });
  };

  const cancelEdit = () => {
    setEditingRequest(null);
  };

  const handleAuthError = () => {
    alert("Session expired. Please login again.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "critical":
        return "bg-gradient-to-r from-red-500 to-pink-600 text-white";
      case "high":
        return "bg-gradient-to-r from-orange-500 to-red-500 text-white";
      case "medium":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
      case "low":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-yellow-500 to-amber-500 text-white";
      case "matched":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
      case "completed":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
      case "cancelled":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Render appropriate buttons based on authorization
  const renderRequestActions = (request) => {
    const currentUserId = user?.id;
    const isRecipient = currentUserId === request.recipient?._id;
    const isDonor = currentUserId === request.donor?._id;

    return (
      <div className="flex space-x-2 flex-wrap gap-2">
        {/* Edit/Delete - Only for recipient when pending */}
        {isRecipient && request.status === "pending" && (
          <>
            <button
              onClick={() => handleEditRequest(request)}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => deleteRequest(request._id)}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              🗑️ Delete
            </button>
          </>
        )}

        {/* Accept - For any logged-in user except recipient when pending */}
        {user && !isRecipient && request.status === "pending" && (
          <button
            onClick={() => acceptRequest(request._id)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            ✅ Accept Request
          </button>
        )}

        {/* Complete - For both recipient and donor when matched */}
        {(isRecipient || isDonor) && request.status === "matched" && (
          <button
            onClick={() => completeRequest(request._id)}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            🎯 Mark Complete
          </button>
        )}

        {/* Status badges */}
        {request.status === "completed" && (
          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            ✅ Completed
          </span>
        )}
        {request.status === "matched" && !isRecipient && !isDonor && (
          <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            🤝 Matched
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl shadow-xl mb-6">
            <span className="text-3xl text-white">🩸</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Blood Donation
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Join our life-saving community. Request blood donations or become a
            donor to help those in need.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-red-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-semibold mb-2">
                  Total Requests
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.totalRequests}
                </h3>
                <p className="text-gray-500 text-sm mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-green-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold mb-2">
                  Active Requests
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.activeRequests}
                </h3>
                <p className="text-gray-500 text-sm mt-1">Need help</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🆘</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-2">
                  Completed
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.completedRequests}
                </h3>
                <p className="text-gray-500 text-sm mt-1">Lives saved</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold mb-2">
                  Available Donors
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.availableDonors}
                </h3>
                <p className="text-gray-500 text-sm mt-1">Ready to help</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">👥</span>
              </div>
            </div>
          </div>
        </div>

        {!user && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-1 mb-8 max-w-2xl mx-auto shadow-lg">
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Authentication Required
              </h3>
              <p className="text-gray-700 mb-4">
                Please login to create or accept blood requests
              </p>
              <button
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                Login to Continue
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 p-2">
              {[
                { id: "requests", label: "Blood Requests", icon: "🩸" },
                { id: "donors", label: "Donors", icon: "👥" },
                { id: "bloodbanks", label: "Blood Banks", icon: "🏥" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-6 rounded-xl font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Blood Requests Tab */}
            {activeTab === "requests" && (
              <div className="space-y-6">
                {/* ✅ FIXED: Create Request Form */}
                {user && !editingRequest && (
                  <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl p-6 border border-red-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">➕</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Create Blood Request
                        </h2>
                        <p className="text-gray-600">
                          Help us find the right donor for your needs
                        </p>
                      </div>
                    </div>
                    <form
                      onSubmit={createBloodRequest}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      {/* Blood Type */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          🩸 Blood Type Required *
                        </label>
                        <select
                          value={newRequest.bloodType}
                          onChange={(e) => setNewRequest(prev => ({
                            ...prev,
                            bloodType: e.target.value
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Select Blood Type</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>

                      {/* Units Required */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          💉 Units Required *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={newRequest.units}
                          onChange={(e) => setNewRequest(prev => ({
                            ...prev,
                            units: parseInt(e.target.value) || 1
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>

                      {/* Urgency Level */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          🚨 Urgency Level *
                        </label>
                        <select
                          value={newRequest.urgency}
                          onChange={(e) => setNewRequest(prev => ({
                            ...prev,
                            urgency: e.target.value
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        >
                          <option value="low">Low - Can wait few days</option>
                          <option value="medium">Medium - Need within 24 hours</option>
                          <option value="high">High - Need within 6 hours</option>
                          <option value="critical">Critical - Emergency</option>
                        </select>
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          📍 City *
                        </label>
                        <input
                          type="text"
                          value={newRequest.location.city}
                          onChange={(e) => updateLocationField('city', e.target.value)}
                          placeholder="Enter your city"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>

                      {/* Hospital */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          🏥 Hospital/Clinic
                        </label>
                        <input
                          type="text"
                          value={newRequest.location.hospital}
                          onChange={(e) => updateLocationField('hospital', e.target.value)}
                          placeholder="Hospital name (optional)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Address */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          🏠 Full Address
                        </label>
                        <input
                          type="text"
                          value={newRequest.location.address}
                          onChange={(e) => updateLocationField('address', e.target.value)}
                          placeholder="Full address (optional)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Notes */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          📝 Additional Notes
                        </label>
                        <textarea
                          value={newRequest.notes}
                          onChange={(e) => setNewRequest(prev => ({
                            ...prev,
                            notes: e.target.value
                          }))}
                          placeholder="Any additional information for donors..."
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
                        >
                          {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Creating Request...</span>
                            </div>
                          ) : (
                            "🩸 Create Blood Request"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Edit Request Form */}
                {user && editingRequest && (
                  <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl p-6 border-2 border-yellow-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">✏️</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Edit Blood Request
                        </h2>
                        <p className="text-gray-600">
                          Update your blood request information
                        </p>
                      </div>
                    </div>
                    <form
                      onSubmit={updateRequest}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      {/* Similar form fields as create but for editing */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          🩸 Blood Type
                        </label>
                        <select
                          value={editingRequest.bloodType}
                          onChange={(e) => setEditingRequest(prev => ({
                            ...prev,
                            bloodType: e.target.value
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select Blood Type</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          💉 Units Required
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={editingRequest.units}
                          onChange={(e) => setEditingRequest(prev => ({
                            ...prev,
                            units: parseInt(e.target.value) || 1
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="md:col-span-2 flex space-x-4">
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                        >
                          ✅ Update Request
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Blood Requests List */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Available Blood Requests
                    </h2>
                    <button
                      onClick={fetchBloodRequests}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      🔄 Refresh
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent"></div>
                    </div>
                  ) : bloodRequests.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">🩸</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No Blood Requests
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Be the first to create a blood request or check back
                        later.
                      </p>
                      {!user && (
                        <button
                          onClick={() => navigate("/login")}
                          className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                        >
                          Login to Create Request
                        </button>
                      )}
                    </div>
                  ) : (
                    bloodRequests.map((request) => (
                      <div
                        key={request._id}
                        className="bg-white rounded-2xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {request.bloodType} Blood Needed
                              </h3>
                              <div className="flex items-center space-x-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getUrgencyColor(request.urgency)}`}>
                                  {request.urgency.toUpperCase()}
                                </span>
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                  {request.units} Unit(s)
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                                  {request.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-gray-600 mb-2">
                                <span className="font-semibold">📍 Location:</span>{" "}
                                {request.location?.city}
                                {request.location?.hospital && ` • ${request.location.hospital}`}
                              </p>
                              {request.location?.address && (
                                <p className="text-gray-600">
                                  <span className="font-semibold">🏠 Address:</span>{" "}
                                  {request.location.address}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-gray-600">
                                <span className="font-semibold">👤 Requested by:</span>{" "}
                                {request.recipient?.name || "Anonymous"}
                              </p>
                              {request.donor && (
                                <p className="text-green-600">
                                  <span className="font-semibold">✅ Donor:</span>{" "}
                                  {request.donor.name}
                                </p>
                              )}
                            </div>
                          </div>

                          {request.notes && (
                            <div className="bg-gray-50 p-4 rounded-xl mb-4">
                              <p className="text-gray-700">
                                <span className="font-semibold">📝 Notes:</span>{" "}
                                {request.notes}
                              </p>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                              Posted{" "}
                              {new Date(request.createdAt).toLocaleDateString()}
                            </div>

                            {renderRequestActions(request)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Donors Tab */}
            {activeTab === "donors" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Available Donors
                  </h2>
                  <button
                    onClick={fetchDonors}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    🔄 Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
                  </div>
                ) : donors.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl shadow">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">👥</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Donors Available
                    </h3>
                    <p className="text-gray-600">
                      Check back later for available donors in your area.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {donors.map((donor) => (
                      <div
                        key={donor._id}
                        className="bg-white rounded-2xl shadow-lg p-6 text-center transform hover:-translate-y-2 transition-all duration-300 border border-green-200"
                      >
                        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <span className="text-2xl text-white">🩸</span>
                        </div>
                        <h3 className="font-bold text-xl mb-3">{donor.name}</h3>
                        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl font-semibold text-lg mb-3">
                          {donor.bloodType}
                        </div>
                        <p className="text-gray-600 mb-3 flex items-center justify-center">
                          <span className="mr-2">📍</span>
                          {donor.city}
                        </p>
                        <p className="text-gray-500 text-sm mb-3">
                          {donor.email}
                        </p>
                        {donor.phone && (
                          <p className="text-gray-500 text-sm flex items-center justify-center mb-4">
                            <span className="mr-2">📞</span>
                            {donor.phone}
                          </p>
                        )}
                        
                        {/* Contact Buttons */}
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                          {donor.phone && (
                            <>
                              <button
                                onClick={() => handleCallDonor(donor.name, donor.phone)}
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                              >
                                <span>📞</span>
                                <span>Call Donor</span>
                              </button>
                              <button
                                onClick={() => handleSMSDonor(donor.name, donor.phone)}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                              >
                                <span>💬</span>
                                <span>Send SMS</span>
                              </button>
                            </>
                          )}
                          {!donor.phone && (
                            <p className="text-yellow-600 text-sm bg-yellow-50 px-3 py-2 rounded-lg">
                              📞 Phone number not available
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Blood Banks Tab */}
            {activeTab === "bloodbanks" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Nearby Blood Banks
                  </h2>
                  <button
                    onClick={fetchBloodBanks}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    🔄 Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
                  </div>
                ) : bloodBanks.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl shadow">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">🏥</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Blood Banks Found
                    </h3>
                    <p className="text-gray-600">
                      No blood banks found in your area. Try expanding your
                      search.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bloodBanks.map((bank) => (
                      <div
                        key={bank.id}
                        className="bg-white rounded-2xl shadow-lg p-6 transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <span className="text-white text-lg">🏥</span>
                              </div>
                              <div>
                                <h3 className="font-bold text-xl mb-1">
                                  {bank.name}
                                </h3>
                                <p className="text-gray-600">{bank.address}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {bank.phone && (
                                <span className="flex items-center space-x-1">
                                  <span>📞</span>
                                  <span>{bank.phone}</span>
                                </span>
                              )}
                              {bank.hours && (
                                <span className="flex items-center space-x-1">
                                  <span>🕒</span>
                                  <span>{bank.hours}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-xl text-sm font-semibold mb-2 inline-block">
                              ⭐ {bank.rating}
                            </span>
                            <p className="text-gray-500 text-sm">
                              {bank.distance} away
                            </p>
                            {bank.phone && (
                              <button 
                                onClick={() => handleCallDonor(bank.name, bank.phone)}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg font-semibold mt-3 hover:shadow-lg transition-all duration-300"
                              >
                                📞 Call Blood Bank
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodDonation;