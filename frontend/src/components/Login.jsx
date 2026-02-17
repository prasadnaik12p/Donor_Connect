import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("🔐 Starting login process...");

    try {
      const response = await axios.post("/auth/login", formData);

      const { data } = response.data;

      if (!data || !data.token) {
        console.error("No token in response data:", response.data);
        throw new Error("No authentication token received");
      }

      const { token, user } = data;

      // save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Verify saving worked
      const savedToken = localStorage.getItem("token");
      console.log("✅ Token saved to localStorage:", !!savedToken);

      // Set axios default headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Call onLogin callback
      onLogin(token, user);

      console.log("Login completed successfully!");
      navigate("/");
    } catch (error) {
      console.error("Login error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      alert(`Login failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex flex-col justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4 lg:px-8">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded-3xl shadow-2xl mb-4 sm:mb-6 transform hover:scale-105 transition-all duration-300 animate-pulse">
            <span className="text-3xl sm:text-4xl text-white">❤️</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
            Welcome Back
          </h1>
          <p className="text-gray-700 text-base sm:text-lg max-w-md mx-auto px-2">
            Sign in to your Donor Connect account and continue saving lives
          </p>
        </div>

        {/* Login Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden transform hover:shadow-3xl transition-all duration-500">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Sign In</h2>
                  <p className="text-red-100 text-xs sm:text-sm mt-1">
                    Access your donor account
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg sm:text-xl">🔐</span>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
              <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    📧 Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-700"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <span className="text-gray-400">📨</span>
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    🔑 Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-700 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors duration-300"
                  >
                    Forgot your password?
                  </button>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>Sign In to Donor Connect</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Registration Link */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="font-semibold text-red-600 hover:text-red-700 transition-colors duration-300 hover:underline"
                    >
                      Create one here
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Quick Access Links */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-4">Quick Access</p>
                <div className="flex justify-center space-x-6">
                  <Link
                    to="/hospital-login"
                    className="flex flex-col items-center text-gray-500 hover:text-red-600 transition-colors duration-300 group"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 mb-1">
                      <span className="text-lg">🏥</span>
                    </div>
                    <span className="text-xs font-medium">Hospital</span>
                  </Link>
                  <Link
                    to="/ambulance-login"
                    className="flex flex-col items-center text-gray-500 hover:text-red-600 transition-colors duration-300 group"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 mb-1">
                      <span className="text-lg">🚑</span>
                    </div>
                    <span className="text-xs font-medium">Ambulance</span>
                  </Link>
                  <Link
                    to="/admin-login"
                    className="flex flex-col items-center text-gray-500 hover:text-red-600 transition-colors duration-300 group"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 mb-1">
                      <span className="text-lg">⚙️</span>
                    </div>
                    <span className="text-xs font-medium">Admin</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Features Highlight */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-red-600">🩸</span>
              </div>
              <p className="text-sm font-medium text-gray-700">
                Blood Donation
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600">🏥</span>
              </div>
              <p className="text-sm font-medium text-gray-700">
                Hospital Services
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600">🚑</span>
              </div>
              <p className="text-sm font-medium text-gray-700">
                Emergency Help
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default Login