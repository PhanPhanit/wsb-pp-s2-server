const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Please provide product name'],
        maxlength: [100, 'name can not be more than 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    author: {
        type: String,
        trim: true,
        required: [true, "Please provide author"]
    },
    publisher: {
        type: String,
        required: [true, "Please provide publicsher"]
    },
    genre: {
        type: String,
        trim: true,
        required: [true, "Please provide genre"]
    },
    language: {
        type: String,
        trim: true,
        required: [true, "Please provide language"]
    },
    country: {
        type: String,
        trim: true,
        required: [true, "Please provide country"]
    },
    published: {
        type: String,
        trim: true,
        required: [true, "Please provide published"]
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'Please provide product description'],
        maxlength: [1000, 'Description can not be more than 1000 characters']
    },
    image: {
        type: [String],
        default: ['/upload/example.jpg']
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    sold: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    isShow: {
        type: Boolean,
        default: true
    }
}, {timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}});


productSchema.virtual('reviews', {
    ref: 'Review',
    localField: "_id",
    foreignField: "product",
    justOne: false
})



productSchema.post('remove', async function(){
    await this.model('Review').deleteMany({product: this._id});
})



module.exports = mongoose.model('Product', productSchema);