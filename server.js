// Suppress the punycode deprecation warning
process.noDeprecation = true;  // More reliable than process.on('warning')

// Import the Next.js server
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const mongoose = require('mongoose');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Load environment variables
require('dotenv').config({
  path: '.env.local'
});

// Create the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Connect to MongoDB once at server startup
async function connectToMongoDB() {
  if (mongoose.connection.readyState === 1) {
    console.log('MongoDB already connected');
    return;
  }
  
  try {
    console.log('Connecting to MongoDB...');
    const startTime = Date.now();
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || 'code_learn',
    });
    console.log(`MongoDB connected in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// Prepare the app
app.prepare()
  .then(async () => {
    console.log(`Starting server in ${dev ? 'development' : 'production'} mode...`);
    
    // Connect to MongoDB
    await connectToMongoDB();
    
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    server.listen(port, (err) => {
      if (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
        return;
      }
      console.log(`> Ready on http://${hostname}:${port}`);
    });

    // Handle graceful shutdown
    ['SIGINT', 'SIGTERM'].forEach((signal) => {
      process.on(signal, async () => {
        console.log(`${signal} received, closing server...`);
        
        // Close MongoDB connection
        if (mongoose.connection.readyState === 1) {
          console.log('Closing MongoDB connection...');
          await mongoose.connection.close();
          console.log('MongoDB disconnected');
        }
        
        server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });
      });
    });
  })
  .catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
  }); 