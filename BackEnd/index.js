const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Error connecting to MongoDB:", err));

  const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://workspacefinder-2.onrender.com'  // Add your backend URL if needed
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
// Middleware
// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// USER SCHEMA
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// WORKSPACE SCHEMA (assuming this is your existing Workspace model)
const workspaceSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  city: String,
  locationName: String,
  location: String,
  latitude: Number,
  longitude: Number,
  sqft: Number,
  images: [String],
  image1: String, // for backward compatibility
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

// AUTHENTICATION MIDDLEWARE
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    req.user = user;
    next();
  });
};

// AUTHENTICATION ROUTES
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hard-coded admin credentials check
    if (email === 'sravanis@gmail.com' && password === 'sravanis1841') {
      const token = jwt.sign(
        { userId: 'admin', email: email, isAdmin: true }, // isAdmin flag in token
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: 'admin',
          email: email,
          isAdmin: true // indicates admin role
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
// Register route
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword
    });

    await user.save();
    console.log('User created successfully:', user.email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    console.log('Login successful for:', user.email);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user profile (protected route)
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// EXISTING WORKSPACE ROUTES

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// AUTHENTICATION MIDDLEWARE - Add this new middleware for admin-only routes
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }
    
    req.user = user;
    next();
  });
};

// Add this route in your server.js file after the delete route

// Update workspace (admin only)
app.put('/api/workspaces/:id', authenticateAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title, description, price,
      city, locationName, location,
      latitude, longitude, sqft,
      existingImages // Array of existing image URLs to keep
    } = req.body;

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Handle images
    let imagePaths = [];
    
    // Keep existing images if provided
    if (existingImages) {
      imagePaths = typeof existingImages === 'string' 
        ? JSON.parse(existingImages) 
        : existingImages;
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `https://workspacefinder-2.onrender.com/uploads/${file.filename}`);
      imagePaths = [...imagePaths, ...newImages];
    }

    // Update workspace
    workspace.title = title;
    workspace.description = description;
    workspace.price = price;
    workspace.city = city;
    workspace.locationName = locationName;
    workspace.location = location;
    workspace.latitude = latitude;
    workspace.longitude = longitude;
    workspace.sqft = sqft;
    workspace.images = imagePaths;

    await workspace.save();

    res.status(200).json({
      success: true,
      message: 'Workspace updated successfully',
      workspace
    });
  } catch (error) {
    console.error('Update workspace error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update workspace'
    });
  }
});

// UPDATE THE ADD WORKSPACE ROUTE - Change from authenticateToken to authenticateAdmin
app.post('/api/newWorkspaces', authenticateAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title, description, price,
      city, locationName, location,
      latitude, longitude, sqft
    } = req.body;

    const imagePaths = req.files.map(file => `https://workspacefinder-2.onrender.com/uploads/${file.filename}`);

    const workspace = new Workspace({
      title,
      description,
      price,
      city,
      locationName,
      location,
      latitude,
      longitude,
      sqft,
      images: imagePaths,
    });

    await workspace.save();
    res.status(201).json({ 
      success: true,
      message: 'Workspace added successfully', 
      workspace 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      message: 'Error adding workspace', 
      error: err.message 
    });
  }
});

// Add this after your existing routes - around line 300
// Place this AFTER the authenticateAdmin middleware definition above

// Get all workspaces (protected route)
// Get all workspaces (protected route)
app.get('/api/workspaces', authenticateToken, async (req, res) => {
  try {
    console.log('========== WORKSPACE FETCH ==========');
    console.log('Authenticated user:', req.user);
    console.log('Fetching workspaces from database...');
    
    const workspaces = await Workspace.find();
    
    console.log('Number of workspaces found:', workspaces.length);
    console.log('Workspaces data:', JSON.stringify(workspaces, null, 2));
    console.log('=====================================');
    
    res.status(200).json(workspaces);
  } catch (err) {
    console.error('Error fetching workspaces:', err);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// Get a single workspace by ID (protected route)
app.get('/api/workspaces/:id', authenticateToken, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    res.status(200).json(workspace);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
});

// Static route to serve uploaded images
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.sendFile(filePath);
});

// EXISTING EMAIL ROUTES
app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'sravanis1841@gmail.com',
      pass: 'coaw hsly iypy aqde',
    },
  });

  const mailOptions = {
    from: email,
    to: 'sravanis1841@gmail.com',
    subject: `New Contact Form Submission from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Failed to send email.' });
  }
});

app.post('/send-feedback', async (req, res) => {
  const { rating, feedback, email } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'sravanis1841@gmail.com',
      pass: 'coaw hsly iypy aqde',
    },
  });

  const mailOptions = {
    from: email,
    to: 'sravanis1841@gmail.com',
    subject: `New Rating and Feedback Received`,
    text: `
      New feedback received:
      Rating: ${rating}
      Email: ${email}
      Feedback: ${feedback ? feedback : 'No additional feedback provided.'}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true, message: 'Feedback sent successfully!' });
  } catch (error) {
    console.error('Error sending feedback:', error);
    res.status(500).send({ success: false, message: 'Failed to send feedback.' });
  }
});

// Test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});
// Add these new schemas after the existing schemas

// BOOKING SCHEMA
const bookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  workspaceTitle: String,
  workspaceImage: String,
  bookingDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  hours: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentIntentId: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Booking = mongoose.model('Booking', bookingSchema);

// RATING/REVIEW SCHEMA
const ratingReviewSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const RatingReview = mongoose.model('RatingReview', ratingReviewSchema);

// STRIPE CONFIGURATION
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// BOOKING ROUTES

// Create payment intent
app.post('/api/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'inr',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
});

// Create booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const {
      workspaceId,
      workspaceTitle,
      workspaceImage,
      bookingDate,
      startTime,
      endTime,
      hours,
      totalAmount,
      paymentIntentId
    } = req.body;

    const booking = new Booking({
      userId: req.user.userId,
      userEmail: req.user.email,
      workspaceId,
      workspaceTitle,
      workspaceImage,
      bookingDate,
      startTime,
      endTime,
      hours,
      totalAmount,
      paymentIntentId,
      status: 'confirmed'
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

// Get user's bookings
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// Cancel booking
app.patch('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
});

// RATING/REVIEW ROUTES

// Add rating/review
app.post('/api/ratings', authenticateToken, async (req, res) => {
  try {
    const { workspaceId, rating, review } = req.body;

    // Check if user already reviewed this workspace
    const existingReview = await RatingReview.findOne({
      userId: req.user.userId,
      workspaceId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this workspace'
      });
    }

    const ratingReview = new RatingReview({
      userId: req.user.userId,
      userEmail: req.user.email,
      workspaceId,
      rating,
      review
    });

    await ratingReview.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      ratingReview
    });
  } catch (error) {
    console.error('Rating creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
});

// Get ratings for a workspace
app.get('/api/ratings/:workspaceId', authenticateToken, async (req, res) => {
  try {
    const ratings = await RatingReview.find({ 
      workspaceId: req.params.workspaceId 
    }).sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.status(200).json({
      success: true,
      ratings,
      averageRating: avgRating,
      totalReviews: ratings.length
    });
  } catch (error) {
    console.error('Fetch ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ratings'
    });
  }
});
// Add this route in your server code
app.get('/api/admin/bookings', authenticateAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('workspaceId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Admin fetch bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// Add workspace deletion endpoint
app.delete('/api/workspaces/:id', authenticateAdmin, async (req, res) => {
  try {
    const workspace = await Workspace.findByIdAndDelete(req.params.id);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete workspace'
    });
  }
});

// Get all reviews (admin only)
app.get('/api/admin/reviews', authenticateAdmin, async (req, res) => {
  try {
    const reviews = await RatingReview.find()
      .populate('workspaceId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Admin fetch reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// Update the routes logging to include new routes
console.log('- POST /api/create-payment-intent');
console.log('- POST /api/bookings');
console.log('- GET /api/bookings');
console.log('- PATCH /api/bookings/:id/cancel');
console.log('- POST /api/ratings');
console.log('- GET /api/ratings/:workspaceId');
// Listen on port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- POST /api/auth/register');
  console.log('- POST /api/auth/login');
  console.log('- GET /api/auth/profile');
  console.log('- GET /api/workspaces');
  console.log('- GET /api/test');
});