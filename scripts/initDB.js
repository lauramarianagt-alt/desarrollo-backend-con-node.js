require ('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const connectDB = require('../db');
const Product = require('../models/Product');
const User = require('../models/User');

async function initDB() {
    try {
        await connectDB();

        await User.deleteMany();
        await Product.deleteMany();

        const passwordHash = await bcrypt.hash('1234', 10);

        const users =await User.insertMany([
            {
                email: 'user1@example.com',
                password: passwordHash
            },
            {
                email: 'ana@example.com',
                password: passwordHash
            }
        ]);

        await Product.insertMany([
            {
                name: 'iPhone 13',
                price: 449,
                tags: ['mobile'],
                owner: users[0].email
            },
            {
                name: 'Bicicleta',
                price: 199,
                tags: ['lifestyle'],
                owner: users[0].email
                },
            {
                name: 'Mesa de trabajo',
                price: 99,
                tags: ['work'],
                owner: users[1].email
            },
            {
                name: 'Toyota Corolla',
                price: 5999,
                tags: ['motor'],
                owner: users[1].email
            }
        ]);

        console.log('Base de datos inicializada correctamente');
        console.log('Usuarios de prueba');
        console.log(users[0].email + ' / 1234');
        console.log(users[1].email + ' / 1234');
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
    } finally {
        await mongoose.connection.close();
    }
}

initDB();