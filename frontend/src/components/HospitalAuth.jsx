import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const HospitalAuth = ({ mode = "login", onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    registrationNumber: '',
    location: { coordinates: [0, 0] }
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setErrors(prev => ({ ...prev, [name]: '' }))
    
    if (name.startsWith('location.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: field === 'coordinates' ? value.split(',').map(Number) : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (mode === 'register') {
      if (!formData.name.trim()) newErrors.name = 'Hospital name is required'
      if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required'
      if (!formData.address.trim()) newErrors.address = 'Address is required'
      if (!formData.city.trim()) newErrors.city = 'City is required'
      if (!formData.state.trim()) newErrors.state = 'State is required'
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
      
      // Validate coordinates
      const coords = formData.location.coordinates
      if (!coords || coords.length !== 2 || coords.some(coord => isNaN(coord))) {
        newErrors['location.coordinates'] = 'Valid coordinates are required (e.g., 77.5946,12.9716)'
      }
    }

    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'

    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      if (mode === "register") {
        const response = await axios.post('/hospitals/register', formData)
        alert('✅ Hospital registration submitted successfully! Waiting for admin approval.')
        navigate('/hospital-login')
      } else {
        const response = await axios.post('/hospitals/login', {
          email: formData.email,
          password: formData.password
        })
        const { token, hospital } = response.data
        localStorage.setItem('hospitalToken', token)
        localStorage.setItem('hospital', JSON.stringify(hospital))
        onLogin?.(token, hospital)
        navigate('/hospital-dashboard')
      }
    } catch (error) {
      console.error('Hospital auth error:', error)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors || 
                          `${mode === 'register' ? 'Registration' : 'Login'} failed`
      alert(typeof errorMessage === 'string' ? errorMessage : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('hospitalToken')
      if (token) {
        await axios.post('/hospitals/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      localStorage.removeItem('hospitalToken')
      localStorage.removeItem('hospital')
      window.location.reload()
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords
          setFormData(prev => ({
            ...prev,
            location: {
              coordinates: [longitude, latitude]
            }
          }))
        },
        (error) => {
          alert('Unable to retrieve your location. Please enter coordinates manually.')
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Enhanced Logo */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-3xl">🏥</span>
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20"></div>
          </div>
        </div>
        
        <h2 className="mt-8 text-center text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          {mode === 'register' ? 'Hospital Registration' : 'Hospital Portal'}
        </h2>
        <p className="mt-4 text-center text-lg text-gray-600 max-w-md mx-auto">
          {mode === 'register' 
            ? 'Join our network of healthcare providers to save lives together'
            : 'Access your hospital dashboard and manage healthcare services'
          }
        </p>
        
        <div className="mt-4 text-center">
          {mode === 'register' ? (
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/hospital-login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Sign in to your account
              </Link>
            </p>
          ) : (
            <p className="text-gray-600">
              New to our network?{' '}
              <Link to="/hospital-register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Register your hospital
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-2xl sm:rounded-3xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Hospital Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter hospital name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="registrationNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                      Registration Number *
                    </label>
                    <input
                      id="registrationNumber"
                      name="registrationNumber"
                      type="text"
                      required
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.registrationNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Hospital registration number"
                    />
                    {errors.registrationNumber && <p className="text-red-500 text-sm mt-1">{errors.registrationNumber}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                    Hospital Address *
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Full hospital address"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="City"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="State"
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Hospital phone number"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="location.coordinates" className="block text-sm font-semibold text-gray-700 mb-2">
                      Location Coordinates *
                    </label>
                    <div className="flex space-x-2">
                      <input
                        id="location.coordinates"
                        name="location.coordinates"
                        type="text"
                        required
                        placeholder="77.5946,12.9716"
                        value={formData.location.coordinates.join(',')}
                        onChange={handleChange}
                        className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors['location.coordinates'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                      >
                        📍
                      </button>
                    </div>
                    {errors['location.coordinates'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['location.coordinates']}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Enter as longitude,latitude or click the location icon to auto-detect
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="hospital@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  mode === 'register' ? 'Register Hospital' : 'Sign In to Dashboard'
                )}
              </button>
            </div>
          </form>

          {/* Enhanced Logout Section */}
          {localStorage.getItem('hospitalToken') && (
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <div className="text-center">
                <p className="text-gray-700 mb-3">You are currently logged in as a hospital</p>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  🚪 Logout Hospital
                </button>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {mode === 'register' 
                ? 'After registration, your hospital will be reviewed by our admin team for approval.'
                : 'Secure login for verified hospital partners'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HospitalAuth