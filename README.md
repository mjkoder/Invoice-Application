# Invoice Application

A web application for managing and tracking invoices with user authentication, filtering, and Zapier integration.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Backend](#backend)
    - [Frontend](#frontend)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [License](#license)

## Features

- **User Authentication**: Secure login via Google OAuth.
- **Invoice Management**: Create, view, and manage invoices.
- **Filtering**: Filter by status and sort by date.
- **Zapier Integration**: Trigger Zapier workflows from the app.
- **Responsive Design**: Optimized for all devices.

## Technologies

### Frontend

- React
- Axios
- React Router
- Lucide-React (Icons)
- Tailwind CSS

### Backend

- Node.js
- Express.js
- Passport.js (Google OAuth)
- MongoDB & Mongoose
- Express-Session
- CORS

## Getting Started

### Prerequisites

- **Node.js** (v14+)
- **npm**
- **MongoDB** instance
- **Google OAuth Credentials**

### Installation

#### Backend

1. **Navigate to backend directory:**

    ```bash
    cd backend
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Create a `.env` file:**

    ```env
    PORT=5000
    MONGO_URI=your_mongodb_uri
    SESSION_SECRET=your_session_secret
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    FRONTEND_URL=http://localhost:3000

    # For sending emails
    EMAIL_SERVICE=gmail
    EMAIL_USER=your_email_from_where_notification_will_be_sent
    EMAIL_PASS=get_from_google_security
    ```

4. **Start the backend server:**

    ```bash
    npm start
    ```

#### Frontend

1. **Navigate to frontend directory:**

    ```bash
    cd frontend
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Create a `.env` file:**

    ```env
    REACT_APP_BACKEND_URL=http://localhost:5000
    ```

4. **Start the frontend server:**

    ```bash
    npm start
    ```

## Usage

1. **Access the App:**
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

2. **Login:**
   - Click "Sign In" and authenticate with Google.

3. **Manage Invoices:**
   - **Create**: Click "Create Invoice" to add a new invoice.
   - **Filter & Sort**: Apply status filters and sort invoices by date.
   - **Trigger Zap**: For unpaid invoices, trigger Zapier workflows.

4. **Logout:**
   - Click the "Logout" button in the navbar to sign out.

## Environment Variables

### Backend (`backend/.env`)

- `PORT`: Backend server port (e.g., `5000`).
- `MONGO_URI`: MongoDB connection string.
- `SESSION_SECRET`: Secret key for sessions.
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID.
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret.
- `FRONTEND_URL`: Frontend application URL (e.g., `http://localhost:3000`).
- `# For sending emails`
- `EMAIL_SERVICE`:gmail
- `EMAIL_USER`: Your Gmail Address from where email will be sent.
- `EMAIL_PASS`: Gmail Password(Different than login password)

### Frontend (`frontend/.env`)

- `REACT_APP_BACKEND_URL`: Backend server URL (e.g., `http://localhost:5000`).

## License

This project is licensed under the [MIT License](LICENSE).
