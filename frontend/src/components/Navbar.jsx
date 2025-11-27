import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import NotificationBell from './NotificationBell'

const Navbar = ({ user, hospital, ambulance, admin, onLogout }) => {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/hospitals', label: 'Hospitals', icon: '🏥' },
    { path: '/blood-donation', label: 'Blood Donation', icon: '🩸' },
    { path: '/ambulance', label: 'Ambulance', icon: '🚑' },
    { path: '/fund-requests', label: 'Fund Requests', icon: '💰' },
  ]

  const professionalLinks = [
    { path: '/hospital-login', label: 'Hospital Login', icon: '🏥', color: 'text-blue-600' },
    { path: '/ambulance-login', label: 'Ambulance Login', icon: '🚑', color: 'text-green-600' },
    { path: '/admin-login', label: 'Admin Login', icon: '⚙️', color: 'text-purple-600' },
  ]

  const getWelcomeText = () => {
    if (user) return `Welcome, ${user.name}`
    if (hospital) return `${hospital.name}`
    if (ambulance) return `${ambulance.name}`
    if (admin) return 'Admin Panel'
    return null
  }

  const getRoleType = () => {
    if (user) return { type: 'User', color: 'bg-blue-100 text-blue-800' }
    if (hospital) return { type: 'Hospital', color: 'bg-blue-100 text-blue-800' }
    if (ambulance) return { type: 'Ambulance', color: 'bg-green-100 text-green-800' }
    if (admin) return { type: 'Admin', color: 'bg-purple-100 text-purple-800' }
    return null
  }

  const roleType = getRoleType()

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Hamburger */}
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu Button - ALWAYS VISIBLE */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                  <span className={`block h-0.5 w-6 bg-current transition-transform ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                  <span className={`block h-0.5 w-6 bg-current transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`block h-0.5 w-6 bg-current transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                </div>
              </button>

              {/* Logo */}
              <Link 
                to="/" 
                className="flex items-center space-x-3 group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-lg text-white">❤️</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">DonorConnect</h1>
                  <p className="text-xs text-gray-500 -mt-1 font-medium">Life Saving Platform</p>
                </div>
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {user || hospital || ambulance || admin ? (
                <>
                  <NotificationBell user={user} />
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-gray-900">
                        {getWelcomeText()}
                      </span>
                      {roleType && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${roleType.color} font-medium`}>
                          {roleType.type}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={onLogout}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-300"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  {/* Auth Buttons */}
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu - ALWAYS VISIBLE WHEN OPEN */}
        <div className={`transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="bg-white border-t border-gray-200 px-4 py-3 space-y-1">
            {/* Main Navigation Links */}
            {!hospital && !ambulance && !admin && (
              <>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-2">
                  Main Navigation
                </div>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive
                          ? 'text-red-700 bg-red-50 border border-red-200'
                          : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </>
            )}

            {/* Professional Access Links */}
            {!user && !hospital && !ambulance && !admin && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-2">
                  Professional Access
                </div>
                {professionalLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${link.color} hover:bg-gray-50`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </>
            )}

            {/* User Info in Menu */}
            {(user || hospital || ambulance || admin) && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">
                    {getWelcomeText()}
                  </div>
                  {roleType && (
                    <div className={`text-xs px-2 py-1 rounded-full ${roleType.color} inline-block mt-1 font-medium`}>
                      {roleType.type}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay for menu - ALWAYS VISIBLE WHEN OPEN */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  )
}

export default Navbar