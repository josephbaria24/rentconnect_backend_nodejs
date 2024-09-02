// Load environment variables from the .env file
require('dotenv').config();

const app = require('./app');
const { MongoClient } = require('mongodb');
const UserModel = require('./models/user.model');
const PropertyModel = require('./models/properties.model');

// Use the environment variable for the port and MongoDB URI
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

// Connect to MongoDB
async function startServer() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas");

    // Start the Express server after connecting to MongoDB
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB Atlas", err);
    process.exit(1); // Exit the process with an error code
  }
}

// Start the server
startServer();

app.get('/', (req, res) => {
  res.send("Hello itlog");
});
