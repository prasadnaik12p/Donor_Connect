const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");
const Notification = require("../models/Notification");

//  Create a new blood request (Recipient)
exports.createBloodRequest = async (req, res) => {
  try {
    const { bloodType, units, urgency, location, scheduledDate, notes } =
      req.body;

   

    if (!bloodType || !units) {
      return res.status(400).json({
        message: "Blood type and units are required",
      });
    }

    // Create the blood request
  
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

    // Send to all donors in blood-donors room
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
      message: "Blood request created successfully",
      request: populatedRequest,
    });
  } catch (error) {
    
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//  Get all blood requests (Public - but with authorization checks)
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


//  Accept blood request (Donor) 
exports.acceptBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const donorId = req.user.id;


    // Find the request
    const request = await BloodRequest.findById(id)
      .populate("recipient", "name email phone")
      .populate("donor", "name email phone");

    if (!request) {
      
      return res.status(404).json({ message: "Blood request not found" });
    }

   

    //  Authorization: Cannot accept your own request
    if (request.recipient._id.toString() === donorId) {
     
      return res.status(403).json({
        message: "You cannot accept your own blood request",
      });
    }

    //  Authorization: Only pending requests can be accepted
    if (request.status !== "pending") {
      
      return res.status(400).json({
        message: "This request is no longer available",
      });
    }

    // Find donor details
    const donor = await User.findById(donorId);
    if (!donor) {
     
      return res.status(404).json({ message: "Donor not found" });
    }

   

    // Update request status and assign donor
    request.status = "matched";
    request.donor = donorId;
    await request.save();

   

    // Create notification for the recipient
    const notificationMessage = `Your blood request for ${
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
      "Notification created for recipient:",
      request.recipient._id,
    );

    // WebSocket notifications
    const io = req.app.get("io");

    // TARGETED: Notify the recipient in real-time via their user room
    io.to(`user-${request.recipient._id}`).emit("blood-request-accepted", {
      type: "NEW_NOTIFICATION",
      notification: notification,
      requestId: request._id,
      donorName: donor.name,
      bloodType: request.bloodType,
    });

    //  BROADCAST: Remove request from all donors' list
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
   
    res.status(500).json({
      message: "Error accepting blood request",
      error: error.message,
    });
  }
};

//  Update blood request (Only by Recipient)
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

    //  Authorization: Only pending requests can be updated
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

//  Delete blood request (Only by Recipient)
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find request and check ownership
    const request = await BloodRequest.findOne({
      _id: id,
      recipient: userId, 
    });

    if (!request) {
      return res.status(404).json({
        message:
          "Blood request not found or you are not authorized to delete it",
      });
    }

    //  Authorization: Only pending requests can be deleted
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
    res.status(500).json({
      message: "Error deleting request",
      error: error.message,
    });
  }
};

//  Complete blood request (Both Recipient and Donor)
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

    //  Authorization: Only recipient or donor can complete
    const isRecipient = request.recipient._id.toString() === userId;
    const isDonor = request.donor && request.donor._id.toString() === userId;

    if (!isRecipient && !isDonor) {
      return res.status(403).json({
        message:
          "Only the recipient or donor can mark this request as completed",
      });
    }

    // Authorization: Only matched requests can be completed
    if (request.status !== "matched") {
      return res.status(400).json({
        message: "Only matched requests can be completed",
      });
    }

    request.status = "completed";
    request.completedDate = new Date();
    await request.save();

    // Create notifications for both parties
    const completedMessage = `The blood request for ${request.bloodType} has been marked as completed.`;

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

    //  Socket notifications
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
      message: "Blood request marked as completed",
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

//  Get user's blood requests (both as recipient and donor)
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

//  Get user notifications
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

// Mark notification as read
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

// Clear all notifications
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
    
    console.log(` Fetching blood banks with params:`, { lat, lng, radius, location });

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
      console.log(" Google Maps API key not configured, returning mock data");
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

    console.log(`Calling Google Maps API: ${searchUrl}`);

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Maps API error:", data.status, data.error_message);
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
      console.log("No blood banks found via API, using mock data");
      bloodBanks = getMockBloodBanks(location || "Bangalore");
    }

    console.log(`Found ${bloodBanks.length} blood banks/hospitals`);

    res.status(200).json({
      success: true,
      count: bloodBanks.length,
      bloodBanks: bloodBanks,
      searchLocation: location || `${lat},${lng}`,
      source: data.results ? 'google_maps' : 'mock_data'
    });

  } catch (error) {
    console.error("Error fetching blood banks:", error);
    
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

// Helper function to generate mock blood bank data
function getMockBloodBanks(location = "Bangalore") {
  const bloodBanks = {
    "Bangalore": [
      {
        id: "mock_1",
        name: "Bangalore Blood Bank",
        address: "Victoria Hospital Campus, Fort, Bangalore - 560002",
        phone: "+91-80-26705317",
        hours: "24 hours",
        rating: 4.5,
        distance: "2.5 km",
        location: { lat: 12.9716, lng: 77.5946 },
        types: ["blood_bank", "hospital"],
        isOpen: true,
        googleMapsUrl: "https://www.google.com/maps"
      },
      {
        id: "mock_2",
        name: "Rotary TTK Blood Bank",
        address: "TTK Road, Alwarpet, Chennai - 600018",
        phone: "+91-44-24981088",
        hours: "Mon-Sat: 8:00 AM - 6:00 PM",
        rating: 4.7,
        distance: "3.2 km",
        location: { lat: 13.0358, lng: 80.2536 },
        types: ["blood_bank"],
        isOpen: true,
        googleMapsUrl: "https://www.google.com/maps"
      },
      {
        id: "mock_3",
        name: "St. John's Medical College Blood Bank",
        address: "Sarjapur Road, Bangalore - 560034",
        phone: "+91-80-49467777",
        hours: "24 hours",
        rating: 4.6,
        distance: "5.0 km",
        location: { lat: 12.9279, lng: 77.6271 },
        types: ["blood_bank", "hospital"],
        isOpen: true,
        googleMapsUrl: "https://www.google.com/maps"
      },
      {
        id: "mock_4",
        name: "Indian Red Cross Society Blood Bank",
        address: "Red Cross Bhavan, Race Course Road, Bangalore - 560001",
        phone: "+91-80-22261122",
        hours: "Mon-Sun: 9:00 AM - 5:00 PM",
        rating: 4.3,
        distance: "1.8 km",
        location: { lat: 12.9698, lng: 77.5961 },
        types: ["blood_bank"],
        isOpen: true,
        googleMapsUrl: "https://www.google.com/maps"
      },
      {
        id: "mock_5",
        name: "Narayana Health City Blood Bank",
        address: "258/A, Bommasandra Industrial Area, Bangalore - 560099",
        phone: "+91-80-67888888",
        hours: "24 hours",
        rating: 4.8,
        distance: "12.5 km",
        location: { lat: 12.8064, lng: 77.7527 },
        types: ["blood_bank", "hospital"],
        isOpen: true,
        googleMapsUrl: "https://www.google.com/maps"
      }
    ],
    "Delhi": [
      {
        id: "mock_6",
        name: "AIIMS Blood Bank",
        address: "AIIMS, Ansari Nagar, New Delhi - 110029",
        phone: "+91-11-26594494",
        hours: "24 hours",
        rating: 4.7,
        distance: "3.0 km",
        location: { lat: 28.5665, lng: 77.2102 },
        types: ["blood_bank", "hospital"],
        isOpen: true,
        googleMapsUrl: "https://www.google.com/maps"
      },
      {
        id: "mock_7",
        name: "Indian Red Cross Society - Delhi",
        address: "Red Cross Road, New Delhi - 110001",
        phone: "+91-11-23711551",
        hours: "Mon-Sat: 9:00 AM - 5:00 PM",
        rating: 4.4,
        distance: "2.3 km",
        location: { lat: 28.6139, lng: 77.2090 },
        types: ["blood_bank"],
        isOpen: true,
        googleMapsUrl: "https://www.google.com/maps"
      }
    ],
    "Mumbai": [
      {
        id: "mock_8",
        name: "KEM Hospital Blood Bank",
        address: "Acharya Donde Marg, Parel, Mumbai - 400012",
        phone: "+91-22-24107000",
        hours: "24 hours",
        rating: 4.5,
        distance: "4.2 km",
        location: { lat: 19.0060, lng: 72.8777 },
        types: ["blood_bank", "hospital"],
        isOpen: true,
        googleMapsUrl: "https://www.google.com/maps"
      },
      {
        id: "mock_9",
        name: "Tata Memorial Hospital Blood Bank",
        address: "Dr Ernest Borges Marg, Parel, Mumbai - 400012",
        phone: "+91-22-24177000",
        hours: "24 hours",
        rating: 4.8,
        distance: "4.5 km",
        location: { lat: 19.0076, lng: 72.8774 },
        types: ["blood_bank", "hospital"],
        isOpen: true,
        googleMapsUrl: "https://www.google.com/maps"
      }
    ]
  };

  // Return blood banks for the specified location, or Bangalore as default
  const cityBanks = bloodBanks[location] || bloodBanks["Bangalore"];
  
  return cityBanks;
}