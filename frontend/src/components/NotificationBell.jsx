import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const NotificationBell = ({ user }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get('/notifications/unread-count', { headers });
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchRecentNotifications = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await axios.get('/notifications?limit=5', { headers });
      setRecentNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const headers = getAuthHeaders();
      await axios.put(`/notifications/${notificationId}/read`, {}, { headers });
      
      setRecentNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const headers = getAuthHeaders();
      await axios.put('/notifications/mark-all-read', {}, { headers });
      setUnreadCount(0);
      fetchRecentNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      fetchRecentNotifications();
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'request_accepted': '🎉',
      'request_completed': '✅',
      'blood_match': '🩸',
      'emergency': '🚨',
      'message': '💬',
      'system': '⚙️',
      'donation': '❤️',
      'default': '🔔'
    };
    return icons[type] || icons.default;
  };

  const getNotificationColor = (type) => {
    const colors = {
      'request_accepted': 'text-green-600 bg-green-100',
      'request_completed': 'text-blue-600 bg-blue-100',
      'blood_match': 'text-red-600 bg-red-100',
      'emergency': 'text-orange-600 bg-orange-100',
      'message': 'text-purple-600 bg-purple-100',
      'system': 'text-gray-600 bg-gray-100',
      'donation': 'text-pink-600 bg-pink-100',
      'default': 'text-gray-600 bg-gray-100'
    };
    return colors[type] || colors.default;
  };

  return (
    <div className="relative">
      {/* Enhanced Notification Bell */}
      <button
        onClick={handleBellClick}
        className="relative p-3 rounded-2xl transition-all duration-300 hover:shadow-lg group"
      >
        <div className={`relative p-2 rounded-xl transition-all duration-300 ${
          unreadCount > 0 
            ? 'bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-200' 
            : 'bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 hover:border-blue-300'
        }`}>
          <span className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${
            unreadCount > 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {unreadCount > 0 ? '🔔' : '🔕'}
          </span>
          
          {/* Enhanced Notification Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-xs min-w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Enhanced Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 transform origin-top-right animate-scale-in">
          {/* Dropdown Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-4 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Notifications</h3>
                <p className="text-blue-100 text-sm">
                  {unreadCount > 0 ? `${unreadCount} unread messages` : 'All caught up!'}
                </p>
              </div>
              <div className="flex space-x-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-xl text-sm font-medium backdrop-blur-sm transition-all duration-300"
                  >
                    Mark all read
                  </button>
                )}
                <Link 
                  to="/notifications" 
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-xl text-sm font-medium backdrop-blur-sm transition-all duration-300"
                  onClick={() => setShowDropdown(false)}
                >
                  View All
                </Link>
              </div>
            </div>
          </div>
          
          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 text-sm mt-2">Loading notifications...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-500 font-medium">No notifications</p>
                <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-300 group ${
                    !notification.isRead ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <div className="flex space-x-4">
                    {/* Notification Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`font-semibold text-sm leading-tight ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1 ml-2 animate-pulse"></div>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        {new Date(notification.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  {!notification.isRead && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:shadow-md transition-all duration-300"
                      >
                        Mark as Read
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Dropdown Footer */}
          {recentNotifications.length > 0 && (
            <div className="bg-gray-50 rounded-b-2xl p-3 border-t border-gray-200">
              <Link 
                to="/notifications" 
                className="block text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                onClick={() => setShowDropdown(false)}
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  );
};

export default NotificationBell;