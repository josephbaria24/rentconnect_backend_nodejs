// index.js
require('dotenv').config();
const { app, server } = require('./app'); // Destructure to get app and server
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);


async function startServer() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas");

    // Start the Express server after connecting to MongoDB
    // server.listen(port, () => {
    //   console.log(`Server listening on http://localhost:${port}`);
    // });
    server.listen(port, '0.0.0.0', () => { // Ensures it listens on all interfaces
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
