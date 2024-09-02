const mongoose = require('mongoose');

const connection = mongoose.createConnection('mongodb+srv://joseph:admin@cluster0.0tqay.mongodb.net/rentcon?retryWrites=true&w=majority&appName=Cluster0').on('open',() => {
    console.log("MongoDb Connected");
}).on('error', () => {
    console.log("MongoDb Connection error");
})

module.exports = connection;