# 🎯 EventHub Pro - Complete Project Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Admin Credentials](#admin-credentials)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Technology Stack](#technology-stack)
6. [API Endpoints](#api-endpoints)
7. [Recent Updates](#recent-updates)

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Docker Desktop

### Start the Application

**Step 1: Start Database**
```bash
start-database.bat
```

**Step 2: Start Backend**
```bash
cd backend
mvnw.cmd spring-boot:run
```

**Step 3: Start Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Step 4: Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

---

## 🔒 Admin Credentials

**Email:** admin@eventhub.com  
**Password:** Admin@EventHub2026

**Setup Secret Key:** EVENTHUB_ADMIN_SECRET_KEY_2026

**First Time Setup:**
1. Visit: http://localhost:3000/setup-admin
2. Enter secret key
3. Click "Create Admin Account"
4. Login with credentials above

---

## ✨ Features

### For Users:
- ✅ Register and login with JWT authentication
- ✅ Forgot password with email reset link
- ✅ Browse events with search and category filter
- ✅ View event details (date, location, price, capacity)
- ✅ Register for events with payment proof upload
- ✅ Upload payment screenshot (Telebirr: 0921348555 or CBE: 1000307857026)
- ✅ Track registration status (Pending/Approved/Rejected)
- ✅ View tickets with QR code after approval
- ✅ See registration order number (gamification)
- ✅ Print tickets
- ✅ Cancel registrations (only pending, >24 hours before event)

### For Admin:
- ✅ Admin dashboard with statistics
- ✅ Create events with image upload
- ✅ Manage events (view, delete)
- ✅ Review pending registrations
- ✅ View payment screenshots
- ✅ Approve/reject registrations
- ✅ Auto-generate unique ticket codes (TKT-XXXXXXXX)
- ✅ View event attendees list
- ✅ Export attendees to CSV
- ✅ View all users

### System Features:
- ✅ Event capacity auto-lock when full
- ✅ QR code generation for tickets
- ✅ Registration order tracking
- ✅ Payment verification workflow
- ✅ Image upload (file or URL)
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Role-based access control

---

## 📁 Project Structure

```
EventHub Pro/
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/eventhub/
│   │   ├── config/            # Security, CORS
│   │   ├── controller/        # REST endpoints
│   │   ├── dto/               # Data transfer objects
│   │   ├── entity/            # Database models
│   │   ├── repository/        # JPA repositories
│   │   ├── security/          # JWT utilities
│   │   └── service/           # Business logic
│   └── src/main/resources/
│       └── application.properties
│
├── frontend/                   # Next.js App
│   ├── app/                   # Pages (App Router)
│   │   ├── admin/            # Admin pages
│   │   ├── events/           # Event pages
│   │   ├── login/            # Login page
│   │   ├── register/         # Register page
│   │   ├── dashboard/        # User dashboard
│   │   └── my-tickets/       # Tickets page
│   ├── components/           # Reusable components
│   ├── services/             # API calls
│   └── utils/                # Utilities
│
├── docker-compose.yml         # MySQL container
├── start-database.bat        # Start database
└── PROJECT_GUIDE.md          # This file
```

---

## 🛠️ Technology Stack

### Backend:
- Spring Boot 3.2
- Spring Security + JWT
- Spring Data JPA
- MySQL 8.0
- Lombok
- Maven

### Frontend:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Axios
- QRCode library
- React Toastify

### Database:
- MySQL 8.0 (Docker)

---

## 🔌 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/setup` - Create admin account (one-time)

### Password Reset
- POST `/api/password-reset/request` - Request password reset email
- POST `/api/password-reset/reset` - Reset password with token
- GET `/api/password-reset/validate/{token}` - Validate reset token

### Events
- GET `/api/events` - Get all events
- GET `/api/events/{id}` - Get event by ID
- POST `/api/events` - Create event (Admin only)
- PUT `/api/events/{id}` - Update event (Admin only)
- DELETE `/api/events/{id}` - Delete event (Admin only)

### Registrations
- POST `/api/registrations` - Register for event
- GET `/api/registrations/my-events` - Get user's registrations
- GET `/api/registrations/pending` - Get pending registrations (Admin)
- GET `/api/registrations/event/{id}/attendees` - Get event attendees (Admin)
- POST `/api/registrations/{id}/approve` - Approve registration (Admin)
- POST `/api/registrations/{id}/reject` - Reject registration (Admin)
- DELETE `/api/registrations/{id}` - Cancel registration

### Users
- GET `/api/users` - Get all users (Admin)
- GET `/api/users/stats` - Get statistics (Admin)

---

## 🆕 Recent Updates

### Version 2.2 (Latest) - Dark Mode & Password Reset

**Added:**
- Dark mode toggle in navbar (🌙/☀️)
- Dark mode support for Admin Dashboard and Events pages
- Admin-assisted password reset system
- User self-service password setting after admin approval

**How Dark Mode Works:**
- Click moon/sun icon in navbar to toggle
- Preference saved in localStorage
- Smooth color transitions
- More pages being updated

### Version 2.1 - Password Reset Feature

**Added:**
- Forgot password functionality (users only)
- Email-based password reset with secure tokens
- Reset link expires after 1 hour
- One-time use tokens
- Admin accounts protected from password reset
- "Forgot password?" link on login page

**New Pages:**
- `/forgot-password` - Request reset link
- `/reset-password?token=xxx` - Reset password with token

**Setup Required:**
- Configure email in `application.properties`
- See `EMAIL_SETUP_GUIDE.md` for instructions

### Version 2.0

**Added:**
- QR code generation for approved tickets
- Registration order tracking (attendee #1, #2, etc.)
- Cancellation time restriction (24 hours before event)
- Event capacity auto-lock
- Improved ticket display
- Better error handling

**Fixed:**
- Registration order calculation with null approvedAt
- Ticket display showing "?" instead of order number
- Removed unnecessary text from ticket

**Files Modified:**
- `frontend/package.json` - Added qrcode library
- `frontend/app/my-tickets/page.tsx` - QR code display
- `frontend/app/dashboard/page.tsx` - Cancellation logic
- `backend/src/main/java/com/eventhub/service/RegistrationService.java` - Order calculation fix

---

## 📝 Payment Accounts

**Telebirr:** 0921348555  
**CBE Bank:** 1000307857026

Users transfer payment to these accounts and upload screenshot during registration.

---

## 🎨 UI Features

- Modern gradient backgrounds
- Responsive design (mobile-friendly)
- Horizontal event cards on large screens
- Toast notifications (no browser alerts)
- Loading states
- Error handling
- Image preview
- Modal popups
- Print-friendly tickets

---

## 🔐 Security

- JWT token authentication
- BCrypt password hashing
- Role-based access (ADMIN/USER)
- Protected routes
- CORS configuration
- Secure admin setup

---

## 📊 Database Schema

### Users Table
- id, name, email, password, role

### Events Table
- id, title, description, location, date, endDate
- maxAttendees, currentAttendees, price, category
- imageUrl, status, isFeatured, createdBy

### Registrations Table
- id, userId, eventId, registeredAt
- status, paymentProof, paymentMethod
- ticketCode, approvedAt, approvedBy

---

## 🐛 Troubleshooting

**Backend won't start:**
- Check if MySQL is running: `docker ps`
- Check port 8080 is free

**Frontend won't start:**
- Run `npm install` in frontend folder
- Check port 3000 is free

**Can't login as admin:**
- Make sure you created admin account at `/setup-admin`
- Use exact credentials: admin@eventhub.com / Admin@EventHub2026

**QR code not showing:**
- Run `npm install` in frontend folder
- Restart frontend server

---

## 📞 Support

For issues or questions, check:
1. This guide
2. Code comments in files
3. Console logs in browser/terminal

---

**Last Updated:** February 16, 2026  
**Version:** 2.0  
**Status:** Production Ready
