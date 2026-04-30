require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../db');
const User = require('../models/user');

async function main() {
    await connectDB();

    const user = new User({
        email: 'test@test.com',
        password: '1234'
    });

    await user.save();

    console.log('Usuario creado:', user);
    process.exit();
}

main();