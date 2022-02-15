const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    delivery: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirm', 'success'],
        default: 'pending'
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderItem: [
        {
            name: {
                type: String,
                required: true,
                trim: true
            },
            image: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            discount: {
                type: Number,
                default: 0
            },
            quantity: {
                type: Number,
                required: true
            },
            product: {
                type: mongoose.Types.ObjectId,
                ref: 'Product',
                required: true
            }
        }
    ]
}, {timestamps: true})


module.exports = mongoose.model('Order', OrderSchema);