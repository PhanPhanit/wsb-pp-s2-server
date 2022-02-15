const Category = require('../models/Category');
const CustomError = require('../errors');
const {StatusCodes} = require('http-status-codes');


const createCategory = async (req, res) => {
    req.body.user = req.user.userId;
    console.log(req.body);
    const category = await Category.create(req.body);
    res.status(StatusCodes.CREATED).json({category});
}
const getAllCategory = async (req, res) => {
    const {sort} = req.query;
    const queryObject = {isShow: true};
    let result = Category.find(queryObject);
    if(sort){
        result = result.sort(sort);
    }
    const category = await result;
    res.status(StatusCodes.OK).json({category, count: category.length});
}
const adminGetAllCategory = async (req, res) => {
    const {sort, name} = req.query;
    let objectQuery = {};
    if(name){
        objectQuery.name = {$regex: name, $options: "i"};
    }
    let result = Category.find(objectQuery);
    if(sort){
        result = result.sort(sort);
    }
    const category = await result;
    res.status(StatusCodes.OK).json({category, count: category.length});
}
const updateCategory = async (req, res) => {
    const {id: categoryId} = req.params;
    const {name, image, isShow=true} = req.body;
    if(!name || !image){
        throw new CustomError.BadRequestError("Please provide all value");
    }
    const category = await Category.findOne({_id: categoryId});
    if(!category){
        throw new CustomError.NotFoundError(`Not found category with id ${categoryId}`);
    }
    category.name = name;
    category.image = image;
    category.isShow = isShow;
    await category.save();
    res.status(StatusCodes.OK).json({category})
}
const deleteCategory = async (req, res) => {
    const {id: categoryId} = req.params;
    const category = await Category.findOne({_id: categoryId});
    if(!category){
        throw new CustomError.NotFoundError(`No category with id: ${categoryId}`);
    }
    await category.remove();
    res.status(StatusCodes.OK).json({msg: "Success! Product remove."});
}

module.exports = {
    createCategory,
    getAllCategory,
    updateCategory,
    deleteCategory,
    adminGetAllCategory
}