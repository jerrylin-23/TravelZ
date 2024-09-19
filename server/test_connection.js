require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Define Listing schema
const listingSchema = new mongoose.Schema({
  name: String,
  location: String,
  price: Number,
  imageUrl: String,
  description: String
});

const Listing = mongoose.model('Listing', listingSchema);

// Sample data
const sampleListings = [
  {
    name: "Cozy Beach House",
    location: "Malibu, California",
    price: 250,
    imageUrl: "https://example.com/beach-house.jpg",
    description: "Beautiful beach house with ocean views"
  },
  {
    name: "Mountain Retreat",
    location: "Aspen, Colorado",
    price: 300,
    imageUrl: "https://example.com/mountain-retreat.jpg",
    description: "Secluded cabin in the mountains"
  },
  {
    name: "City Loft",
    location: "New York City, New York",
    price: 200,
    imageUrl: "https://example.com/city-loft.jpg",
    description: "Modern loft in the heart of the city"
  },
  {
    name: "Lakeside Cabin",
    location: "Lake Tahoe, Nevada",
    price: 180,
    imageUrl: "https://example.com/lakeside-cabin.jpg",
    description: "Charming cabin by the lake"
  },
  {
    name: "Desert Oasis",
    location: "Palm Springs, California",
    price: 220,
    imageUrl: "https://example.com/desert-oasis.jpg",
    description: "Luxurious home with a pool in the desert"
  }
];

// Function to populate the database
async function populateDb() {
  try {
    // Clear existing listings
    await Listing.deleteMany({});
    console.log('Cleared existing listings');

    // Insert new listings
    const result = await Listing.insertMany(sampleListings);
    console.log(`Added ${result.length} listings`);

    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error populating database:', error);
    mongoose.connection.close();
  }
}

// Run the population script
populateDb();