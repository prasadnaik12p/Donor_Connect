import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    platform: [
      { name: 'Dashboard', path: '/' },
      { name: 'Hospitals', path: '/hospitals' },
      { name: 'Blood Donation', path: '/blood-donation' },
      { name: 'Ambulance Services', path: '/ambulance' },
      { name: 'Fund Requests', path: '/fund-requests' },
    ],
    professional: [
      { name: 'Hospital Login', path: '/hospital-login' },
      { name: 'Ambulance Login', path: '/ambulance-login' },
      { name: 'Admin Login', path: '/admin-login' },
      { name: 'Hospital Registration', path: '/hospital-register' },
      { name: 'Ambulance Registration', path: '/ambulance-register' },
    ],
    support: [
      { name: 'About Us', path: '#' },
      { name: 'Contact Us', path: '#' },
      { name: 'FAQs', path: '#' },
      { name: 'Privacy Policy', path: '#' },
      { name: 'Terms of Service', path: '#' },
    ],
  }

  const socialLinks = [
    { name: 'Facebook', icon: '📘', url: '#' },
    { name: 'Twitter', icon: '🐦', url: '#' },
    { name: 'Instagram', icon: '📷', url: '#' },
    { name: 'LinkedIn', icon: '💼', url: '#' },
  ]

  const stats = [
    { label: 'Hospitals', value: '500+' },
    { label: 'Donors', value: '10K+' },
    { label: 'Lives Saved', value: '2K+' },
    { label: 'Funds Raised', value: '₹1M+' },
  ]

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-gray-300 mt-auto">
      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-purple-100 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* About Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-lg">❤️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">DonorConnect</h3>
                <p className="text-xs text-gray-400 -mt-0.5">Life Saving Platform</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              A comprehensive platform connecting donors, hospitals, and patients to save lives
              through blood donation, medical funding, and emergency services.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-9 h-9 bg-slate-800 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                  aria-label={social.name}
                >
                  <span className="text-base">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center">
              <span className="mr-2">🏥</span>
              Platform
            </h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-red-500 transition-colors duration-200 flex items-center group"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Professional Access */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center">
              <span className="mr-2">👨‍⚕️</span>
              Professional
            </h4>
            <ul className="space-y-2">
              {footerLinks.professional.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-pink-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center">
              <span className="mr-2">💬</span>
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.path}
                    className="text-sm text-gray-400 hover:text-pink-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Emergency Contact Banner */}
        <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-xl">🚨</span>
              </div>
              <div>
                <h5 className="text-base sm:text-lg font-bold text-white mb-1">Emergency Hotline</h5>
                <p className="text-xs sm:text-sm text-gray-400">Available 24/7 for life-saving assistance</p>
              </div>
            </div>
            <a
              href="tel:108"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-colors duration-200 whitespace-nowrap w-full sm:w-auto text-center shadow-lg"
            >
              📞 Call 108
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
              <p className="mb-1 sm:mb-0">
                © {currentYear} DonorConnect. All rights reserved.
              </p>
              <p className="text-xs text-gray-500">
                Made with <span className="text-pink-500">❤️</span> for saving lives
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                Privacy
              </a>
              <span className="text-gray-600">•</span>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                Terms
              </a>
              <span className="text-gray-600">•</span>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                Cookies
              </a>
              <span className="text-gray-600">•</span>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button (visible on scroll) */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform hover:scale-110 z-40"
        aria-label="Scroll to top"
      >
        <span className="text-lg sm:text-xl">↑</span>
      </button>
    </footer>
  )
}

export default Footer
