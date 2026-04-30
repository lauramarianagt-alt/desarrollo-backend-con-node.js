require('dotenv').config();

const mongoose = require('mongoose');

async function connectDB() {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log('Conexión a MongoDB establecida');
    return connection;
} 


module.exports = connectDB;
