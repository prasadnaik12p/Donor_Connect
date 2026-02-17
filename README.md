# 🩸 Donor Connect

<div align="center">

### A Comprehensive Life-Saving Platform

*Connecting donors, hospitals, ambulances, and patients for emergency medical services*

[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-brightgreen.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-black.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Support](#support)

---

## 🌟 Overview

**Donor Connect** is a full-stack web application designed to save lives by connecting multiple stakeholders in the healthcare ecosystem. The platform provides seamless integration between blood donors, hospitals, emergency ambulance services, and patients requiring medical assistance or funding.

### Mission Statement

> To create a unified platform that reduces response time in medical emergencies, connects blood donors with patients in need, and facilitates medical funding for underprivileged individuals.

### Problem Statement

In emergency medical situations, time is critical. Traditional methods of finding blood donors, locating available hospital beds, or arranging emergency ambulances often involve multiple phone calls and delays that can cost lives. Donor Connect solves this by providing:

- **Real-time Information**: Live updates on hospital bed availability, ambulance locations, and blood donor status
- **Instant Matching**: Automated matching between blood requests and compatible donors
- **Emergency Response**: Quick ambulance dispatch and tracking system
- **Medical Funding**: Platform for patients to request and receive financial assistance

---

## 🚀 Key Features

### 🩸 Blood Donation Management
- **Smart Request System**: Create urgent blood requests with specific requirements
- **Automatic Donor Matching**: AI-powered matching based on blood type and location
- **Real-time Notifications**: Instant alerts to compatible donors
- **Request Tracking**: Monitor request status from creation to completion
- **Donor Dashboard**: Manage availability and view donation history

### 🏥 Hospital Services
- **Live Bed Availability**: Real-time tracking of general, ICU, ventilator, and pediatric ICU beds
- **Smart Search**: Advanced location-based hospital search with filters
- **Bed Reservation**: Quick bed reservation system (30-minute hold)
- **Hospital Dashboard**: Manage bed inventory and update availability
- **Direct Contact**: One-click call and navigate to hospital

### 🚑 Emergency Ambulance Services
- **Geospatial Search**: Find nearest available ambulances using GPS
- **Real-time Tracking**: Live ambulance location tracking via WebSocket
- **Emergency Dispatch**: Automated ambulance assignment system
- **Multiple Search Options**: Auto-detect location, manual entry, or coordinates
- **Status Updates**: Real-time emergency status tracking

### 💰 Medical Fund Requests
- **Campaign Creation**: Create fundraising campaigns for medical expenses
- **Progress Tracking**: Visual progress bars and goal tracking
- **Donor Management**: Track contributions and donor information
- **Admin Moderation**: Verification and approval workflow
- **Transparency**: Detailed expense breakdown and status updates

### 🔔 Real-time Notifications
- **WebSocket Integration**: Instant notifications without page refresh
- **Multiple Channels**: Blood requests, emergencies, fund updates, system alerts
- **Notification Center**: Centralized inbox with read/unread status
- **Badge Indicators**: Unread count display throughout the app

### 👥 Multi-role System
- **Users**: Request blood, reserve beds, create emergencies, donate funds
- **Donors**: Receive and accept blood donation requests
- **Hospitals**: Manage bed availability, view reservations
- **Ambulances**: Accept emergencies, update locations
- **Admins**: Moderate fund requests, verify hospitals, manage users

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Hooks
- **Build Tool**: Vite (Fast HMR and optimized builds)
- **Styling**: Tailwind CSS (Utility-first CSS framework)
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **State Management**: React Context API + Hooks

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Email**: Nodemailer (SMTP)
- **Validation**: Express Validator
- **Security**: Bcrypt, Helmet, CORS

### DevOps & Tools
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **API Testing**: Postman/Thunder Client
- **Environment**: dotenv
- **Linting**: ESLint
- **Code Formatting**: Prettier (recommended)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   React     │  │  Socket.IO   │  │   Axios      │       │
│  │  Components │  │   Client     │  │  HTTP Client │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
│         │                 │                   │              │
└─────────┼─────────────────┼───────────────────┼──────────────┘
          │                 │                   │
          │                 │                   │
┌─────────┼─────────────────┼───────────────────┼──────────────┐
│         │                 │                   │              │
│  ┌──────▼──────┐   ┌──────▼──────┐   ┌───────▼────────┐    │
│  │   Express   │   │  Socket.IO  │   │  REST API      │    │
│  │   Server    │◄──┤   Server    │◄──┤  Endpoints     │    │
│  └──────┬──────┘   └─────────────┘   └────────────────┘    │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────┐           │
│  │           Middleware Layer                   │           │
│  │  • Authentication (JWT)                      │           │
│  │  • Authorization (Role-based)                │           │
│  │  • Validation & Error Handling               │           │
│  └──────┬──────────────────────────────────────┘           │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────┐           │
│  │           Business Logic Layer               │           │
│  │  • Controllers                               │           │
│  │  • Services                                  │           │
│  │  • Utilities                                 │           │
│  └──────┬──────────────────────────────────────┘           │
│         │                          SERVER SIDE              │
└─────────┼───────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│  ┌──────────────────────────────────────────────┐           │
│  │              MongoDB Atlas                    │           │
│  │  • Users Collection                           │           │
│  │  • Hospitals Collection                       │           │
│  │  • Blood Requests Collection                  │           │
│  │  • Emergencies Collection                     │           │
│  │  • Fund Requests Collection                   │           │
│  │  • Notifications Collection                   │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Donor_Connect/
│
├── backend/                      # Backend Node.js/Express application
│   ├── config/                   # Configuration files
│   │   ├── db.js                 # MongoDB connection
│   │   └── sendEmail.js          # Email configuration
│   │
│   ├── controllers/              # Route controllers (business logic)
│   │   ├── authController.js     # Authentication logic
│   │   ├── hospitalController.js # Hospital management
│   │   ├── bloodDonationController.js
│   │   ├── ambulanceController.js
│   │   ├── fundRequestController.js
│   │   └── ...
│   │
│   ├── middleware/               # Express middleware
│   │   ├── auth.js               # JWT authentication
│   │   ├── authHospital.js       # Hospital authentication
│   │   └── authAmbulance.js      # Ambulance authentication
│   │
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js
│   │   ├── Hospital.js
│   │   ├── BloodRequest.js
│   │   ├── Emergency.js
│   │   ├── FundRequest.js
│   │   └── ...
│   │
│   ├── routes/                   # API routes
│   │   ├── auth.js
│   │   ├── hospitalRoutes.js
│   │   ├── bloodDonations.js
│   │   ├── ambulanceRoutes.js
│   │   └── ...
│   │
│   ├── utils/                    # Utility functions
│   │   ├── tokenGenerator.js
│   │   └── sendEmail.js
│   │
│   ├── .env                      # Environment variables
│   ├── server.js                 # Entry point
│   ├── package.json
│   └── README.md                 # Backend documentation
│
├── frontend/                     # Frontend React application
│   ├── public/                   # Static assets
│   │
│   ├── src/
│   │   ├── assets/               # Images, icons
│   │   │
│   │   ├── components/           # React components
│   │   │   ├── Dashboard.jsx     # Home page
│   │   │   ├── Hospital.jsx      # Hospital services
│   │   │   ├── BloodDonation.jsx # Blood donation
│   │   │   ├── Ambulance.jsx     # Emergency services
│   │   │   ├── FundRequest.jsx   # Medical funding
│   │   │   ├── Login.jsx         # Authentication
│   │   │   ├── Register.jsx
│   │   │   ├── Navbar.jsx        # Navigation
│   │   │   ├── Footer.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   └── ...
│   │   │
│   │   ├── utils/                # Utility functions
│   │   │   └── socketService.js  # WebSocket management
│   │   │
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Global styles
│   │
│   ├── .env                      # Environment variables
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind configuration
│   ├── package.json
│   └── README.md                 # Frontend documentation
│
└── README.md                     # This file (Project overview)
```

---

## ⚙️ Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/donor-connect.git
   cd Donor_Connect
   ```

2. **Backend Setup**
   ```bash
   # Navigate to backend directory
   cd backend

   # Install dependencies
   npm install

   # Create .env file
   cp .env.example .env

   # Edit .env with your configuration
   nano .env

   # Start the server
   npm run dev        # Development mode with nodemon
   # OR
   npm start          # Production mode
   ```

3. **Frontend Setup**
   ```bash
   # Open new terminal and navigate to frontend
   cd frontend

   # Install dependencies
   npm install

   # Create .env file
   cp .env.example .env

   # Edit .env with your configuration
   nano .env

   # Start the development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - MongoDB: mongodb://localhost:27017 (if using local MongoDB)

---

## 🔧 Configuration

### Backend Environment Variables (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/donor_connect
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/donor_connect

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=30d

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Client URL (Frontend)
CLIENT_URL=http://localhost:5173

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables (.env)

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000

# WebSocket URL
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📖 Usage

### For Users

1. **Registration**
   - Visit the registration page
   - Choose your role (User, Donor, Hospital, Ambulance)
   - Fill in required details
   - Verify your email

2. **Blood Donation**
   - Navigate to Blood Donation section
   - Create a new request or browse existing ones
   - Donors can accept requests
   - Track request status in real-time

3. **Hospital Services**
   - Search for hospitals by location
   - Filter by bed type
   - View real-time bed availability
   - Contact hospitals directly

4. **Emergency Services**
   - Create an emergency request
   - System finds nearest ambulances
   - Track ambulance in real-time
   - Receive status updates

5. **Medical Funding**
   - Create fundraising campaign
   - Browse and donate to campaigns
   - Track progress and donors

### For Hospitals

1. **Register as Hospital**
2. **Update Bed Availability**
3. **Manage Reservations**
4. **View Analytics**

### For Ambulance Services

1. **Register as Ambulance Service**
2. **Accept Emergency Requests**
3. **Update Real-time Location**
4. **Manage Emergency Status**

### For Admins

1. **User Management**
2. **Hospital Verification**
3. **Fund Request Moderation**
4. **System Analytics**

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/verify/:token` - Email verification

#### Hospitals
- `GET /hospitals/beds` - Get all hospitals with availability
- `POST /hospitals/reserve-bed` - Reserve a bed
- `GET /hospitals/search?city=<city>` - Search hospitals

#### Blood Donation
- `POST /blood-donation/create-request` - Create blood request
- `GET /blood-donation/requests` - Get all requests
- `POST /blood-donation/accept-request` - Accept request

#### Emergency/Ambulance
- `POST /emergency/create` - Create emergency
- `GET /ambulance/nearby?lat=<lat>&lng=<lng>` - Find nearby ambulances

#### Fund Requests
- `POST /fund-requests/create` - Create fund request
- `GET /fund-requests/all` - Get all fund requests
- `POST /fund-requests/donate` - Make donation

For complete API documentation, see [backend/README.md](backend/README.md)

---

## 🖼️ Screenshots

<details>
<summary>Click to view screenshots</summary>

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Hospital Services
![Hospital Services](./screenshots/hospitals.png)

### Blood Donation
![Blood Donation](./screenshots/blood-donation.png)

### Emergency Services
![Emergency](./screenshots/ambulance.png)

### Fund Requests
![Fund Requests](./screenshots/fund-requests.png)

</details>

---

## 🤝 Contributing

We welcome contributions to Donor Connect! Here's how you can help:

### Development Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
6. **Open a Pull Request**

### Code Style Guidelines

- Follow ESLint configuration
- Use meaningful variable names
- Write comments for complex logic
- Keep functions small and focused
- Use async/await over callbacks

### Commit Message Convention

```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(blood-donation): add urgent request notification

- Add real-time notification for urgent blood requests
- Update notification badge count
- Add sound alert for critical requests
```

---

## 🔒 Security

### Security Measures Implemented

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Email Verification**: Verified email addresses
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Mongoose ODM protection
- **XSS Prevention**: Input sanitization
- **CORS Configuration**: Controlled cross-origin requests
- **Rate Limiting**: API rate limiting (to be implemented)
- **HTTPS**: SSL/TLS encryption (production)

### Reporting Security Issues

If you discover a security vulnerability, please email security@donorconnect.com instead of using the issue tracker.

---

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints
- **E2E Tests**: User workflows (coming soon)

---

## 🚀 Deployment

### Production Deployment

#### Backend Deployment (Heroku/Railway/Render)

```bash
# Build production bundle
npm run build

# Set environment variables
# Deploy to your hosting service
```

#### Frontend Deployment (Vercel/Netlify)

```bash
# Build for production
npm run build

# Deploy dist folder
```

### Environment Variables

Ensure all environment variables are configured in your hosting platform.

---

## 📊 Roadmap

### Current Features (v1.0)
- ✅ User authentication and authorization
- ✅ Hospital bed management
- ✅ Blood donation requests
- ✅ Emergency ambulance services
- ✅ Medical fund requests
- ✅ Real-time notifications
- ✅ Admin dashboard

### Upcoming Features (v2.0)
- 🔄 Payment gateway integration
- 🔄 SMS notifications
- 🔄 Mobile app (React Native)
- 🔄 Advanced analytics dashboard
- 🔄 Multi-language support
- 🔄 Video consultation
- 🔄 Insurance integration
- 🔄 Telemedicine features

### Future Enhancements (v3.0)
- 📅 AI-powered donor matching
- 📅 Predictive analytics for blood demand
- 📅 Blockchain for donation transparency
- 📅 IoT integration for ambulance tracking
- 📅 AR/VR hospital tours



---

## 🙏 Acknowledgments

- Thanks to all contributors who helped build this platform
- MongoDB Atlas for database hosting
- Open source community for amazing tools and libraries
- All the blood donors and medical professionals who inspired this project

---

## 📈 Statistics

![GitHub stars](https://img.shields.io/github/stars/yourusername/donor-connect?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/donor-connect?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/donor-connect)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/donor-connect)

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

**Made with ❤️ by the Donor Connect Team**

*Saving lives, one connection at a time.*

</div>
