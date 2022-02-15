const mongoose = require('mongoose');


const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name category'],
        trim: true
    },
    image: {
        type: String,
        default: '/upload/example-category.jpg'
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    isShow: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Category', CategorySchema);