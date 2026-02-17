const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");

// Notification routes
router.get("/", auth, notificationController.getUserNotifications);
router.get("/unread-count", auth, notificationController.getUnreadCount);
router.put("/:id/read", auth, notificationController.markAsRead);
router.put("/mark-all-read", auth, notificationController.markAllAsRead);
router.delete("/:id", auth, notificationController.deleteNotification);
router.delete("/", auth, notificationController.clearAllNotifications);

module.exports = router;
