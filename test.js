const { MongoClient } = require('mongodb');

// Replace the connection string with your MongoDB URI
const mongoURI = 'mongodb://your-mongodb-uri';

// Create a MongoDB connection pool
const client = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to connect to MongoDB and return the client
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; // You might want to handle this error in your application
  }
}

// Function to close the MongoDB connection
async function closeMongoDBConnection() {
  try {
    await client.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error; // You might want to handle this error in your application
  }
}

// Initialize the connection pool when your server starts
connectToMongoDB();

// Later, in your server code or route handlers, you can use the connection pool like this:

// Example usage in a route handler
app.get('/some-route', async (req, res) => {
  try {
    const database = client.db('YourDatabaseName');
    const collection = database.collection('YourCollectionName');
    const result = await collection.find({}).toArray();
    console.log('Query Result:', result);
    res.json(result);
  } catch (error) {
    console.error('Error handling the request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// When your server is shutting down, make sure to close the MongoDB connection pool
process.on('SIGINT', async () => {
  await closeMongoDBConnection();
  process.exit();
});
