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
      <nav className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo & Hamburger */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 sm:p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Toggle menu"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 flex flex-col justify-center space-y-1">
                  <span
                    className={`block h-0.5 w-full bg-current transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
                  ></span>
                  <span
                    className={`block h-0.5 w-full bg-current transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`}
                  ></span>
                  <span
                    className={`block h-0.5 w-full bg-current transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                  ></span>
                </div>
              </button>

              {/* Logo */}
              <Link
                to="/"
                className="flex items-center space-x-1.5 sm:space-x-2 group"
                onClick={() => setIsMenuOpen(false)}
              >
                {/* <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <span className="text-sm sm:text-base md:text-lg">
                    
                  </span>
                </div> */}
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-red-500 mb-0.5 leading-tight">
                  Donor Connect
                </h1>
                <div className="hidden xs:block">
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight">
                    DonorConnect
                  </h1>
                  <p className="text-[10px] sm:text-xs text-gray-400 -mt-0.5 font-medium leading-tight hidden sm:block">
                    Life Saving Platform
                  </p>
                </div>
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 flex-shrink-0">
              {user || hospital || ambulance || admin ? (
                <>
                  <div className="flex-shrink-0">
                    <NotificationBell user={user} />
                  </div>

                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    {/* User Info - Hidden on mobile */}
                    <div className="hidden lg:flex flex-col items-end mr-1">
                      <span className="text-xs md:text-sm font-medium text-gray-200 truncate max-w-[150px]">
                        {getWelcomeText()}
                      </span>
                      {roleType && (
                        <span
                          className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full ${roleType.color} font-medium`}
                        >
                          {roleType.type}
                        </span>
                      )}
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={onLogout}
                      className="bg-gray-700 text-gray-200 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 rounded-lg text-[11px] sm:text-xs md:text-sm font-medium hover:bg-gray-600 transition-colors border border-gray-600 whitespace-nowrap"
                    >
                      <span className="hidden sm:inline mb-0.5">Logout</span>
                      <span className="sm:hidden mb-0.5">Exit</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 rounded-lg text-[11px] sm:text-xs md:text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 rounded-lg text-[11px] sm:text-xs md:text-sm font-medium hover:from-red-700 hover:to-pink-700 transition-colors shadow-sm whitespace-nowrap"
                  >
                    <span className="hidden xs:inline">Get Started</span>
                    <span className="xs:hidden">Join</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu - Dropdown */}
        <div
          className={`transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
        >
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 px-3 sm:px-4 py-2 sm:py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Main Navigation Links */}
            {!hospital && !ambulance && !admin && (
              <>
                <div className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 sm:px-4 py-1.5 sm:py-2">
                  Main Navigation
                </div>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                        isActive
                          ? "text-red-400 bg-gray-700 border border-red-500"
                          : "text-gray-300 hover:text-white hover:bg-gray-700"
                      }`}
                    >
                      <span className="text-base sm:text-lg flex-shrink-0">
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}

            {/* Professional Access Links */}
            {!user && !hospital && !ambulance && !admin && (
              <>
                <div className="border-t border-gray-700 my-1.5 sm:my-2"></div>
                <div className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 sm:px-4 py-1.5 sm:py-2">
                  Professional Access
                </div>
                {professionalLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors text-gray-300 hover:text-white hover:bg-gray-700`}
                  >
                    <span className="text-base sm:text-lg flex-shrink-0">
                      {link.icon}
                    </span>
                    <span className="truncate">{link.label}</span>
                  </Link>
                ))}
              </>
            )}

            {/* User Info in Menu - Mobile Only */}
            {(user || hospital || ambulance || admin) && (
              <>
                <div className="border-t border-gray-700 my-1.5 sm:my-2 lg:hidden"></div>
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 rounded-lg lg:hidden">
                  <div className="text-sm font-medium text-gray-200 truncate">
                    {getWelcomeText()}
                  </div>
                  {roleType && (
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${roleType.color} inline-block mt-1.5 font-medium`}
                    >
                      {roleType.type}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay for menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  );
}

export default Navbar