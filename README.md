# FleetRent

FleetRent is a full-stack fleet management platform built to help businesses manage vehicles, drivers, assignments, shifts, notifications, and daily rent/payment records from one workspace.

## Live Demo

- Frontend: https://my-fleet-rent.vercel.app/
- Backend API: https://fleetrent.onrender.com/

> The application is deployed for demonstration and resume/project use. Some production payment features are planned for a later phase.

## Features

### Business

- Business registration and login
- Google authentication
- Business profile management
- Vehicle management
- Vehicle status management
- Driver assignment to vehicles
- Morning, evening, and full-time shifts
- Assignment details and history
- Vehicle-specific shift history
- Shift status tracking
- Driver contact/call actions
- Fleet-wide notifications
- Driver-not-started shift alerts
- Day-off notifications
- Rent/payment history
- Pending, paid, and remaining rent tracking
- Cash payment confirmation/rejection
- Search and filtering across fleet data
- Light and dark themes
- Responsive mobile interface

### Driver

- Driver registration and login
- Google authentication
- Driver profile management
- Current assignment
- Assigned vehicle and business details
- Shift start/end tracking
- Day-off reporting
- Shift history
- Daily rent/payment records
- Payment history
- Cash and online payment records
- Password reset using email OTP
- Push notification subscription

### Platform

- JWT-based authentication
- Role-based access control for business and driver accounts
- Profile-completion protection for protected workflows
- MongoDB data persistence with Mongoose
- REST API architecture
- Browser push notification support
- Automated shift reminder/notification service
- Google OAuth authentication
- Razorpay order/webhook infrastructure for the payment flow

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- CSS
- Google Identity Services
- Razorpay Checkout

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Google OAuth / Google Auth Library
- Razorpay
- Web Push
- CORS
- dotenv

### Deployment

- Vercel — frontend
- Render — backend
- MongoDB — database

## Project Structure

```text
FleetRent/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── business/
│   │   │   └── driver/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── public/
│   ├── vercel.json
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── README.md
```

## API Structure

The backend exposes REST endpoints under `/api`.

Examples:

```text
/api/drivers
/api/business
/api/vehicles
/api/assignments
/api/shifts
/api/payments
/api/auth/google
/api/auth/password-reset
/api/driver/profile
/api/business/profile
/api/notifications
/api/webhooks/razorpay
```

Protected endpoints use a JWT supplied through:

```http
Authorization: Bearer <token>
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/RahulShah1702/FleetRent.git
cd FleetRent
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

Start the frontend:

```bash
npm run dev
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_sender_email
BREVO_SENDER_NAME=FleetRent

VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your_email@example.com
```

Start the backend:

```bash
npm run dev
```

For production:

```bash
npm start
```

## Authentication

FleetRent supports two account roles:

- Business
- Driver

Authentication uses JWT tokens. Google authentication is available for both roles.

Protected routes determine the user's role from the JWT and enforce role-specific permissions.

Examples:

```text
Business → manage vehicles, assignments, shifts and payments
Driver   → manage own assignment, shifts and payments
```

## Notifications

FleetRent includes a notification system for operational events such as:

- Driver has not started a scheduled shift
- Driver takes a day off
- Shift-related reminders
- Business/driver notification history
- Browser push subscription

The backend also runs a scheduled shift-reminder check.

## Payments

FleetRent maintains daily rent/payment records associated with:

```text
Business
   ↓
Vehicle
   ↓
Assignment
   ↓
Driver
   ↓
Daily Payment
```

Payment records support:

- Due amount
- Paid amount
- Remaining amount
- Pending status
- Paid status
- Cash transactions
- Online transaction records
- Business cash confirmation/rejection

Razorpay order creation and webhook infrastructure are included in the project. The final production payment flow and verification hardening can be expanded in a later development phase.

## Security

- Passwords are hashed using bcryptjs
- JWT authentication for protected APIs
- Role-based authorization
- Profile-completion middleware
- Environment variables for secrets
- Google credentials verified server-side
- Razorpay webhook endpoint uses raw request bodies for signature verification
- Sensitive environment files should never be committed to Git

## Deployment

### Frontend — Vercel

Set the production environment variables:

```env
VITE_API_URL=https://fleetrent.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

The Vercel SPA rewrite is configured in:

```text
frontend/vercel.json
```

### Backend — Render

Set the backend environment variables listed above in the Render service settings.

The backend starts with:

```bash
npm start
```

The production API base URL is:

```text
https://fleetrent.onrender.com
```

## Future Improvements

- Complete and harden production Razorpay payment verification
- Add stronger payment reconciliation and transaction reporting
- Add advanced fleet analytics and reports
- Add maintenance reminders
- Add document-expiry alerts
- Add richer business reporting
- Improve automated testing and API validation
- Add CI/CD checks
- Improve monitoring and production observability

## Author

**Rahul Shah**

Information Technology  
Atharva College of Engineering, Mumbai

FleetRent was developed as a full-stack portfolio project demonstrating frontend development, backend API design, authentication, database modeling, role-based authorization, deployment, and real-world fleet-management workflows.
