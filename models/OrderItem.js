const mongoose = require('mongoose');


const OrderItemSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('OrderItem', OrderItemSchema);