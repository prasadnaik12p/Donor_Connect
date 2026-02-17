const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");
const Notification = require("../models/Notification");

// 🩸 Create a new blood request (Recipient)
exports.createBloodRequest = async (req, res) => {
  try {
    const { bloodType, units, urgency, location, scheduledDate, notes } =
      req.body;

    console.log("🩸 Creating blood request - User:", req.user?.id);

    if (!bloodType || !units) {
      return res.status(400).json({
        message: "Blood type and units are required",
      });
    }

    // Create the blood request
    // ✅ SECURITY: Always use req.user.id from JWT token as recipient
    // NEVER accept recipient ID from frontend as it can be spoofed
    // The frontend validates session to prevent multi-tab issues
    const bloodRequest = await BloodRequest.create({
      recipient: req.user.id, // Logged-in user is the recipient
      bloodType,
      units,
      urgency: urgency || "medium",
      location,
      scheduledDate,
      notes,
      status: "pending",
    });

    // Populate for response
    const populatedRequest = await BloodRequest.findById(
      bloodRequest._id,
    ).populate("recipient", "name email phone");

    // WebSocket broadcast for real-time updates
    const io = req.app.get("io");

    // ✅ BROADCAST: Send to all donors in blood-donors room
    io.to("blood-donors").emit("new-blood-request", {
      message: "🆕 New blood request created",
      request: populatedRequest,
      bloodType: bloodType,
      urgency: urgency,
      timestamp: new Date(),
    });

    // Also broadcast to public updates
    io.emit("blood-request-update", {
      action: "new",
      request: populatedRequest,
    });

    res.status(201).json({
      message: "✅ Blood request created successfully",
      request: populatedRequest,
    });
  } catch (error) {
    console.error("❌ Error creating blood request:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 📋 Get all blood requests (Public - but with authorization checks)
exports.getAllRequests = async (req, res) => {
  try {
    const { status, bloodType, city } = req.query;

    let filter = {};

    // Only show pending requests to public, but authenticated users see more
    if (!req.user) {
      filter.status = "pending";
    } else {
      // Authenticated users can see pending and their own matched/completed requests
      filter = {
        $or: [
          { status: "pending" },
          { recipient: req.user.id },
          { donor: req.user.id },
        ],
      };
    }

    if (bloodType) filter.bloodType = bloodType;
    if (city) filter["location.city"] = new RegExp(city, "i");

    const requests = await BloodRequest.find(filter)
      .populate("donor", "name email phone")
      .populate("recipient", "name email phone")
      .sort({ urgency: -1, createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({
      message: "Error fetching requests",
      error: error.message,
    });
  }
};

// 💖 Accept blood request (Donor)
// 💖 Accept blood request (Donor) - WITH NOTIFICATION
exports.acceptBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const donorId = req.user.id;

    console.log(`💖 Donor ${donorId} accepting request ${id}`);
    console.log(`ℹ️ Donor user object:`, {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    });

    // Find the request
    const request = await BloodRequest.findById(id)
      .populate("recipient", "name email phone")
      .populate("donor", "name email phone");

    if (!request) {
      console.error(`❌ Request ${id} not found`);
      return res.status(404).json({ message: "Blood request not found" });
    }

    console.log(`📋 Request found:`, {
      id: request._id,
      status: request.status,
      recipient: request.recipient._id.toString(),
      donorId: donorId,
    });

    // ✅ Authorization: Cannot accept your own request
    if (request.recipient._id.toString() === donorId) {
      console.warn(
        `⚠️ User ${donorId} tried to accept their own request ${id}`,
      );
      return res.status(403).json({
        message: "You cannot accept your own blood request",
      });
    }

    // ✅ Authorization: Only pending requests can be accepted
    if (request.status !== "pending") {
      console.warn(
        `⚠️ Request ${id} is not pending (status: ${request.status})`,
      );
      return res.status(400).json({
        message: "This request is no longer available",
      });
    }

    // Find donor details
    const donor = await User.findById(donorId);
    if (!donor) {
      console.error(`❌ Donor ${donorId} not found in User collection`);
      return res.status(404).json({ message: "Donor not found" });
    }

    console.log(`✅ Donor found:`, donor.email);

    // Update request status and assign donor
    request.status = "matched";
    request.donor = donorId;
    await request.save();

    console.log(
      `✅ Request ${id} status updated to "matched" with donor ${donorId}`,
    );

    // ✅ Create notification for the recipient
    const notificationMessage = `🎉 Your blood request for ${
      request.bloodType
    } has been accepted by ${donor.name}. You can contact them at ${
      donor.email
    }${donor.phone ? ` or ${donor.phone}` : ""}.`;

    const notification = await Notification.create({
      recipient: request.recipient._id,
      title: "Blood Request Accepted!",
      message: notificationMessage,
      type: "request_accepted",
      relatedRequest: request._id,
      isRead: false,
    });

    console.log(
      "✅ Notification created for recipient:",
      request.recipient._id,
    );

    // WebSocket notifications
    const io = req.app.get("io");

    // ✅ TARGETED: Notify the recipient in real-time via their user room
    io.to(`user-${request.recipient._id}`).emit("blood-request-accepted", {
      type: "NEW_NOTIFICATION",
      notification: notification,
      requestId: request._id,
      donorName: donor.name,
      bloodType: request.bloodType,
    });

    // ✅ BROADCAST: Remove request from all donors' list
    io.to("blood-donors").emit("blood-request-taken", {
      requestId: request._id,
      message: `Blood request for ${request.bloodType} ${request.units} unit(s) was already matched`,
      donor: donor.name,
    });

    // Broadcast request update to all connected users
    io.emit("blood-request-update", {
      action: "matched",
      requestId: request._id,
      donor: donor.name,
      bloodRequest: request,
    });

    res.status(200).json({
      success: true,
      message: "✅ Blood request accepted successfully",
      request: await BloodRequest.findById(id)
        .populate("donor", "name email phone")
        .populate("recipient", "name email phone"),
    });
  } catch (error) {
    console.error("Error accepting blood request:", error);
    res.status(500).json({
      message: "Error accepting blood request",
      error: error.message,
    });
  }
};

// ✏️ Update blood request (Only by Recipient)
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodType, units, urgency, location, notes } = req.body;
    const userId = req.user.id;

    // Find request and check ownership
    const request = await BloodRequest.findOne({
      _id: id,
      recipient: userId, // ✅ Only recipient can update
    });

    if (!request) {
      return res.status(404).json({
        message:
          "Blood request not found or you are not authorized to update it",
      });
    }

    // ✅ Authorization: Only pending requests can be updated
    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Cannot update a request that has been accepted or completed",
      });
    }

    // Update allowed fields
    const updates = {};
    if (bloodType) updates.bloodType = bloodType;
    if (units) updates.units = units;
    if (urgency) updates.urgency = urgency;
    if (location) updates.location = location;
    if (notes !== undefined) updates.notes = notes;

    const updatedRequest = await BloodRequest.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("donor", "name email phone")
      .populate("recipient", "name email phone");

    // WebSocket update
    const io = req.app.get("io");

    // Broadcast to all donors about the updated request
    io.to("blood-donors").emit("blood-request-updated", {
      requestId: id,
      bloodRequest: updatedRequest,
      action: "updated",
    });

    // Notify recipient about their own update
    io.to(`user-${request.recipient._id}`).emit("blood-request-updated", {
      requestId: id,
      bloodRequest: updatedRequest,
    });

    res.status(200).json({
      message: "✅ Blood request updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({
      message: "Error updating request",
      error: error.message,
    });
  }
};

// ❌ Delete blood request (Only by Recipient)
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find request and check ownership
    const request = await BloodRequest.findOne({
      _id: id,
      recipient: userId, // ✅ Only recipient can delete
    });

    if (!request) {
      return res.status(404).json({
        message:
          "Blood request not found or you are not authorized to delete it",
      });
    }

    // ✅ Authorization: Only pending requests can be deleted
    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Cannot delete a request that has been accepted or completed",
      });
    }

    await BloodRequest.findByIdAndDelete(id);

    // WebSocket update
    const io = req.app.get("io");

    // Remove from donors' view
    io.to("blood-donors").emit("blood-request-deleted", {
      requestId: id,
      message: "Blood request was cancelled",
    });

    // Broadcast global update
    io.emit("blood-request-update", {
      action: "deleted",
      requestId: id,
    });

    res.status(200).json({
      message: "🗑️ Blood request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({
      message: "Error deleting request",
      error: error.message,
    });
  }
};

// ✅ Complete blood request (Both Recipient and Donor)
exports.completeBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const request = await BloodRequest.findById(id)
      .populate("recipient", "id name")
      .populate("donor", "id name");

    if (!request) {
      return res.status(404).json({ message: "Blood request not found" });
    }

    // ✅ Authorization: Only recipient or donor can complete
    const isRecipient = request.recipient._id.toString() === userId;
    const isDonor = request.donor && request.donor._id.toString() === userId;

    if (!isRecipient && !isDonor) {
      return res.status(403).json({
        message:
          "Only the recipient or donor can mark this request as completed",
      });
    }

    // ✅ Authorization: Only matched requests can be completed
    if (request.status !== "matched") {
      return res.status(400).json({
        message: "Only matched requests can be completed",
      });
    }

    request.status = "completed";
    request.completedDate = new Date();
    await request.save();

    // Create notifications for both parties
    const completedMessage = `✅ The blood request for ${request.bloodType} has been marked as completed.`;

    await Notification.create({
      recipient: request.recipient._id,
      title: "Request Completed",
      message: completedMessage,
      type: "request_completed",
      relatedRequest: request._id,
    });

    if (request.donor) {
      await Notification.create({
        recipient: request.donor._id,
        title: "Request Completed",
        message: completedMessage,
        type: "request_completed",
        relatedRequest: request._id,
      });
    }

    // ✅ Socket notifications
    const io = req.app.get("io");

    // Notify both parties via their user rooms
    io.to(`user-${request.recipient._id}`).emit("blood-request-completed", {
      requestId: request._id,
      message: completedMessage,
      bloodType: request.bloodType,
    });

    if (request.donor) {
      io.to(`user-${request.donor._id}`).emit("blood-request-completed", {
        requestId: request._id,
        message: completedMessage,
        bloodType: request.bloodType,
      });
    }

    // Broadcast completion to all
    io.emit("blood-request-update", {
      action: "completed",
      requestId: request._id,
      bloodType: request.bloodType,
    });

    res.status(200).json({
      message: "✅ Blood request marked as completed",
      request: request,
    });
  } catch (error) {
    console.error("Error completing request:", error);
    res.status(500).json({
      message: "Error completing request",
      error: error.message,
    });
  }
};

// 👤 Get user's blood requests (both as recipient and donor)
exports.getMyBloodRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await BloodRequest.find({
      $or: [
        { recipient: userId }, // Requests I created
        { donor: userId }, // Requests I accepted
      ],
    })
      .populate("donor", "name email phone")
      .populate("recipient", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching user requests:", error);
    res.status(500).json({
      message: "Error fetching your blood requests",
      error: error.message,
    });
  }
};

// 👥 Get all donors
exports.getDonors = async (req, res) => {
  try {
    const donors = await User.find({ role: "donor", isVerified: true })
      .select("name email phone bloodType location city")
      .limit(20);

    res.status(200).json(donors);
  } catch (error) {
    console.error("Error fetching donors:", error);
    res.status(500).json({
      message: "Error fetching donors",
      error: error.message,
    });
  }
};

// 🏥 Get nearby blood banks
exports.getNearbyBloodBanks = async (req, res) => {
  try {
    const { lat, lng, location } = req.query;
    // ... your existing getNearbyBloodBanks implementation
    res.status(200).json({
      success: true,
      bloodBanks: [], // Add your implementation here
    });
  } catch (error) {
    console.error("Error fetching blood banks:", error);
    res.status(500).json({
      message: "Error fetching blood banks",
      error: error.message,
    });
  }
};

// 🔔 Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// 📌 Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};

// 🗑️ Clear all notifications
exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.deleteMany({ recipient: userId });

    res.status(200).json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({
      message: "Error clearing notifications",
      error: error.message,
    });
  }
};


exports.getNearbyBloodBanks = async (req, res) => {
  try {
    const { lat, lng, radius = 10000, location } = req.query;
    
    console.log(`🔍 Fetching blood banks with params:`, { lat, lng, radius, location });

    // Check if we have required parameters
    if (!lat && !lng && !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide either coordinates (lat, lng) or location name"
      });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    // If no API key, return mock data
    if (!apiKey) {
      console.log("⚠️ Google Maps API key not configured, returning mock data");
      const mockBloodBanks = getMockBloodBanks(location || "Bangalore");
      return res.status(200).json({
        success: true,
        count: mockBloodBanks.length,
        bloodBanks: mockBloodBanks,
        note: "Using mock data - Configure GOOGLE_MAPS_API_KEY for real data"
      });
    }

    let searchUrl = '';
    
    // Build the Google Maps API URL based on available parameters
    if (lat && lng) {
      // Use coordinates-based search
      searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=hospital&keyword=blood+bank&key=${apiKey}`;
    } else {
      // Use text-based search with location name
      searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=blood+bank+hospital+${encodeURIComponent(location)}&type=hospital&key=${apiKey}`;
    }

    console.log(`🌐 Calling Google Maps API: ${searchUrl}`);

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("❌ Google Maps API error:", data.status, data.error_message);
      // Fallback to mock data on API error
      const mockBloodBanks = getMockBloodBanks(location || "Bangalore");
      return res.status(200).json({
        success: true,
        count: mockBloodBanks.length,
        bloodBanks: mockBloodBanks,
        note: `Using mock data due to API error: ${data.status}`
      });
    }

    let bloodBanks = [];

    if (data.results && data.results.length > 0) {
      // Process real API results
      bloodBanks = await Promise.all(
        data.results.slice(0, 15).map(async (place) => {
          // Get additional details including phone number
          let phone = "";
          let hours = "";
          let website = "";
          
          try {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,opening_hours,website,url&key=${apiKey}`;
            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();
            
            if (detailsData.status === "OK") {
              phone = detailsData.result.formatted_phone_number || "";
              website = detailsData.result.website || "";
              
              // Format opening hours
              if (detailsData.result.opening_hours && detailsData.result.opening_hours.weekday_text) {
                hours = detailsData.result.opening_hours.weekday_text.join(", ");
              }
            }
          } catch (error) {
            console.log("Could not fetch additional details for:", place.name);
          }

          // Calculate distance if coordinates are available
          let distance = "Nearby";
          if (lat && lng && place.geometry && place.geometry.location) {
            const placeLat = place.geometry.location.lat;
            const placeLng = place.geometry.location.lng;
            distance = calculateDistance(lat, lng, placeLat, placeLng);
          }

          return {
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            phone: phone,
            hours: hours,
            website: website,
            rating: place.rating || "Not rated",
            distance: distance,
            location: {
              lat: place.geometry?.location?.lat || 0,
              lng: place.geometry?.location?.lng || 0
            },
            types: place.types || [],
            isOpen: place.opening_hours ? place.opening_hours.open_now : null,
            googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
          };
        })
      );
    } else {
      // No results from API, use mock data
      console.log("📭 No blood banks found via API, using mock data");
      bloodBanks = getMockBloodBanks(location || "Bangalore");
    }

    console.log(`✅ Found ${bloodBanks.length} blood banks/hospitals`);

    res.status(200).json({
      success: true,
      count: bloodBanks.length,
      bloodBanks: bloodBanks,
      searchLocation: location || `${lat},${lng}`,
      source: data.results ? 'google_maps' : 'mock_data'
    });

  } catch (error) {
    console.error("❌ Error fetching blood banks:", error);
    
    // Always return mock data as fallback in case of error
    const mockBloodBanks = getMockBloodBanks(req.query.location || "Bangalore");
    res.status(200).json({
      success: true,
      count: mockBloodBanks.length,
      bloodBanks: mockBloodBanks,
      note: "Using mock data due to server error",
      source: 'mock_data'
    });
  }
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance < 1 ? 
    `${Math.round(distance * 1000)} meters` : 
    `${Math.round(distance * 10) / 10} km`;
}