import React from 'react'
import { Link } from 'react-router-dom'

const Dashboard = ({ user }) => {
  const features = [
    {
      title: "🏥 Hospital Services",
      description: "Find hospitals, check bed availability, and reserve beds",
      link: "/hospitals",
      color: "from-blue-500 to-cyan-500",
      icon: "🏥",
      gradient: "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
    },
    {
      title: "🩸 Blood Donation",
      description: "Request blood donations or become a donor",
      link: "/blood-donation",
      color: "from-red-500 to-pink-600",
      icon: "💉",
      gradient: "bg-gradient-to-br from-red-50 to-pink-50 border-red-200"
    },
    {
      title: "🚑 Ambulance Services",
      description: "Emergency ambulance services and tracking",
      link: "/ambulance",
      color: "from-green-500 to-emerald-600",
      icon: "🚑",
      gradient: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
    },
    {
      title: "💰 Fund Requests",
      description: "Support patients with medical fund requirements",
      link: "/fund-requests",
      color: "from-amber-500 to-orange-500",
      icon: "❤️",
      gradient: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
            <span className="text-2xl text-white">❤️</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome to Donor Connect
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            A comprehensive platform connecting donors, hospitals, and patients to save lives through 
            <span className="font-semibold text-blue-600"> blood donation</span>, 
            <span className="font-semibold text-green-600"> medical funding</span>, and 
            <span className="font-semibold text-red-600"> emergency services</span>.
          </p>
        </div>

        {/* Login Prompt */}
        {!user && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-1 mb-10 max-w-2xl mx-auto shadow-lg">
            <div className="bg-white rounded-xl p-5 text-center">
              <p className="text-gray-800 text-lg">
                Please <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">login</Link> or <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">register</Link> to access all features
              </p>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className={`group relative overflow-hidden rounded-2xl border-2 ${feature.gradient} hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2`}
            >
              {/* Background Gradient Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              {/* Animated Border */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                <div className="absolute inset-[2px] rounded-2xl bg-white"></div>
              </div>

              <div className="relative p-6 z-10">
                {/* Icon Container */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl text-white">{feature.icon}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>
                
                {/* Arrow Indicator */}
                <div className="mt-4 flex items-center text-sm font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">
                  Explore now
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-xl p-8 border border-blue-100 transform hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-md">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
                <p className="text-gray-600">Welcome back to your dashboard</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <span className="font-semibold text-gray-700 w-24">Name:</span>
                  <span className="text-gray-900 font-medium">{user.name}</span>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <span className="font-semibold text-gray-700 w-24">Email:</span>
                  <span className="text-gray-900">{user.email}</span>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <span className="font-semibold text-gray-700 w-24">Role:</span>
                  <span className="capitalize px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {user.role}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {user.bloodType && (
                  <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <span className="font-semibold text-gray-700 w-24">Blood Type:</span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold">
                      {user.bloodType}
                    </span>
                  </div>
                )}
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <span className="font-semibold text-gray-700 w-24">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.isVerified 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {user.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                  </span>
                </div>
              </div>
            </div>

            {/* ✅ ADD: Become Donor Section */}
            {user.role !== 'donor' && (
              <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-red-800">Become a Blood Donor</h3>
                    <p className="text-red-600 text-sm mt-1">
                      Join our donor community and save lives
                    </p>
                  </div>
                  <Link
                    to="/become-donor"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Register Now
                  </Link>
                </div>
              </div>
            )}

            {/* ✅ ADD: Donor Status Section */}
            {user.role === 'donor' && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-800">You're a Registered Donor</h3>
                    <p className="text-green-600 text-sm mt-1">
                      Thank you for being a life-saver! You can now receive donation requests.
                    </p>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Active Donor
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-600">Hospitals</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-red-600 mb-2">10K+</div>
            <div className="text-gray-600">Donors</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-green-600 mb-2">2K+</div>
            <div className="text-gray-600">Lives Saved</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="text-2xl font-bold text-amber-600 mb-2">$1M+</div>
            <div className="text-gray-600">Funds Raised</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard