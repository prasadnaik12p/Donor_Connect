import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentUserId = null;
    this.currentAmbulanceId = null;
  }

  // Initialize socket connection
  connect(userId = null, ambulanceId = null) {
    // If different user/ambulance logged in, we need to re-join rooms
    const userChanged = this.currentUserId !== userId;
    const ambulanceChanged = this.currentAmbulanceId !== ambulanceId;

    if (this.isConnected && this.socket && !userChanged && !ambulanceChanged) {
      console.log('Socket already connected for same user/ambulance');
      return this.socket;
    }

    // If user/ambulance changed but socket still connected, update the rooms
    if (this.isConnected && this.socket && (userChanged || ambulanceChanged)) {
      console.log('User/Ambulance changed, updating socket rooms...');
      this.currentUserId = userId;
      this.currentAmbulanceId = ambulanceId;

      // Emit updated join events
      if (userId) {
        this.socket.emit('user-join', userId);
      }
      if (ambulanceId) {
        this.socket.emit('ambulance-join', ambulanceId);
      }
      return this.socket;
    }

    const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

    this.socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    // Store current user/ambulance IDs
    this.currentUserId = userId;
    this.currentAmbulanceId = ambulanceId;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;

      // Join appropriate rooms
      if (this.currentUserId) {
        console.log('📝 Joining user room:', this.currentUserId);
        this.socket.emit('user-join', this.currentUserId);
      }
      if (this.currentAmbulanceId) {
        console.log('🚑 Joining ambulance emergency room:', this.currentAmbulanceId);
        this.socket.emit('ambulance-join', this.currentAmbulanceId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      this.isConnected = false;
      // Don't reset IDs on disconnect - they might reconnect automatically
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for successful ambulance connection
    this.socket.on('ambulance-connected', (data) => {
      console.log('✅ Ambulance successfully connected to emergency system:', data);
    });

    // Listen for connection errors
    this.socket.on('connection-error', (data) => {
      console.error('❌ Socket connection error from server:', data);
    });

    return this.socket;
  }

  // Join emergency room (for ambulances)
  joinEmergencyRoom() {
    if (!this.socket) return;
    this.socket.emit('ambulance-join');
  }

  // Listen for new emergencies
  onNewEmergency(callback) {
    if (!this.socket) return;
    this.socket.on('new-emergency', callback);
  }

  // Listen for emergency taken event
  onEmergencyTaken(callback) {
    if (!this.socket) return;
    this.socket.on('emergency-taken', callback);
  }

  // Listen for emergency accepted
  onEmergencyAccepted(callback) {
    if (!this.socket) return;
    this.socket.on('emergency-accepted', callback);
  }

  // Listen for ambulance online
  onAmbulanceOnline(callback) {
    if (!this.socket) return;
    this.socket.on('ambulance-online', callback);
  }

  // Accept an emergency
  acceptEmergency(emergencyId, ambulanceId) {
    if (!this.socket) return;
    this.socket.emit('accept-emergency', { emergencyId, ambulanceId });
  }

  // Listen for emergency accepted confirmation
  onEmergencyAcceptedConfirm(callback) {
    if (!this.socket) return;
    this.socket.on('emergency-accepted-confirm', callback);
  }

  // Listen for ambulance connection
  onAmbulanceConnected(callback) {
    if (!this.socket) return;
    this.socket.on('ambulance-connected', callback);
  }

  // Update ambulance location
  updateAmbulanceLocation(ambulanceId, coordinates, status = null) {
    if (!this.socket) return;
    this.socket.emit('update-ambulance-location', { 
      ambulanceId, 
      coordinates, 
      status 
    });
  }

  // Complete emergency
  completeEmergency(ambulanceId, emergencyId) {
    if (!this.socket) return;
    this.socket.emit('complete-emergency', { ambulanceId, emergencyId });
  }

  // Listen for emergency completed
  onEmergencyCompleted(callback) {
    if (!this.socket) return;
    this.socket.on('emergency-completed', callback);
  }

  // ✅ NEW: Blood Donation Socket Methods

  // Donor joins blood donation network
  joinBloodDonors(userId) {
    if (!this.socket) return;
    this.socket.emit('donor-join', userId);
    console.log('💉 Donor joined blood donation network');
  }

  // Listen for new blood requests
  onNewBloodRequest(callback) {
    if (!this.socket) return;
    this.socket.on('new-blood-request', callback);
  }

  // Listen for blood request acceptance
  onBloodRequestAccepted(callback) {
    if (!this.socket) return;
    this.socket.on('blood-request-accepted', callback);
  }

  // Listen for blood request completion
  onBloodRequestCompleted(callback) {
    if (!this.socket) return;
    this.socket.on('blood-request-completed', callback);
  }

  // Listen for blood request taken by another donor
  onBloodRequestTaken(callback) {
    if (!this.socket) return;
    this.socket.on('blood-request-taken', callback);
  }

  // Listen for blood request deleted
  onBloodRequestDeleted(callback) {
    if (!this.socket) return;
    this.socket.on('blood-request-deleted', callback);
  }

  // Listen for blood request updated
  onBloodRequestUpdated(callback) {
    if (!this.socket) return;
    this.socket.on('blood-request-updated', callback);
  }

  // Listen for general blood request updates
  onBloodRequestUpdate(callback) {
    if (!this.socket) return;
    this.socket.on('blood-request-update', callback);
  }

  // Accept blood request
  acceptBloodRequest(requestId, donorId) {
    if (!this.socket) return;
    this.socket.emit('accept-blood-request', { requestId, donorId });
  }

  // Update donor availability status
  updateDonorStatus(userId, newStatus) {
    if (!this.socket) return;
    this.socket.emit('update-donor-status', { userId, newStatus });
  }

  // Listen for donor status changes
  onDonorStatusChanged(callback) {
    if (!this.socket) return;
    this.socket.on('donor-status-changed', callback);
  }

  // Listen for donor connection confirmation
  onDonorConnected(callback) {
    if (!this.socket) return;
    this.socket.on('donor-connected', callback);
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      console.log('Socket disconnected');
    }
  }

  // Cleanup listener
  removeListener(eventName) {
    if (this.socket) {
      this.socket.off(eventName);
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if connected
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

// Export singleton instance
export default new SocketService();
