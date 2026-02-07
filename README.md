# Blood Donation Management System

A comprehensive full-stack web application designed to streamline the blood donation process. This platform connects blood donors with hospitals and recipients, facilitating efficient blood request management, inventory tracking, and appointment scheduling.

## 🚀 Features

- **User Authentication**: Secure login and registration for Donors, Hospitals, and Administrators using JWT.
- **Dashboard**: Role-specific dashboards providing relevant information and actions for each user type.
- **Blood Request Management**: Create, view, and manage blood requests. Hospitals can request blood, and donors can view urgent needs.
- **Inventory Tracking**: Real-time tracking of blood inventory levels for hospitals.
- **Appointment Scheduling**: Donors can schedule appointments with hospitals for blood donation.
- **User Management**: Admin interface for verifying hospital accounts and managing users.
- **Notifications**: System for notifying users about request updates and appointments.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Context API / Local State (features driven)
- **Routing**: React Router
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js (JWT Strategy)
- **Email Service**: Nodemailer

## 📂 Project Structure

The project is organized into two main directories: `frontend` and `backend`.

### Backend (`/backend`)
The backend is built with **NestJS** and follows a modular architecture.

- `src/appointments`: Module for managing appointment bookings.
- `src/auth`: Handles user authentication, including strategies and guards.
- `src/email`: Service for sending email notifications.
- `src/inventory`: Manages blood stock levels for hospitals.
- `src/notifications`: Logic for system notifications.
- `src/requests`: Handles creation and management of blood requests.
- `src/users`: User management module (profiles, roles).
- `src/seed.ts`: Script to seed the database with initial data.

### Frontend (`/frontend`)
The frontend is a **React** application built with **Vite**.

- `src/api`: Global API configuration and shared services.
- `src/assets`: Static assets like images and icons.
- `src/components`: shared, reusable UI components used across the app.
- `src/features`: The core of the application, organized by domain/feature.
  - **Modules**: `admin`, `appointments`, `auth`, `inventory`, `requests`, `users`.
  - **Structure**: unique to this project, **every** feature module follows the same internal structure:
    - `api/`: API calls specific to the feature.
    - `components/`: Components used exclusive to this feature.
    - `hooks/`: Custom hooks for feature-specific logic.
    - `types/`: Types and interfaces for the feature.
- `src/pages`: Top-level components representing full pages/routes.

### 🏗️ Frontend Architecture Explained

The codebase uses a **Feature-Based Architecture** to ensure scalability.

- **Uniform Feature Structure**:
  All feature folders (`admin`, `appointments`, `auth`, `inventory`, `requests`, `users`) are self-contained and possess their own:
  - **`components`**: For UI elements specific to that feature.
  - **`hooks`**: For logic and state management within that feature.
  - **`api`**: For backend communication related to that feature.
  - **`types`**: For data models specific to that feature.

- **Global vs. Feature**:
  - Code used in multiple places lives in root `src/components`, `src/hooks`, etc.
  - Code used only for a specific domain lives in `src/features/<domain>`.

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local or Atlas)

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Set up environment variables:
Create a `.env` file in the `backend` directory with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/blood-donation
JWT_SECRET=your_jwt_secret_key
# Add other necessary variables (EMAIL_HOST, EMAIL_USER, etc.)
```

(Optional) Seed the database:
```bash
npm run seed
```

Start the server:
```bash
npm run start:dev
```
The backend API will run on `http://localhost:3000`.

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## 📜 Scripts

### Backend
- `npm run start:dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm run test`: Runs unit tests.
- `npm run lint`: Lints the codebase.

### Frontend
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Lints the codebase.

---

This project was built to help save lives by making blood donation more accessible and efficient.
