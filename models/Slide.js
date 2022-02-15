const mongoose = require('mongoose');


const SlideSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please provide title slide"],
        trim: true
    },
    subtitle: {
        type: String,
        required: [true, "Please provide subtitle slide"],
        trim: true
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
    },
    isShow: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Slide', SlideSchema);