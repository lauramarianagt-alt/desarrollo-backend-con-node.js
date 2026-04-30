const connectDB = require('../db');
const Product = require('../models/Product');

async function main() {
    await connectDB();

    const result = await Product.deleteMany({
        $or: [
            { owner: { $exists: false }},
            { owner: null },
            { owner: { $type: 'array' }}
        ]

    });

    console.log('Productos eliminados:', result.deletedCount);

    process.exit();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
