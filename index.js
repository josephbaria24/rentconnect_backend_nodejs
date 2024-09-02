const app = require('./app');
const { MongoClient } = require('mongodb');
const UserModel = require('./models/user.model')
const PropertyModel = require('./models/properties.model')


const port = 3000;

const db = require('./config/db')

//const uri = "mongodb+srv://joseph:admin@cluster0.0tqay.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


//const client = new MongoClient(uri);


app.get('/', (req, res) => {
  res.send("Hello World!!!");
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
// async function startServer() {
//   try {
//     await client.connect();
//     console.log("Connected successfully to MongoDB Atlas");

//     // Now that you're connected, you can start your Express server
    

//   } catch (err) {
//     console.error("Failed to connect to MongoDB Atlas", err);
//     process.exit(1); // Exit the process with an error code
//   }
// }

// startServer();
