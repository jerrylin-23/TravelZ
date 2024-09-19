import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { FaUserCircle } from 'react-icons/fa';

function Dashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/listings');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError(`Failed to load listings. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleListingClick = (id) => {
    navigate(`/listing/${id}`);
  };

  const handleUserIconClick = () => {
    setShowLogout(!showLogout);
  };

  const handleLogout = () => {
    // Implement logout logic here
    // For now, we'll just navigate to the login page
    navigate('/');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="logo">TravelZ</h1>
        <div className="header-actions">
          <Link to="/add-listing" className="add-listing-btn">Add New Listing</Link>
          <div className="user-menu">
            <FaUserCircle className="user-icon" onClick={handleUserIconClick} />
            {showLogout && (
              <div className="logout-prompt">
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="listings-grid">
        {listings.map(listing => (
          <div key={listing._id} className="listing-card" onClick={() => handleListingClick(listing._id)}>
            <img src={listing.imageUrl} alt={listing.name} className="listing-image" />
            <div className="listing-details">
              <h2 className="listing-name">{listing.name}</h2>
              <p className="listing-location">{listing.location}</p>
              <p className="listing-price">${listing.price} per night</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
