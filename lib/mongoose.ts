import mongoose from 'mongoose';

// Connection options
const options: mongoose.ConnectOptions = {
  bufferCommands: false,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 1,  // Maintain at least 1 socket connection
  socketTimeoutMS: 30000, // Close sockets after 30 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // Give up connecting after 5 seconds
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
};

// Connection state tracking
let isConnected = false;

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global cached connection
 */
declare global {
  var mongoConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Initialize the global cache
if (!global.mongoConnection) {
  global.mongoConnection = { conn: null, promise: null };
}

export const dbConnect = async (): Promise<typeof mongoose> => {
  try {
    // If we have an existing connection, return it
    if (isConnected && global.mongoConnection.conn) {
      console.log('Using existing MongoDB connection');
      return global.mongoConnection.conn;
    }

    // If we already have a connection promise in progress, wait for it
    if (global.mongoConnection.promise) {
      console.log('Waiting for existing MongoDB connection promise');
      global.mongoConnection.conn = await global.mongoConnection.promise;
      isConnected = true;
      return global.mongoConnection.conn;
    }
    
    // Otherwise create a new connection
    console.log('Creating new MongoDB connection');
    global.mongoConnection.promise = mongoose.connect(MONGODB_URI as string, options);
    
    // Wait for the connection to establish
    global.mongoConnection.conn = await global.mongoConnection.promise;
    isConnected = true;
    
    // Set up connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
      isConnected = true;
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });
    
    // Return the connection
    return global.mongoConnection.conn;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    global.mongoConnection.promise = null;
    throw error;
  }
};

// Add a wrapper to handle errors in API routes
export const withDbConnection = <T>(handler: () => Promise<T>): Promise<T> => {
  return dbConnect()
    .then(() => handler())
    .catch((error) => {
      console.error('Database operation failed:', error);
      throw error;
    });
};

export async function dbDisconnect() {
  if (global.mongoConnection.conn) {
    await global.mongoConnection.conn.disconnect();
    global.mongoConnection.conn = null;
    global.mongoConnection.promise = null;
    console.log('Disconnected from MongoDB');
  }
}

// Call connect once at startup if available
if (typeof window === 'undefined') {
  dbConnect().catch(err => console.error('Initial connection failed:', err));
}

export default dbConnect; 