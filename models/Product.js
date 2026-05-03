const mongoose = require('mongoose');

const allowedTags = ['work', 'lifestyle', 'motor', 'mobile'];

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    tags: [{ type: String, enum: allowedTags }],
    owner: { type: String, required: true }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;