const Product = require('../models/Product');
const Category = require('../models/Category');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const mongoose = require('mongoose');


const createProduct = async (req, res) => {
    const {category: categoryId} = req.body;
    if(!categoryId){
        throw new CustomError.BadRequestError("Please provide category");
    }
    // check category exist
    const isCategoryExist = await Category.findOne({_id: categoryId});
    if(!isCategoryExist){
        throw new CustomError.NotFoundError(`No category with id: ${categoryId}`);
    }
    req.body.user = req.user.userId;
    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json({product});

    // create product mutiple
    // for(let i=1; i<=100; i++){
    //     const data = {
    //         name: `Product ${i}`,
    //         price: 29.99,
    //         discount: 10,
    //         author: "Transi Ated",
    //         publisher: "Jim Date (Narrator), Pottermore Publishing",
    //         genre: "Fansty",
    //         language: "English",
    //         country: "United Kingdom",
    //         published: "Semtember 22, 2001",
    //         description: "Lorem ipsum dolor sit amet consectetur adipiscing elit, dui curabitur lectus ullamcorper cras placerat taciti justo, libero conubia eleifend maecenas arcu eu",
    //         image: [
    //             "example.jpg",
    //             "example1.png",
    //             "example2.jpg"
    //         ],
    //         category: "61c038e2921d73f2f9a447aa",
    //         user: req.user.userId
    //     }
    //     await Product.create(data);
    // }
    // res.send("success");

    // delete all
    // await Product.deleteMany({})
    // res.send("success");
}

const getAllProducts = async (req, res) => {
    const {id, name, category, sort, populate, search} = req.query;
    let queryObject = {
        $and: [
            {
                $or: [
                    {name: new RegExp('', 'i')}
                ]
            },
            {isShow: true}
        ]
    };
    let result = Product;
    if(search){
        const productObjectId = mongoose.Types.ObjectId.isValid(search)?mongoose.Types.ObjectId(search):null;
        let regex = new RegExp(search,'i');
        let orQuery = [
            {_id: productObjectId},
            {name: regex },
            {author: regex},
            {publisher: regex},
            {language: regex},
            {country: regex},
            {published: regex},
            {description: regex},
        ];
        queryObject.$and[0].$or = orQuery;
    }
    if(name){
        queryObject.$and.push({
            name: {
                $regex: name,
                $options: "i"
            }
        });
    }
    if(category){
        if(mongoose.Types.ObjectId.isValid(category)){
            queryObject.$and.push({
                category: mongoose.Types.ObjectId(category)
            });
        }
    }
    if(id){
        if(mongoose.Types.ObjectId.isValid(id)){
            queryObject.$and.push({
                _id: mongoose.Types.ObjectId(id)
            });
        }
    }
    result = result.find(queryObject);
    if(populate){
        result = result.populate({path: populate, select: '-password'});
    }
    if(sort){
        result = result.sort(sort);
    }
    const totalProduct = await Product.countDocuments(queryObject);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalPage = Math.ceil(totalProduct / limit);
    const product = await result.skip(skip).limit(limit);
    res.status(StatusCodes.OK).json({product, count: product.length, currentPage:page, totalPage, totalProduct})
}

const adminGetAllProducts = async (req, res) => {
    const {id, name, category, sort, populate, search, isShow='all'} = req.query;
    let queryObject = {
        $and: [
            {
                $or: [
                    {name: new RegExp('', 'i')}
                ]
            }
        ]
    };
    let result = Product;
    if(search){
        let regex = new RegExp(search,'i');
        let orQuery = [
            {_id: mongoose.Types.ObjectId.isValid(search)?mongoose.Types.ObjectId(search):null},
            {name: regex },
            {author: regex},
            {publisher: regex},
            {language: regex},
            {country: regex},
            {published: regex},
            {description: regex},
            {category: mongoose.Types.ObjectId.isValid(search)?mongoose.Types.ObjectId(search):null}
        ];
        queryObject.$and[0].$or = orQuery;
        if(search==='true' || search==='false'){
            const isShow = search==='true'?true:false;
            queryObject.$and[0].$or.push({isShow});
        }
    }
    if(name){
        queryObject.$and.push({
            name: {
                $regex: name,
                $options: "i"
            }
        });
    }
    if(category){
        if(mongoose.Types.ObjectId.isValid(category)){
            queryObject.$and.push({
                category: mongoose.Types.ObjectId(category)
            });
        }
    }
    if(id){
        if(mongoose.Types.ObjectId.isValid(id)){
            queryObject.$and.push({
                _id: mongoose.Types.ObjectId(id)
            });
        }
    }
    if(isShow!=='all' && isShow!==''){
        queryObject.$and.push({
            isShow: isShow==='true'?true:false
        });
    }
    result = result.find(queryObject);
    if(populate){
        result = result.populate({path: populate, select: '-password'});
    }
    if(sort){
        result = result.sort(sort);
    }
    const totalProduct = await Product.countDocuments(queryObject);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalPage = Math.ceil(totalProduct / limit);
    const product = await result.skip(skip).limit(limit);
    res.status(StatusCodes.OK).json({product, count: product.length, currentPage:page, totalPage, totalProduct})
}
const getSingleProduct = async (req, res) => {
    const {id: productId} = req.params;
    const product = await Product.findOne({_id: productId, isShow: true});
    if(!product){
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }
    res.status(StatusCodes.OK).json({product});
}
const adminGetSingleProduct = async (req, res) => {
    const {id: productId} = req.params;
    const product = await Product.findOne({_id: productId});
    if(!product){
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }
    res.status(StatusCodes.OK).json({product});
}
const updateProduct = async (req, res) => {
    const {id: productId} = req.params;
    const product = await Product.findOneAndUpdate({_id: productId}, req.body, {new: true, runValidators: true});
    if(!product){
        throw new CustomError.NotFoundError(`No product width id : ${productId}`);
    }
    res.status(StatusCodes.OK).json({product});
}
const increaseViewProduct = async (req, res) => {
    const {id: productId} = req.params;
    const product = await Product.findOne({_id: productId});
    if(!product){
        throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }
    const increaseView = product.views + 1;
    product.views = increaseView;
    await product.save();
    res.status(StatusCodes.OK).json({msg: "Increase view successfully."})
}
const deleteProduct = async (req, res) => {
    const {id: productId} = req.params;
    const product = await Product.findOne({_id: productId});
    if(!product){
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }
    await product.remove();
    res.status(StatusCodes.OK).json({msg: "Product has been deleted"});
}

module.exports = {
    createProduct,
    getAllProducts,
    adminGetAllProducts,
    getSingleProduct,
    updateProduct,
    increaseViewProduct,
    deleteProduct,
    adminGetSingleProduct,
}