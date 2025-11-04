import { MongoClient } from 'mongodb'

// Validate environment variables
if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

// Global reference to the MongoDB client
let client: MongoClient | null = null
let clientPromise: Promise<MongoClient>

// Handle different environments
if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the value
  // across module reloads caused by HMR (Hot Module Replacement)
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
      .then((connectedClient) => {
        console.log('MongoDB client connected (dev mode)')
        return connectedClient
      })
      .catch((err) => {
        console.error('MongoDB client connection error (dev mode):', err)
        throw err
      })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
    .then((connectedClient) => {
      console.log('MongoDB client connected (production mode)')
      return connectedClient
    })
    .catch((err) => {
      console.error('MongoDB client connection error (production mode):', err)
      throw err
    })
}

// Handle graceful shutdown - important for deployed environments
process.on('SIGTERM', async () => {
  if (client) {
    console.log('SIGTERM received, closing MongoDB client')
    await client.close()
    console.log('MongoDB client closed')
  }
})

// Export a module-scoped MongoClient promise
export default clientPromise 