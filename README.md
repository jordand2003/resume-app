# Job Seeker Application

A full-stack application for job seekers with authentication capabilities.

## Tech Stack

- Frontend: React with Material UI
- Backend: Node.js
- Database: MongoDB with Mongoose
- Authentication: Auth0
- API: REST

## Project Structure

```
.
├── client/             # React frontend
├── server/             # Node.js backend
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Auth0 Account

## Setup Instructions

1. Clone the repository
2. Install dependencies:

   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:

   ```
   MONGODB_URI=your_mongodb_uri
   AUTH0_DOMAIN=your_auth0_domain
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_CLIENT_SECRET=your_auth0_client_secret
   ```

4. Create a `.env` file in the client directory with:

   ```
   REACT_APP_AUTH0_DOMAIN=your_auth0_domain
   REACT_APP_AUTH0_CLIENT_ID=your_auth0_client_id
   ```

5. Start the development servers:

   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server (in a new terminal)
   cd client
   npm start
   ```

## Features

- User Authentication (Login/Register)
- Landing Page
- Home Page
- Secure Logout
- Password Recovery
- Protected Routes

## Security Features

- Secure token storage
- HTTP-only cookies
- Protected API endpoints
- Secure password reset flow
