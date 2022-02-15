const Review = require('../models/Review');
const Product = require('../models/Product');
const CustomError = require('../errors');
const {StatusCodes} = require('http-status-codes');
const checkPermissions = require('../utils/checkPermissions');
const mongoose = require('mongoose');

const createReview = async (req, res) => {
    const {product: productId} = req.body;
    const isValidProduct = await Product.findOne({_id: productId});
    if(!isValidProduct){
        throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }
    const alreadySubmited = await Review.findOne({product: productId, user: req.user.userId});
    if(alreadySubmited){
        throw new CustomError.BadRequestError(`Already submitted review for this product`);
    }
    req.body.user = req.user.userId;
    const review = await Review.create(req.body);
    res.status(StatusCodes.CREATED).json({review});
}
const getAllReviews = async (req, res) => {
    const {rating, user, product, sort, populate} = req.query;
    let queryObject = {};
    let result = Review;
    if(rating){
        queryObject.rating = rating;
    }
    if(user){
        queryObject.user = user;
    }
    if(product){
        queryObject.product = product;
    }
    result = result.find(queryObject);
    if(sort){
        result = result.sort(sort);
    }
    if(populate){
        const arrayPopulate = populate.split(",");
        arrayPopulate.forEach(item=>{
            if(item==='user'){
                result = result.populate({path: item, select:"-password"});
            }
            if(item==='product'){
                result = result.populate(item);
            }
        })
    }
    const totalReview = await Review.countDocuments(queryObject);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalPage = Math.ceil(totalReview / limit);
    const review = await result.skip(skip).limit(limit);
    res.status(StatusCodes.OK).json({review, count: review.length, currentPage:page, totalPage, totalReview})
}
const getSingleReview = async (req, res) => {
    const {id: reviewId} = req.params;
    const review = await Review.findOne({_id: reviewId});
    if(!review){
        throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
    }
    res.status(StatusCodes.OK).json({review});
}


const starPercent = async (req, res) => {
    const {id: productId} = req.params;
    const review = await Review.aggregate(
    [
        {
        '$match': {
            'product': mongoose.Types.ObjectId(productId)
        }
        }, {
        '$bucket': {
            'groupBy': '$rating', 
            'boundaries': [
            0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5
            ], 
            'default': 'default', 
            'output': {
            'count': {
                '$sum': 1
            }
            }
        }
        }
    ]);
    const totalReview = review.reduce((total, item)=>{
        total += item.count;
        return total;
    }, 0)
    const percentStar = review.map((item)=>{
        let percent = (item.count / totalReview) * 100;
        percent = percent.toFixed(2);
        return {star: item._id, count: item.count, percent};
    })
    res.status(StatusCodes.OK).json({percentStar, totalReview});
}



const updateReview = async (req, res) => {
    const {id: reviewId} = req.params;
    const {rating, comment} = req.body;
    const review = await Review.findOne({_id: reviewId});
    if(!review){
        throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
    }
    checkPermissions(req.user, review.user);
    review.rating = rating;
    review.comment = comment;
    await review.save()
    res.status(StatusCodes.OK).json({review})
}
const deleteReview = async (req, res) => {
    const {id: reviewId} = req.params;
    const review = await Review.findOne({_id: reviewId});
    if(!review){
        throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
    }
    checkPermissions(req.user, review.user);
    await review.remove();
    res.status(StatusCodes.OK).json({msg: "Success! Review removed"});
}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    starPercent
}