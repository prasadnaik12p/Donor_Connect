import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const AmbulanceAuth = ({ mode = "login", onLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    hospital: "",
    driverName: "",
    phone: "",
    email: "",
    password: "",
    location: { coordinates: [0, 0] },
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        const response = await axios.post("/ambulances/register", formData);
        alert("🎉 Ambulance registration submitted! Waiting for admin approval.");
        navigate("/ambulance-login");
      } else {
        const response = await axios.post("/ambulances/login", {
          email: formData.email,
          password: formData.password,
        });
        const { token, ambulance } = response.data;
        localStorage.setItem("ambulanceToken", token);
        localStorage.setItem("ambulance", JSON.stringify(ambulance));
        onLogin?.(token, ambulance);
        navigate("/ambulance-dashboard");
      }
    } catch (error) {
      console.error("Ambulance auth error:", error);
      alert(
        error.response?.data?.message ||
          `${mode === "register" ? "Registration" : "Login"} failed`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-24 h-24 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-75"></div>
      <div className="absolute bottom-20 left-20 w-16 h-16 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-150"></div>
      
      <div className="relative">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300">
                <span className="text-4xl text-white">🚑</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm">⚡</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            {mode === "register" ? "Join Our Fleet" : "Ambulance Portal"}
          </h1>
          <p className="text-xl text-gray-700 max-w-md mx-auto">
            {mode === "register" 
              ? "Register your ambulance and start saving lives today" 
              : "Welcome back! Sign in to access your dashboard"}
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform hover:shadow-3xl transition-all duration-300">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {mode === "register" ? "Register Ambulance" : "Ambulance Login"}
                </h2>
                <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-300'}`}></div>
                  <span className="text-white text-sm font-medium">
                    {loading ? 'Processing...' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {mode === "register" && (
                  <>
                    {/* Ambulance Name */}
                    <div className="group">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <span className="mr-2">🚑</span>
                        Ambulance Name *
                      </label>
                      <div className="relative">
                        <input
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300 placeholder-gray-400"
                          placeholder="e.g., Emergency Response A1"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <span className="text-gray-400">🏥</span>
                        </div>
                      </div>
                    </div>

                    {/* Hospital ID */}
                    <div className="group">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <span className="mr-2">🏛️</span>
                        Hospital ID *
                      </label>
                      <div className="relative">
                        <input
                          name="hospital"
                          type="text"
                          required
                          value={formData.hospital}
                          onChange={handleChange}
                          placeholder="Enter Hospital MongoDB ID"
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300 placeholder-gray-400"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <span className="text-gray-400">🔑</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <span className="mr-1">💡</span>
                        You can find this in the admin dashboard
                      </p>
                    </div>

                    {/* Driver Name */}
                    <div className="group">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <span className="mr-2">👨‍⚕️</span>
                        Driver Name *
                      </label>
                      <div className="relative">
                        <input
                          name="driverName"
                          type="text"
                          required
                          value={formData.driverName}
                          onChange={handleChange}
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300 placeholder-gray-400"
                          placeholder="Enter driver's full name"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <span className="text-gray-400">👤</span>
                        </div>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="group">
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <span className="mr-2">📞</span>
                        Phone Number *
                      </label>
                      <div className="relative">
                        <input
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300 placeholder-gray-400"
                          placeholder="Enter 10-digit phone number"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <span className="text-gray-400">📱</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <span className="mr-2">📧</span>
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300 placeholder-gray-400"
                      placeholder="Enter your email address"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-gray-400">@</span>
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="group">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <span className="mr-2">🔒</span>
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300 placeholder-gray-400 pr-12"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-green-500 transition-colors"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{mode === "register" ? "🚀 Register Ambulance" : "🔑 Sign In"}</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Footer Links */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-gray-600">
                    {mode === "register" ? (
                      <>
                        Already have an account?{" "}
                        <Link
                          to="/ambulance-login"
                          className="font-bold text-green-600 hover:text-green-700 transition-colors duration-200 inline-flex items-center"
                        >
                          Sign in here <span className="ml-1">🎯</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        New to our service?{" "}
                        <Link
                          to="/ambulance-register"
                          className="font-bold text-green-600 hover:text-green-700 transition-colors duration-200 inline-flex items-center"
                        >
                          Register now <span className="ml-1">🚑</span>
                        </Link>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features/Benefits Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-800">Quick Response</h3>
              <p className="text-xs text-gray-600">24/7 Emergency Service</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="font-semibold text-gray-800">Verified</h3>
              <p className="text-xs text-gray-600">Admin Approved</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold text-gray-800">Live Tracking</h3>
              <p className="text-xs text-gray-600">Real-time Updates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceAuth;