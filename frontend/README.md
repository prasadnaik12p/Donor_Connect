# Donor Connect - Frontend

## Overview
Donor Connect is a modern, responsive React-based web application that serves as a comprehensive life-saving platform. It connects blood donors, hospitals, ambulance services, and patients in need of medical assistance and funding. The application provides real-time updates, intuitive interfaces, and seamless user experiences.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Real-time Communication**: Socket.IO Client
- **State Management**: React Hooks (useState, useEffect, useContext)

## Core Features

### 1. **User Authentication System**
- **Registration & Login**
  - Multi-role registration (User, Donor, Hospital, Ambulance)
  - Email verification workflow
  - Secure authentication with JWT
  - Password visibility toggle
  - Role-based redirect after login

- **User Interface**
  - Clean, modern login/register forms
  - Light theme with gradient accents
  - Responsive design for all devices
  - Input validation and error handling

### 2. **Dashboard**
- **Home Page Features**
  - Welcome section with platform overview
  - Quick access to all services
  - Feature cards with animations
  - User profile display (when logged in)
  - Activity statistics
  
- **User Profile Section**
  - Personal information display
  - Blood type badge
  - Verification status
  - Role information
  - Donor registration prompt

-

### 3. **Hospital Services**
- **Hospital Search & Discovery**
  - Search by city, state, or location
  - Filter by bed type (General, ICU, Ventilator, Pediatric ICU)
  - Real-time bed availability display
  - Advanced search with pattern matching
  - Active filter display and management

- **Hospital Information**
  - Complete hospital details
  - Contact information (phone, email)
  - Address with map integration
  - Bed availability breakdown
  - Color-coded availability status

- **Interactive Features**
  - Click-to-call functionality
  - Google Maps directions integration
  - Bed availability color indicators
  - Responsive hospital cards
  - Quick contact options

### 4. **Blood Donation Management**
- **Blood Request System**
  - Create blood donation requests
  - Specify blood type and units needed
  - Hospital selection
  - Urgency level marking
  - Patient details collection

- **Request Discovery**
  - View all active blood requests
  - Filter by blood type
  - Filter by urgency level
  - Location-based filtering
  - Real-time status updates

- **Donor Features**
  - Accept blood donation requests
  - View donation history
  - Track accepted requests
  - Receive real-time notifications
  - Donor availability management

- **Statistics Dashboard**
  - Total requests counter
  - Active requests tracking
  - Completed donations count
  - Available donors display

### 5. **Emergency Ambulance Services**
- **Emergency Request Creation**
  - Quick emergency request form
  - Patient information capture
  - Emergency type selection
  - Location detection
  - Contact details collection

- **Ambulance Search**
  - Auto-detect current location
  - Manual location entry
  - Coordinate-based search
  - Nearby ambulance display
  - Distance calculation

- **Real-time Tracking**
  - WebSocket-based updates
  - Emergency status tracking
  - Ambulance assignment notifications
  - Driver information display
  - Estimated arrival time

- **Search Options**
  - Automatic location detection
  - City-based search
  - Manual coordinate entry
  - Radius-based filtering

### 6. **Medical Fund Requests**
- **Fund Request Creation**
  - Patient information form
  - Medical purpose description
  - Target amount setting
  - Urgency level marking
  - Document upload (future)

- **Fund Discovery**
  - Browse all fund requests
  - Filter by status
  - Filter by urgency
  - View funding progress
  - Donor information

- **Donation Features**
  - Donate to specific requests
  - View donation history
  - Track campaign progress
  - Completion notifications

- **Campaign Management**
  - Progress bar visualization
  - Goal tracking
  - Donor count display
  - Time tracking
  - Status badges

### 7. **Donor Registration**
- **Dedicated Donor Portal**
  - Separate donor registration
  - Blood type selection
  - Availability status
  - Contact preferences
  - Medical history (optional)

- **Donor Dashboard**
  - Active donation requests
  - Donation history
  - Availability toggle
  - Statistics display

### 8. **Notification System**
- **Notification Bell**
  - Real-time notification count
  - Unread indicator badge
  - Click-to-view notifications
  - Animated alerts

- **Notification Inbox**
  - Chronological notification list
  - Read/unread status
  - Notification types (info, success, warning, error)
  - Mark as read functionality
  - Delete notifications
  - Empty state display

- **Notification Types**
  - Blood request alerts
  - Emergency notifications
  - Fund request updates
  - System announcements
  - Status change alerts

### 9. **Admin Dashboard**
- **User Management**
  - View all registered users
  - User verification
  - Role management
  - Account status control

- **Hospital Management**
  - Hospital approval workflow
  - Verification process
  - Bed availability monitoring

- **Fund Request Moderation**
  - Review campaigns
  - Approve/reject requests
  - Monitor progress
  - Fraud prevention

- **Analytics & Reports**
  - Platform statistics
  - User engagement metrics
  - Service usage reports
  - Growth tracking

### 10. **Hospital Dashboard**
- **Bed Management**
  - Update bed availability
  - Real-time bed status
  - Bed type management
  - Occupancy tracking

- **Hospital Profile**
  - Update contact information
  - Location management
  - Service details

### 11. **Ambulance Dashboard**
- **Emergency Management**
  - View incoming emergencies
  - Accept emergency requests
  - Update location in real-time
  - Status management

- **Ambulance Profile**
  - Driver information
  - Vehicle details
  - Availability status
  - Service area

## UI/UX Features

### Design System
- **Color Scheme**
  - Dark backgrounds with gradients
  - White cards for content
  - Colorful accent gradients (red, pink, purple, blue, cyan)
  - Status color coding (green, yellow, red)

- **Typography**
  - Clear hierarchy
  - Responsive font sizes
  - Gradient text effects
  - Emoji integration for visual appeal

- **Components**
  - Rounded corners (xl, 2xl, 3xl)
  - Shadow effects (lg, xl, 2xl)
  - Hover animations
  - Transform transitions
  - Loading states

### Responsive Design
- **Mobile First Approach**
  - sm: 640px (mobile)
  - md: 768px (tablet)
  - lg: 1024px (laptop)
  - xl: 1280px (desktop)

- **Adaptive Layouts**
  - Flexible grid systems
  - Collapsible navigation
  - Touch-friendly buttons
  - Optimized spacing

### Animations & Interactions
- **Hover Effects**
  - Card lift on hover
  - Color transitions
  - Shadow expansion
  - Scale transforms

- **Loading States**
  - Spinner animations
  - Skeleton screens
  - Progress indicators
  - Pulse effects

- **Transitions**
  - Smooth page transitions
  - Fade in/out effects
  - Slide animations
  - Duration controls

## Real-time Features (WebSocket)

### Socket Integration
- **Connection Management**
  - Auto-connect on login
  - User registration on socket
  - Reconnection handling
  - Disconnect cleanup

### Real-time Events
- **Blood Donation**
  - New request notifications
  - Request acceptance alerts
  - Status updates
  - Donor matching

- **Emergency Services**
  - Emergency broadcasts
  - Ambulance assignment
  - Location tracking
  - Status changes

- **Notifications**
  - Instant notification delivery
  - Badge count updates
  - Sound alerts (optional)
  - Visual indicators

## Navigation Structure

### Public Routes
- `/` - Home/Dashboard
- `/login` - User Login
- `/register` - User Registration
- `/verify-email` - Email Verification

### Protected Routes (Require Authentication)
- `/hospitals` - Hospital Services
- `/blood-donation` - Blood Donation
- `/ambulance` - Ambulance Services
- `/fund-requests` - Medical Fund Requests
- `/become-donor` - Donor Registration

### Special Routes
- `/hospital-login` - Hospital Login
- `/hospital-dashboard` - Hospital Dashboard
- `/ambulance-login` - Ambulance Login
- `/ambulance-dashboard` - Ambulance Dashboard
- `/admin-login` - Admin Login
- `/admin-dashboard` - Admin Dashboard

## State Management

### User State
- Authentication status
- User information
- Token management
- Session validation

### Application State
- Loading states
- Error handling
- Form data
- Search filters
- Notification count

### WebSocket State
- Connection status
- Real-time data updates
- Event listeners
- Cleanup on unmount

## API Integration

### Axios Configuration
- Base URL setup
- Default headers
- Token interceptors
- Error handling
- Response formatting

### API Endpoints Used
- Authentication APIs
- Hospital APIs
- Blood donation APIs
- Ambulance APIs
- Fund request APIs
- Notification APIs
- Admin APIs

## Environment Configuration

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend server running

### Installation Steps

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create `.env` file in frontend root
   - Add API and Socket URLs

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Preview production build**
   ```bash
   npm run preview
   ```

### Development Server
The app will run on: `http://localhost:5173`

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, icons
│   ├── components/     # React components
│   │   ├── Dashboard.jsx
│   │   ├── Hospital.jsx
│   │   ├── BloodDonation.jsx
│   │   ├── Ambulance.jsx
│   │   ├── FundRequest.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── ...
│   ├── utils/          # Utility functions
│   │   └── socketService.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── .env                # Environment variables
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
└── package.json        # Dependencies
```

## Key Components

### App.jsx
- Main application wrapper
- Route configuration
- User state management
- Socket initialization

### Navbar.jsx
- Navigation menu
- User authentication status
- Notification bell
- Responsive mobile menu

### Footer.jsx
- Site information
- Quick links
- Contact details
- Social media links

### Dashboard.jsx
- Home page
- Feature showcase
- User profile
- Statistics display

### Hospital.jsx
- Hospital search
- Bed availability
- Filter system
- Contact features

### BloodDonation.jsx
- Request creation
- Request listing
- Donor matching
- Status tracking

### Ambulance.jsx
- Emergency creation
- Ambulance search
- Real-time tracking
- Location services

### FundRequest.jsx
- Campaign creation
- Fund listing
- Donation processing
- Progress tracking

## Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Performance Optimizations
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies

## Accessibility Features
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## Future Enhancements
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Offline mode
- [ ] Progressive Web App (PWA)
- [ ] Advanced filters
- [ ] Map view integration
- [ ] Chat support
- [ ] Video calls for consultation
- [ ] Mobile app version

## Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment
The application can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting
- GitHub Pages

## Support
For issues and feature requests:
- Create an issue in the repository
- Contact the development team

## License
This project is part of Donor Connect platform - All rights reserved.
