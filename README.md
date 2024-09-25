# TravelZ

TravelZ is a full-stack travel booking application built with the MERN stack (MongoDB, Express, React, Node.js). 
(Vercel Deployment in the works, for now you will have to run this locally)

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/ff9655c7-b6c3-42c9-9310-da5e325df4ee" width="200"/>
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/eba035aa-71f5-4247-9fe7-e6113fe6d601" width="200"/>
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/0d65f746-753e-47a7-bbb6-2297c5a03516" width="200"/>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/3fa63d47-d206-479b-9683-c6c57d6b24ca" width="200"/>
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/3e0940a8-77d1-4cd2-ad83-7c7fc4652d08" width="200"/>
      </td>
    </tr>
  </table>
</div>




## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)


## Features

- User authentication (signup, login, logout)
- OAuth integration (Google, Facebook, Apple) (WIP!)
- Property listing creation and management
- Booking system Database tracks already booked dates for properties
- User dashboard
- Responsive design

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- MongoDB (v4 or later)
- npm (usually comes with Node.js)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/travelz.git
   cd travelz
   ```

2. Install server dependencies:
   ```
   cd server
   npm install
   ```

3. Install client dependencies:
   ```
   cd ../client
   npm install
   ```

4.Use the provided `.env` file:
   The project comes with a pre-configured `.env` file in the server directory. This file contains all the necessary environment variables for the application to run. You don't need to modify this file unless you want to use your own API keys or database.

   If you do need to make changes, open the `.env` file in the server directory and update the values as needed:
   ```
   MONGODB_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   APPLE_CLIENT_ID=your_apple_client_id
   APPLE_TEAM_ID=your_apple_team_id
   APPLE_KEY_ID=your_apple_key_id
   APPLE_PRIVATE_KEY=your_apple_private_key
   ```

   Replace the placeholder values with your actual credentials.

## Running the Application

1. Start the server:
   ```
   cd server
   npm start
   ```

2. In a new terminal, start the client:
   ```
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

- POST `/api/register` - User registration
- POST `/api/login` - User login
- GET `/api/listings` - Get all listings
- POST `/api/listings` - Create a new listing
- GET `/api/listings/:id` - Get a specific listing
- POST `/api/bookings` - Create a new booking
- GET `/api/bookings` - Get user's bookings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
