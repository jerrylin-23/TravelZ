import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddListing.css';

function AddListing() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('location', location);
    formData.append('price', price);
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/listings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Listing created:', response.data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err.response?.data?.message || 'Error creating listing');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="add-listing-container">
      <button onClick={handleBack} className="back-button">← Back</button>
      <h2>Add New Listing</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="add-listing-form">
        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="name">Listing Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="price">Price per night</label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="input-group full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="input-group full-width">
            <label htmlFor="image">Upload Image</label>
            <input
              id="image"
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
            />
            {image && (
              <div className="image-preview">
                <img src={URL.createObjectURL(image)} alt="Preview" />
              </div>
            )}
          </div>
        </div>
        <button type="submit" className="submit-btn">Add Listing</button>
      </form>
    </div>
  );
}

export default AddListing;
