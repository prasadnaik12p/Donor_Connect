import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const NotificationInbox = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await axios.get('/notifications', { headers });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get('/notifications/unread-count', { headers });
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const headers = getAuthHeaders();
      await axios.put(`/notifications/${notificationId}/read`, {}, { headers });
      
      setNotifications(prev => prev.map(notif => 
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const headers = getAuthHeaders();
      await axios.put('/notifications/mark-all-read', {}, { headers });
      
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`/notifications/${notificationId}`, { headers });
      
      const deletedNotif = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    
    try {
      const headers = getAuthHeaders();
      await axios.delete('/notifications', { headers });
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
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
      'request_accepted': 'bg-green-100 text-green-800 border-green-200',
      'request_completed': 'bg-blue-100 text-blue-800 border-blue-200',
      'blood_match': 'bg-red-100 text-red-800 border-red-200',
      'emergency': 'bg-orange-100 text-orange-800 border-orange-200',
      'message': 'bg-purple-100 text-purple-800 border-purple-200',
      'system': 'bg-gray-100 text-gray-800 border-gray-200',
      'donation': 'bg-pink-100 text-pink-800 border-pink-200',
      'default': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || colors.default;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h2>
          <p className="text-gray-600 mb-6">Please login to view your notifications</p>
          <Link 
            to="/login" 
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 inline-block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 text-white mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                📬 Notification Inbox
              </h1>
              <p className="text-blue-100 text-sm sm:text-base md:text-lg">
                Stay updated with your blood donation activities
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {unreadCount > 0 && (
                <div className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl">
                  <span className="font-bold text-base sm:text-lg">
                    {unreadCount}
                  </span>
                  <span className="text-blue-100 ml-2 text-sm sm:text-base">
                    unread
                  </span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold backdrop-blur-sm transition-all duration-300 whitespace-nowrap"
                  >
                    Mark All Read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="bg-red-500/80 hover:bg-red-500 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold backdrop-blur-sm transition-all duration-300 whitespace-nowrap"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {["all", "unread", "read"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 min-w-[80px] px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all duration-300 whitespace-nowrap ${
                  filter === tab
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}{" "}
                {tab === "unread" && unreadCount > 0 && `(${unreadCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Notifications List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">
                Loading your notifications...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📭</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {filter === "all"
                  ? "No notifications yet"
                  : `No ${filter} notifications`}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {filter === "all"
                  ? "You'll see updates about your blood requests and donations here."
                  : `You don't have any ${filter} notifications at the moment.`}
              </p>
              {filter === "all" && (
                <Link
                  to="/blood-donation"
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 inline-block"
                >
                  Create Blood Request
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 sm:p-4 md:p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group ${
                    !notification.isRead
                      ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex gap-2 sm:gap-3 md:gap-4">
                    {/* Notification Icon */}
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl md:text-2xl border-2 flex-shrink-0 ${getNotificationColor(notification.type)}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <h3
                          className={`text-sm sm:text-base md:text-lg font-bold break-words ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {notification.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold hover:shadow-md transition-all duration-300 whitespace-nowrap"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold hover:shadow-md transition-all duration-300 whitespace-nowrap"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed break-words">
                        {notification.message}
                      </p>

                      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mt-3">
                        <p className="text-gray-500 text-[10px] xs:text-xs sm:text-sm">
                          {new Date(notification.createdAt).toLocaleString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>

                        {notification.relatedRequest && (
                          <div className="bg-gray-100 px-2 sm:px-3 py-1 rounded-full text-[10px] xs:text-xs text-gray-600 font-medium whitespace-nowrap">
                            🩸 {notification.relatedRequest.bloodType} •{" "}
                            {notification.relatedRequest.units} unit(s)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Footer */}
        {notifications.length > 0 && (
          <div className="mt-4 sm:mt-6 bg-white rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <p className="text-gray-700 font-medium text-xs sm:text-sm md:text-base">
                  Showing {filteredNotifications.length} of{" "}
                  {notifications.length} notifications
                </p>
              </div>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                <Link
                  to="/blood-donation"
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl text-xs sm:text-sm font-semibold hover:shadow-lg transition-all duration-300 text-center whitespace-nowrap"
                >
                  🩸 New Blood Request
                </Link>
                <Link
                  to="/dashboard"
                  className="bg-gradient-to-r from-gray-500 to-blue-500 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl text-xs sm:text-sm font-semibold hover:shadow-lg transition-all duration-300 text-center whitespace-nowrap"
                >
                  📊 Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationInbox;