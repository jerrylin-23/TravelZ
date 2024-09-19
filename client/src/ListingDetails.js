import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './ListingDetails.css';

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [bookingError, setBookingError] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/listings/${id}`);
        setListing(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing details');
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const fetchAvailableDates = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/listings/${id}/available-dates`);
      setAvailableDates(response.data);
    } catch (err) {
      console.error('Error fetching available dates:', err);
      setError('Failed to load available dates');
    }
  };

  useEffect(() => {
    fetchAvailableDates();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const openGoogleMaps = () => {
    if (listing) {
      const encodedAddress = encodeURIComponent(listing.location);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  const handleBookNow = () => {
    setShowCalendar(true);
  };

  const handleBooking = async () => {
    try {
      setBookingError(null);
      const response = await axios.post('http://localhost:5000/api/bookings', {
        listingId: listing._id,
        startDate,
        endDate
      });
      console.log('Booking created:', response.data);
      alert('Booking successful!');
      setShowCalendar(false);
      fetchAvailableDates(); // Refresh available dates
    } catch (err) {
      console.error('Error creating booking:', err);
      setBookingError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!listing) return <div className="error">Listing not found</div>;

  return (
    <div className="listing-details-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      <h1>{listing.name}</h1>
      <img src={listing.imageUrl} alt={listing.name} className="listing-image-large" />
      <p className="listing-location">{listing.location}</p>
      <p className="listing-price">${listing.price} per night</p>
      <p className="listing-description">{listing.description}</p>
      <div className="button-container">
        <button onClick={openGoogleMaps} className="map-button">View on Google Maps</button>
        <button onClick={handleBookNow} className="book-button-large">Book Now</button>
      </div>
      {showCalendar && (
        <div className="booking-calendar">
          <h2>Select Dates</h2>
          <div className="date-picker-container">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              excludeDates={availableDates.map(date => new Date(date))}
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              excludeDates={availableDates.map(date => new Date(date))}
            />
          </div>
          <button onClick={handleBooking} className="confirm-booking-btn">Confirm Booking</button>
          {bookingError && <p className="booking-error">{bookingError}</p>}
        </div>
      )}
    </div>
  );
}

export default ListingDetails;
