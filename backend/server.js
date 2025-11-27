const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/auth");
const bloodDonationRoutes = require("./routes/bloodDonations");
const donorRoutes = require("./routes/donorRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const ambulanceRoutes = require("./routes/ambulanceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const fundRoutes = require("./routes/fundRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");

// Controllers
const socketController = require("./controllers/socketController");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB(process.env.MONGODB_URI);

const app = express();
const server = http.createServer(app);

// CORS Middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Middleware
app.use(express.json());

// Handle malformed JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("Malformed JSON in request:", err.message);
    return res.status(400).json({ message: "Invalid JSON payload" });
  }
  next();
});

// WebSocket Setup
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);
socketController(io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blood-donation", bloodDonationRoutes);
app.use("/api/donors", donorRoutes);
// app.use("/api/notifications", notificationRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/ambulances", ambulanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/funds", fundRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/emergencies", emergencyRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Donor Connect API",
    timestamp: new Date().toISOString(),
    status: "running",
  });
});

// 404 Handler - FIXED: Use proper wildcard route
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(
    `🔗 MongoDB: ${process.env.MONGODB_URI ? "Connected" : "Not configured"}`
  );
});