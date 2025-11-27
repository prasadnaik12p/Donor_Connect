import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const AdminAuth = ({ mode = "login", onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === "register") {
        const response = await axios.post('/admin/register', formData)
        alert('🎉 Admin registration successful!')
        navigate('/admin-login')
      } else {
        const response = await axios.post('/admin/login', formData)
        const { token, admin } = response.data
        localStorage.setItem('adminToken', token)
        localStorage.setItem('admin', JSON.stringify(admin))
        onLogin?.(token, admin)
        navigate('/admin-dashboard')
      }
    } catch (error) {
      console.error('Admin auth error:', error)
      alert(error.response?.data?.message || `${mode === 'register' ? 'Registration' : 'Login'} failed`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-2xl mb-6 transform hover:scale-105 transition-all duration-300">
            <span className="text-4xl text-white">⚙️</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            {mode === 'register' ? 'Admin Registration' : 'Admin Portal'}
          </h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            {mode === 'register' 
              ? 'Create your administrator account to manage the platform'
              : 'Welcome back! Access your administrative dashboard'
            }
          </p>
        </div>

        {/* Auth Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform hover:shadow-3xl transition-all duration-500">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {mode === 'register' ? 'Create Account' : 'Admin Login'}
                  </h2>
                  <p className="text-purple-100 text-sm mt-1">
                    {mode === 'register' ? 'Setup your administrator credentials' : 'Enter your credentials to continue'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xl">🔐</span>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="px-8 py-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {mode === 'register' && (
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                      👤 Admin Name
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
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-700"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <span className="text-gray-400">👨‍💼</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    📧 Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@example.com"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-700"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <span className="text-gray-400">📨</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    🔑 Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-700 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{mode === 'register' ? '🚀' : '🔓'}</span>
                        <span>{mode === 'register' ? 'Create Admin Account' : 'Access Dashboard'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Switch Mode Link */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">
                    {mode === 'register' ? (
                      <>
                        Already have an account?{' '}
                        <Link 
                          to="/admin-login" 
                          className="font-semibold text-purple-600 hover:text-purple-700 transition-colors duration-300 hover:underline"
                        >
                          Sign in here
                        </Link>
                      </>
                    ) : (
                      <>
                        {/* Need admin access?{' '}
                        <Link 
                          to="/admin-register" 
                          className="font-semibold text-purple-600 hover:text-purple-700 transition-colors duration-300 hover:underline"
                        >
                          Register here
                        </Link> */}
                      </>
                    )}
                  </p>
                </div>
              </form>
            </div>

            {/* Security Footer */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <span>🔒</span>
                <span>Secure Admin Access</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-lg">⚠️</span>
                </div>
                <h3 className="font-semibold text-gray-800">Admin Access Only</h3>
              </div>
              <p className="text-gray-600 text-sm">
                This portal is restricted to authorized administrators only. 
                Unauthorized access attempts will be logged and monitored.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
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
  )
}

export default AdminAuth