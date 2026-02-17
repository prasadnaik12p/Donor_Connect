import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'donor',
    bloodType: ''
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
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/auth/register', formData)
      alert('🎉 Registration successful! Please check your email for verification.')
      navigate('/login')
    } catch (error) {
      console.error('Registration error:', error)
      alert(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

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
            Join Donor Connect
          </h1>
          <p className="text-gray-700 text-base sm:text-lg max-w-md mx-auto px-2">
            Create your account and become part of our life-saving community
          </p>
        </div>

        {/* Registration Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden transform hover:shadow-3xl transition-all duration-500">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">
                    Create Account
                  </h2>
                  <p className="text-purple-100 text-xs sm:text-sm mt-1">
                    Start your journey to save lives
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg sm:text-xl">🚀</span>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
                onSubmit={handleSubmit}
              >
                {/* Personal Information Column */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <span>👤</span>
                    <span>Personal Information</span>
                  </h3>

                  {/* Name Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-700"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <span className="text-gray-400">📝</span>
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Email Address *
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
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-700"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <span className="text-gray-400">📧</span>
                      </div>
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-700"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <span className="text-gray-400">📞</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information Column */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <span>🔐</span>
                    <span>Account Details</span>
                  </h3>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-700 pr-12"
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

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label
                      htmlFor="role"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      I want to join as *
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        {
                          value: "donor",
                          label: "🩸 Donor",
                          description: "Donate blood and Fund save lives",
                        },
                        {
                          value: "recipient",
                          label: "🏥 User",
                          description: "Request  donations",
                        },
                        {
                          value: "user",
                          label: "🤝 Supporter",
                          description: "Support the community",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                            formData.role === option.value
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 hover:border-red-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={option.value}
                            checked={formData.role === option.value}
                            onChange={handleChange}
                            className="hidden"
                          />
                          <div className="flex items-center space-x-3 flex-1">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                formData.role === option.value
                                  ? "border-red-500 bg-red-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {formData.role === option.value && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {option.label}
                              </div>
                              <div className="text-sm text-gray-500">
                                {option.description}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Blood Type Selection (Conditional) */}
                  {formData.role === "donor" && (
                    <div className="space-y-2">
                      <label
                        htmlFor="bloodType"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        Your Blood Type
                      </label>
                      <div className="relative">
                        <select
                          id="bloodType"
                          name="bloodType"
                          value={formData.bloodType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-gray-700 appearance-none"
                        >
                          <option value="">Select your blood type</option>
                          {bloodTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <span className="text-gray-400">🩸</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button - Full Width */}
                <div className="md:col-span-2 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>🎉</span>
                        <span>Join Donor Connect</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Login Link */}
                <div className="md:col-span-2 text-center pt-4">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-red-600 hover:text-red-700 transition-colors duration-300 hover:underline"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Features Footer */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-4">
                  Why join Donor Connect?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="text-red-500">🩸</span>
                    <span>Save Lives</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="text-green-500">🏥</span>
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="text-blue-500">🌍</span>
                    <span>Global Community</span>
                  </div>
                </div>
              </div>
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

export default Register