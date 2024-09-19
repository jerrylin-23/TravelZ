// server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const AppleStrategy = require('passport-apple').Strategy;

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// User Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  oauthProvider: { type: String },
  oauthId: { type: String },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);

// Configure Passport strategies
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists in your database
    let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'google' });
    
    if (!user) {
      // If user doesn't exist, create a new user
      user = new User({
        username: profile.displayName,
        email: profile.emails[0].value,
        oauthId: profile.id,
        oauthProvider: 'google'
      });
      await user.save();
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

app.use(passport.initialize());

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:5000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'facebook' });
      
      if (!user) {
        user = new User({
          username: profile.displayName,
          email: profile.emails[0].value,
          oauthId: profile.id,
          oauthProvider: 'facebook'
        });
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Apple Strategy
passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    callbackURL: "http://localhost:5000/auth/apple/callback",
    keyID: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, idToken, profile, done) => {
    try {
      // Apple doesn't provide much profile information, so we'll use the email from idToken
      const { email, sub: appleId } = idToken;
      
      let user = await User.findOne({ oauthId: appleId, oauthProvider: 'apple' });
      
      if (!user) {
        user = new User({
          username: email.split('@')[0], // Use part of email as username
          email: email,
          oauthId: appleId,
          oauthProvider: 'apple'
        });
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Add OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to dashboard
    res.redirect('/dashboard');
  }
);

// Facebook auth routes
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to dashboard
    res.redirect('http://localhost:3000/dashboard');
  }
);

// Apple auth routes
app.get('/auth/apple', passport.authenticate('apple'));
app.get('/auth/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to dashboard
    res.redirect('http://localhost:3000/dashboard');
  }
);

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Listing Model
const listingSchema = new mongoose.Schema({
  name: String,
  location: String,
  price: Number,
  imageUrl: String,
  description: String,
  availableFrom: Date,
  availableTo: Date
});
const Listing = mongoose.model('Listing', listingSchema);

// Get All Listings Endpoint
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await Listing.find();
    res.setHeader('Content-Type', 'application/json');
    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
  }
});

// Create a new listing
app.post('/api/listings', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { name, location, price, description } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newListing = new Listing({
      name,
      location,
      price: parseFloat(price),
      imageUrl,
      description
    });

    const savedListing = await newListing.save();
    res.status(201).json(savedListing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ message: 'Error creating listing', error: error.message });
  }
});

// Get Single Listing Endpoint
app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ message: 'Error fetching listing', error: error.message });
  }
});

// Booking Model
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

bookingSchema.statics.checkAvailability = async function(listingId, startDate, endDate) {
  const bookings = await this.find({
    listing: listingId,
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } }
    ]
  });
  return bookings.length === 0;
};

const Booking = mongoose.model('Booking', bookingSchema);

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;
    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const bookingStartDate = new Date(startDate);
    const bookingEndDate = new Date(endDate);

    const isAvailable = await Booking.checkAvailability(listingId, bookingStartDate, bookingEndDate);
    if (!isAvailable) {
      return res.status(400).json({ message: 'The selected dates are not available' });
    }

    const booking = new Booking({
      listing: listingId,
      startDate: bookingStartDate,
      endDate: bookingEndDate,
    });
    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

// Get available dates for a listing
app.get('/api/listings/:id/available-dates', async (req, res) => {
  try {
    const listingId = req.params.id;
    const bookings = await Booking.find({ listing: listingId });
    
    const bookedDates = bookings.flatMap(booking => 
      getDatesInRange(booking.startDate, booking.endDate)
    );

    res.json(bookedDates);
  } catch (error) {
    console.error('Error fetching available dates:', error);
    res.status(500).json({ message: 'Error fetching available dates', error: error.message });
  }
});

// Helper function to get all dates in a range
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

// Server Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
