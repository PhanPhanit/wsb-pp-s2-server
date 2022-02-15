const Product = require('../models/Product');
const Slide = require('../models/Slide');
const CustomError = require('../errors');
const {StatusCodes} = require('http-status-codes');


const createSlide = async (req, res) => {
    const {product: productId} = req.body;
    const productExist = await Product.findOne({_id: productId, isShow: true});
    if(!productExist){
        throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }
    const isSlideExist = await Slide.findOne({product: productId});
    if(isSlideExist){
        throw new CustomError.BadRequestError("Product already exist");
    }
    req.body.user = req.user.userId;
    const createSlide = await Slide.create(req.body);
    const slide = await Slide.findOne({_id: createSlide._id}).populate({path: "product", select: "image"});

    res.status(StatusCodes.CREATED).json({slide});
}
const getAllSlide = async (req, res) => {
    const {sort} = req.query;
    let objectQuery = {isShow: true};
    let result = Slide.find(objectQuery);
    if(sort){
        result = result.sort(sort);
    }
    const totalSlide = await Slide.countDocuments(objectQuery);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalPage = Math.ceil(totalSlide / limit);

    const slide = await result.skip(skip).limit(limit).populate({path: "product", select: "image"});

    res.status(StatusCodes.OK).json({slide, count: slide.length, currentPage: page, totalPage, totalSlide});
}
const adminGetAllSlide = async (req, res) => {
    const {sort, isShow="all"} = req.query;
    let objectQuery = {};
    if(isShow!=="all"){
        objectQuery.isShow = isShow;
    }
    let result = Slide.find(objectQuery);
    if(sort){
        result = result.sort(sort);
    }
    const totalSlide = await Slide.countDocuments(objectQuery);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalPage = Math.ceil(totalSlide / limit);

    const slide = await result.skip(skip).limit(limit).populate({path: "product", select: "image"});

    res.status(StatusCodes.OK).json({slide, count: slide.length, currentPage: page, totalPage, totalSlide});
}
const getSingleSlide = async (req, res) => {
    const {id: slideId} = req.params;
    const slide = await Slide.findOne({_id: slideId}).populate({path: "product", select: "image"});
    if(!slide){
        throw new CustomError.NotFoundError(`No slide with id: ${slideId}`);
    }
    res.status(StatusCodes.OK).json({slide});
}
const updateSlide = async (req, res) => {
    const {id: slideId} = req.params;
    const {title, subtitle, isShow} = req.body;
    if(!title || !subtitle || isShow===undefined){
        throw new CustomError.BadRequestError("Please provide title, subtitle, and isShow fields");
    }
    const slide = await Slide.findOne({_id: slideId});
    if(!slide){
        throw new CustomError.NotFoundError(`No slide with id: ${slideId}`);
    }
    slide.title = title;
    slide.subtitle = subtitle;
    slide.isShow = isShow;
    await slide.save();
    res.status(StatusCodes.OK).json({slide});
}
const deleteSlide = async (req, res) => {
    const {id: slideId} = req.params;
    const slide = await Slide.findOne({_id: slideId});
    if(!slide){
        throw new CustomError.NotFoundError(`No slide with id: ${slideId}`);
    }
    await slide.remove();
    res.status(StatusCodes.OK).json({msg: "Success! Slide removed."});
}

module.exports = {
    createSlide,
    getAllSlide,
    adminGetAllSlide,
    getSingleSlide,
    updateSlide,
    deleteSlide
}
