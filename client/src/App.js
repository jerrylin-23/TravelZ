import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import AddListing from './AddListing';
import ListingDetails from './ListingDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-listing" element={<AddListing />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;