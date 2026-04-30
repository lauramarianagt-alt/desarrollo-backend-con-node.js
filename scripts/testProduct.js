const connectDB = require('../db');
const Product = require('../models/Product');

async function main() {
    await connectDB();
    const product = new Product({
        name: 'Coche',
        price: 10000,
        tags: ['automóvil', 'transporte'],
        owner: ['lmgt.test.com']
    });

    await product.save();

    const products = await Product.find();
    console.log('Productos encontrados:', products);

    process.exit();
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});