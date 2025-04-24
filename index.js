// Load environment variables from .env file
require('dotenv').config();

// Import dependencies
const express = require('express');
const connectDB = require('./config/db'); // Assuming you moved DB connection to a separate file
const path = require('path');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', require('./routes/auth'));
// Add other routes here

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));