import React, { useState, useEffect } from 'react'
import axios from 'axios'

const FundRequest = ({ user }) => {
  const [fundRequests, setFundRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [donationAmount, setDonationAmount] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    fetchFundRequests()
  }, [])

  const fetchFundRequests = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/funds')
      setFundRequests(response.data.fundRequests || [])
    } catch (error) {
      console.error('Error fetching fund requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const donateToRequest = async (requestId) => {
    if (!user) {
      alert('Please login to make a donation')
      return
    }

    if (!donationAmount || donationAmount <= 0) {
      alert('Please enter a valid donation amount')
      return
    }

    try {
      await axios.post('/funds/donate', {
        fundRequestId: requestId,
        donorName: user.name,
        donorEmail: user.email,
        amount: parseFloat(donationAmount),
        paymentMethod: 'UPI'
      })
      alert('🎉 Donation successful! Thank you for your contribution.')
      setDonationAmount('')
      setSelectedRequest(null)
      fetchFundRequests()
    } catch (error) {
      console.error('Error making donation:', error)
      alert(error.response?.data?.message || 'Failed to process donation')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      'Approved': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      'Pending': 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white',
      'Rejected': 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
      'Urgent': 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
    }
    return colors[status] || 'bg-gradient-to-r from-gray-500 to-gray-700 text-white'
  }

  const getProgressPercentage = (collected, required) => {
    return Math.min((collected / required) * 100, 100)
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'from-green-500 to-emerald-500'
    if (percentage >= 75) return 'from-blue-500 to-cyan-500'
    if (percentage >= 50) return 'from-yellow-500 to-amber-500'
    if (percentage >= 25) return 'from-orange-500 to-red-500'
    return 'from-red-500 to-pink-500'
  }

  const filteredRequests = fundRequests.filter(request => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'urgent') return request.urgency === 'high'
    if (activeFilter === 'almost') {
      const percentage = getProgressPercentage(request.amountCollected, request.amountRequired)
      return percentage >= 75 && percentage < 100
    }
    return request.status === activeFilter
  })

  const stats = {
    total: fundRequests.length,
    urgent: fundRequests.filter(r => r.urgency === 'high').length,
    completed: fundRequests.filter(r => r.status === 'Completed').length,
    totalRaised: fundRequests.reduce((sum, r) => sum + r.amountCollected, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-2xl shadow-xl mb-4 sm:mb-6 animate-pulse">
            <span className="text-2xl sm:text-3xl text-white">💰</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
            Medical Fund Requests
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-2">
            Support patients in need and help them access life-saving medical
            treatments through your generous donations
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-amber-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">
                  Total Requests
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.total}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  Active campaigns
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-base sm:text-lg">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-red-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-semibold mb-2">
                  Urgent Needs
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.urgent}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Require immediate help
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🚨</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-green-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold mb-2">
                  Completed
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.completed}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Successfully funded
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-2">
                  Total Raised
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  ₹{stats.totalRaised.toLocaleString()}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Community contributions
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">💝</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[
              { id: "all", label: "All Requests", icon: "📋" },
              // { id: 'urgent', label: '🚨 Urgent', icon: '🚨' },
              // { id: 'almost', label: 'Almost Funded', icon: '🎯' },
              // { id: 'Pending', label: 'Pending', icon: '⏳' },
              // { id: 'Approved', label: 'Approved', icon: '✅' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 ${
                  activeFilter === filter.id
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fund Requests Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 hover:shadow-xl"
            >
              {/* Header with Status */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">
                    {request.patientName}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}
                  >
                    {request.status}
                  </span>
                </div>
                {request.urgency === "high" && (
                  <div className="mt-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1">
                    <span>🚨</span>
                    <span>URGENT</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {/* Purpose */}
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm text-amber-800 font-semibold mb-1">
                      Medical Purpose
                    </p>
                    <p className="text-gray-700">{request.purpose}</p>
                  </div>

                  {/* Hospital Info */}
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600">🏥</span>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {request.hospital?.name || "Hospital"}
                      </p>
                      <p className="text-gray-500">Medical Facility</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-700">
                        Progress
                      </span>
                      <span className="font-bold text-amber-600">
                        {getProgressPercentage(
                          request.amountCollected,
                          request.amountRequired,
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(
                          getProgressPercentage(
                            request.amountCollected,
                            request.amountRequired,
                          ),
                        )} transition-all duration-1000`}
                        style={{
                          width: `${getProgressPercentage(request.amountCollected, request.amountRequired)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        ₹{request.amountCollected.toLocaleString()} raised
                      </span>
                      <span>
                        ₹{request.amountRequired.toLocaleString()} goal
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRequest(request)}
                  disabled={
                    request.status === "Completed" ||
                    request.status === "Rejected"
                  }
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {request.status === "Completed" ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span>🎉</span>
                      <span>Fully Funded</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <span>💝</span>
                      <span>Donate Now</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Donation Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl transform animate-scale-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">💝</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Support {selectedRequest.patientName}
                </h3>
                <p className="text-gray-600 mt-2">
                  Your donation can make a difference
                </p>
              </div>

              <div className="space-y-4 mb-6 bg-gray-50 rounded-2xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Purpose:</span>
                  <span className="font-semibold">
                    {selectedRequest.purpose}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Goal Amount:</span>
                  <span className="font-bold text-amber-600">
                    ₹{selectedRequest.amountRequired.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Already Raised:</span>
                  <span className="font-bold text-green-600">
                    ₹{selectedRequest.amountCollected.toLocaleString()}
                  </span>
                </div>
                {selectedRequest.hospital?.name && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hospital:</span>
                    <span className="font-semibold">
                      {selectedRequest.hospital.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    💰 Donation Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter your donation amount"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 text-lg font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    onClick={() => donateToRequest(selectedRequest._id)}
                    disabled={!donationAmount || donationAmount <= 0}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <span>💝</span>
                    <span>Donate</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(null);
                      setDonationAmount("");
                    }}
                    className="bg-gradient-to-r from-gray-500 to-gray-700 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>←</span>
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredRequests.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Fund Requests Found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {activeFilter === "all"
                ? "There are currently no active fund requests. Check back later to support patients in need."
                : `No fund requests match the "${activeFilter}" filter.`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">
              Loading fund requests...
            </p>
          </div>
        )}
      </div>

      {/* Custom Animation */}
      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default FundRequest