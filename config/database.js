/**
 * MongoDB Database Configuration
 * This file manages the MongoDB connection settings and provides a connection function
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection URI
// Format: mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@ac-tbwe4hs-shard-00-00.bac2oby.mongodb.net/ClassRoomShedulerDB?retryWrites=true&w=majority';

// Ensure the database name is explicitly set in the URI
const ensureCorrectDatabase = (uri) => {
  // If URI doesn't contain a database name or uses 'test', update it
  if (uri.includes('/test?') || !uri.match(/\/[a-zA-Z0-9_-]+\?/)) {
    return uri.replace(/\/test\?|\/\?/, '/ClassRoomShedulerDB?');
  }
  return uri;
};

const connectToDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    // Ensure the URI specifies the correct database
    const connectionURI = ensureCorrectDatabase(MONGODB_URI);
    
    // Connect to MongoDB with options
    await mongoose.connect(connectionURI, {
      // These are the default options in newer mongoose versions
    });
    
    // Extract database name from connection string for logging
    const dbName = mongoose.connection.db.databaseName;
    const host = mongoose.connection.host;
    
    console.log('Connected to MongoDB successfully');
    console.log(`Connected to database: ${dbName} on ${host}`);
    
    // Verify database is correct, show warning otherwise
    if (dbName !== 'ClassRoomShedulerDB') {
      console.warn(`Warning: Connected to ${dbName} instead of ClassRoomShedulerDB. Check your connection string.`);
    }
    
    // Verify write permissions by attempting to create a test document
    try {
      // Create a temporary collection for testing
      const testCollection = mongoose.connection.collection('_permission_test');
      await testCollection.insertOne({ test: true, timestamp: new Date() });
      await testCollection.deleteOne({ test: true });
      console.log('Database permissions verified successfully');
    } catch (permError) {
      console.error('Database permission check failed:', permError.message);
      console.warn('Your MongoDB user may not have write permissions for this database');
    }
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Handle connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Handle disconnection
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

module.exports = {
  connectToDatabase,
  mongoose
};