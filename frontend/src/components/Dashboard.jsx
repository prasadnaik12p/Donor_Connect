import React from 'react'
import { Link } from 'react-router-dom'

const Dashboard = ({ user }) => {
  const features = [
    {
      title: "🏥 Hospital Services",
      description: "Find hospitals, check bed availability, and reserve beds",
      link: "/hospitals",
      color: "from-blue-400 to-cyan-400",
      icon: "🏥",
      gradient:
        "bg-gradient-to-br from-gray-800 to-gray-900 border-blue-500/50",
    },
    {
      title: "🩸 Blood Donation",
      description: "Request blood donations or become a donor",
      link: "/blood-donation",
      color: "from-red-400 to-pink-500",
      icon: "💉",
      gradient: "bg-gradient-to-br from-gray-800 to-gray-900 border-red-500/50",
    },
    {
      title: "🚑 Ambulance Services",
      description: "Emergency ambulance services and tracking",
      link: "/ambulance",
      color: "from-green-400 to-emerald-500",
      icon: "🚑",
      gradient:
        "bg-gradient-to-br from-gray-800 to-gray-900 border-green-500/50",
    },
    {
      title: "💰 Fund Requests",
      description: "Support patients with medical fund requirements",
      link: "/fund-requests",
      color: "from-amber-400 to-orange-400",
      icon: "❤️",
      gradient:
        "bg-gradient-to-br from-gray-800 to-gray-900 border-amber-500/50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 px-2">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded-full mb-4 sm:mb-6 shadow-xl animate-pulse">
            <span className="text-xl sm:text-2xl text-white">❤️</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
            Welcome to Donor Connect
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            A comprehensive platform connecting donors, hospitals, and patients
            to save lives through
            <span className="font-semibold text-red-400"> blood donation</span>,
            <span className="font-semibold text-green-400">
              {" "}
              medical funding
            </span>
            , and
            <span className="font-semibold text-pink-400">
              {" "}
              emergency services
            </span>
            .
          </p>
        </div>

        {/* Login Prompt */}
        {!user && (
          <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded-2xl p-1 mb-8 sm:mb-10 max-w-2xl mx-auto shadow-2xl">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 sm:p-5 text-center">
              <p className="text-gray-200 text-sm sm:text-base md:text-lg">
                Please{" "}
                <Link
                  to="/login"
                  className="font-bold text-pink-400 hover:text-pink-300 transition-colors"
                >
                  login
                </Link>{" "}
                or{" "}
                <Link
                  to="/register"
                  className="font-bold text-pink-400 hover:text-pink-300 transition-colors"
                >
                  register
                </Link>{" "}
                to access all features
              </p>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className={`group relative overflow-hidden rounded-2xl border-2 ${feature.gradient} hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2`}
            >
              {/* Background Gradient Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              ></div>

              {/* Animated Border */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              >
                <div className="absolute inset-[2px] rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900"></div>
              </div>

              <div className="relative p-6 z-10">
                {/* Icon Container */}
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}
                >
                  <span className="text-2xl text-white">{feature.icon}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>

                {/* Arrow Indicator */}
                <div className="mt-4 flex items-center text-sm font-semibold text-gray-500 group-hover:text-gray-300 transition-colors">
                  Explore now
                  <span className="ml-2 transform group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-purple-500/30 transform hover:shadow-purple-500/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg mr-3 sm:mr-4 shadow-lg">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Your Profile
                </h2>
                <p className="text-sm sm:text-base text-gray-400">
                  Welcome back to your dashboard
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-700/50 rounded-lg shadow-sm border border-gray-600">
                  <span className="font-semibold text-gray-300 w-24">
                    Name:
                  </span>
                  <span className="text-white font-medium">{user.name}</span>
                </div>
                <div className="flex items-center p-3 bg-gray-700/50 rounded-lg shadow-sm border border-gray-600">
                  <span className="font-semibold text-gray-300 w-24">
                    Email:
                  </span>
                  <span className="text-white">{user.email}</span>
                </div>
                <div className="flex items-center p-3 bg-gray-700/50 rounded-lg shadow-sm border border-gray-600">
                  <span className="font-semibold text-gray-300 w-24">
                    Role:
                  </span>
                  <span className="capitalize px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-medium">
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {user.bloodType && (
                  <div className="flex items-center p-3 bg-gray-700/50 rounded-lg shadow-sm border border-gray-600">
                    <span className="font-semibold text-gray-300 w-24">
                      Blood Type:
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-bold">
                      {user.bloodType}
                    </span>
                  </div>
                )}
                <div className="flex items-center p-3 bg-gray-700/50 rounded-lg shadow-sm border border-gray-600">
                  <span className="font-semibold text-gray-300 w-24">
                    Status:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.isVerified
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    }`}
                  >
                    {user.isVerified ? "✓ Verified" : "⏳ Pending Verification"}
                  </span>
                </div>
              </div>
            </div>

            {/* ✅ ADD: Become Donor Section */}
            {user.role !== "donor" && (
              <div className="mt-6 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl border border-red-500/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-red-300">
                      Become a Blood Donor
                    </h3>
                    <p className="text-red-400 text-sm mt-1">
                      Join our donor community and save lives
                    </p>
                  </div>
                  <Link
                    to="/become-donor"
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-colors font-medium shadow-lg"
                  >
                    Register Now
                  </Link>
                </div>
              </div>
            )}

            {/* ✅ ADD: Donor Status Section */}
            {user.role === "donor" && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-300">
                      You're a Registered Donor
                    </h3>
                    <p className="text-green-400 text-sm mt-1">
                      Thank you for being a life-saver! You can now receive
                      donation requests.
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    Active Donor
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 text-center">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              500+
            </div>
            <div className="text-gray-400">Hospitals</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-red-500/30 hover:border-red-500/60 transition-all duration-300">
            <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
              10K+
            </div>
            <div className="text-gray-400">Donors</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-green-500/30 hover:border-green-500/60 transition-all duration-300">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              2K+
            </div>
            <div className="text-gray-400">Lives Saved</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-amber-500/30 hover:border-amber-500/60 transition-all duration-300">
            <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-2">
              $1M+
            </div>
            <div className="text-gray-400">Funds Raised</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard