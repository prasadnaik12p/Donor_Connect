# Donor Connect - Backend

## Overview
The Donor Connect backend is a comprehensive Node.js/Express API that powers a life-saving platform connecting donors, hospitals, ambulances, and patients. It provides real-time services for blood donation, hospital bed management, emergency ambulance dispatch, and medical fund requests.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer
- **API Architecture**: RESTful API

## Core Features

### 1. **Authentication System**
- **User Registration & Login**
  - Multi-role authentication (User, Donor, Hospital, Ambulance, Admin)
  - Email verification system
  - Secure password hashing
  - JWT-based session management
  
- **Role-Based Access Control**
  - User authentication middleware
  - Hospital-specific authentication
  - Ambulance service authentication
  - Admin authentication

### 2. **Hospital Management**
- **Hospital Registration & Profile**
  - Hospital account creation
  - Profile management with location details
  - Contact information management
  
- **Bed Availability System**
  - Bed tracking (General, ICU, Ventilator, Pediatric ICU)
  - Automatic bed status updates
  - Location-based hospital search
  - Bed type filtering

### 3. **Blood Donation Management**
- **Blood Request System**
  - Create urgent blood donation requests
  - Specify blood type, units, and hospital
  - Mark requests as urgent/critical
  
- **Donor Matching**
  - Automatic donor notification based on blood type
  - Location-based donor filtering
  - Donor availability tracking
  
- **Request Management**
  - Accept/reject donation requests
  - Track request status (Pending, Accepted, Completed)
  - Request history and statistics

### 4. **Emergency Ambulance Services**
- **Emergency Request Creation**
  - Real-time emergency creation with location
  - Patient details and emergency type
  - Contact information capture
  
- **Ambulance Dispatch**
  - Nearby ambulance search using geospatial queries
  - Availability-based filtering
  - Real-time ambulance tracking
  
- **Emergency Management**
  - Emergency acceptance by ambulance services
  - Status tracking (Pending, Assigned, Completed)
  - Real-time location updates via WebSocket

### 5. **Medical Fund Requests**
- **Fund Request Creation**
  - Create medical fund campaigns
  - Patient details and medical purpose
  - Target amount and urgency levels
  - Document upload support
  
- **Donation Management**
  - Accept donations for specific requests
  - Track donation amounts 
  - Progress tracking toward goal
  
- **Request Status**
  - Admin approval workflow
  - Status tracking (Pending, Approved, Rejected, Completed)
  - Automatic completion when goal reached

### 6. **Donor Management**
- **Donor Registration**
  - Dedicated donor profile creation
  - Blood type specification
  - Availability status management
  
- **Donor Search & Discovery**
  - Search donors by blood type
  - Location-based donor filtering
  - Availability checking

### 7. **Admin Dashboard**
- **User Management**
  - View all users
  - User verification and approval
  - Role management
  
- **Hospital Management**
  - Hospital approval workflow
  - Hospital verification
  - Monitoring hospital status
  
- **Fund Request Moderation**
  - Review fund requests
  - Approve/reject campaigns
  - Monitor fundraising progress
  
- **System Statistics**
  - Overall platform metrics
  - User engagement analytics
  - Request fulfillment rates

### 8. **Notification System**
- **Real-time Notifications**
  - Blood request alerts
  - Emergency notifications
  - Fund request updates
  - System announcements
  
- **Notification Management**
  - Mark as read/unread
  - Notification history
  - User-specific notifications

### 9. **WebSocket Real-time Features**
- **Blood Donation Updates**
  - New blood request broadcasts
  - Request status changes
  - Donor acceptance notifications
  
- **Emergency Alerts**
  - Real-time emergency broadcasts
  - Ambulance assignment updates
  - Location tracking updates
  
- **General Updates**
  - System-wide announcements
  - User-specific real-time alerts

## API Endpoints Structure

### Authentication Routes (`/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /verify-email` - Email verification
- `GET /verify/:token` - Email verification link

### Hospital Routes (`/hospitals`)
- `GET /beds` - Get all hospitals with bed availability
- `POST /reserve-bed` - Reserve a hospital bed
- `GET /search` - Search hospitals by location
- `POST /register` - Hospital registration
- `POST /login` - Hospital login
- `PUT /update-beds` - Update bed availability

### Blood Donation Routes (`/blood-donation`)
- `POST /create-request` - Create blood request
- `GET /requests` - Get all blood requests
- `POST /accept-request` - Accept donation request
- `GET /my-requests` - Get user's requests
- `GET /stats` - Get blood donation statistics

### Ambulance Routes (`/ambulance`)
- `GET /nearby` - Find nearby ambulances
- `POST /register` - Ambulance service registration
- `POST /login` - Ambulance login
- `PUT /update-location` - Update ambulance location
- `GET /availability` - Check ambulance availability

### Emergency Routes (`/emergency`)
- `POST /create` - Create emergency request
- `GET /active` - Get active emergencies
- `POST /accept` - Accept emergency
- `PUT /update-status` - Update emergency status

### Fund Request Routes (`/fund-requests`)
- `POST /create` - Create fund request
- `GET /all` - Get all fund requests
- `POST /donate` - Make a donation
- `GET /stats` - Get fundraising statistics
- `PUT /update-status` - Update request status (Admin)

### Donor Routes (`/donors`)
- `POST /register` - Register as donor
- `GET /search` - Search donors by blood type
- `PUT /update-availability` - Update donor availability

### Notification Routes (`/notifications`)
- `GET /` - Get user notifications
- `PUT /:id/read` - Mark notification as read
- `DELETE /:id` - Delete notification

### Admin Routes (`/admin`)
- `POST /login` - Admin login
- `GET /users` - Get all users
- `PUT /verify-hospital/:id` - Verify hospital
- `PUT /approve-fund-request/:id` - Approve fund request
- `GET /statistics` - Get system statistics

## Database Models

### User Model
- Personal information (name, email, phone)
- Authentication credentials
- Role and verification status
- Blood type (for donors)

### Hospital Model
- Hospital details and location
- Contact information
- Verification status
- Bed availability reference

### HospitalBed Model
- Bed types (General, ICU, Ventilator, Pediatric ICU)
- Available and total bed counts
- Real-time availability tracking

### BloodRequest Model
- Patient and blood type information
- Hospital and location details
- Request status and urgency
- Donor matching and acceptance

### Ambulance Model
- Ambulance service details
- Driver information
- Location coordinates
- Availability status

### Emergency Model
- Emergency details and type
- Patient information
- Location coordinates
- Ambulance assignment
- Status tracking

### FundRequest Model
- Patient and medical information
- Funding goal and progress
- Document attachments
- Donation tracking
- Admin approval status

### Donor Model
- Donor personal information
- Blood type and availability
- Donation history

### Notification Model
- Notification type and content
- Recipient information
- Read status
- Timestamp

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Email Verification**: Verified email addresses
- **Role-Based Access**: Protected routes based on user roles
- **Input Validation**: Request validation and sanitization
- **CORS Configuration**: Controlled cross-origin requests

## Real-time Features (Socket.IO)

### Events Emitted
- `new-blood-request` - New blood donation request created
- `blood-request-accepted` - Blood request accepted by donor
- `emergency-created` - New emergency request
- `emergency-accepted` - Emergency accepted by ambulance
- `ambulance-location-update` - Real-time ambulance tracking
- `notification` - General notifications

### Events Listened
- `register-user` - User WebSocket registration
- `ambulance-location` - Ambulance location updates

## Environment Variables

```env
PORT=5000
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
EMAIL_USER=<smtp_email>
EMAIL_PASS=<smtp_password>
CLIENT_URL=<frontend_url>
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create `.env` file in the backend root
   - Add required environment variables

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

5. **Server will run on**
   ```
   http://localhost:5000
   ```

## API Testing

Use tools like Postman or Thunder Client:
- Base URL: `http://localhost:5000`
- Include JWT token in Authorization header for protected routes
- Format: `Bearer <your_jwt_token>`

## WebSocket Connection

Connect to WebSocket server:
```javascript
import io from 'socket.io-client';
const socket = io('http://localhost:5000');

// Register user
socket.emit('register-user', userId);

// Listen for events
socket.on('new-blood-request', (data) => {
  console.log('New blood request:', data);
});
```

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

## Future Enhancements

- [ ] Payment gateway integration for fund donations
- [ ] SMS notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app API optimization
- [ ] Rate limiting and API throttling
- [ ] Caching layer (Redis)
- [ ] Automated testing suite

## Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

## License

This project is part of Donor Connect platform - All rights reserved.
