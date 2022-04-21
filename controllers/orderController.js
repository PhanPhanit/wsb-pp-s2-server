const Order = require('../models/Order');
const Product = require('../models/Product');
const CustomError = require('../errors');
const {StatusCodes} = require('http-status-codes');
const checkPermissions = require('../utils/checkPermissions');
const mongoose = require('mongoose');

const createOrder = async (req, res) => {
    const {
        delivery,
        orderItem,
        paymentIntent,
        phoneNumber,
        city,
        address,
        orderDate
    } = req.body;
    if(!orderItem || orderItem.length < 1){
        throw new CustomError.BadRequestError("No order item provided");
    }
    if(!delivery){
        throw new CustomError.BadRequestError("Please provide tax shipping fee");
    }
    if(!paymentIntent){
        throw new CustomError.BadRequestError("Please provide payment intent");
    }
    let items = [];
    let subtotal = 0;

    for(const item of orderItem){
        const productExist = await Product.findOne({_id: item.product});
        if(!productExist){
            throw new CustomError.NotFoundError(`No product with id: ${item.product}`);
        }
        const {name, price, discount, _id} = productExist;
        const singleOrderItem = {
            name,
            image: item.image,
            price,
            discount,
            quantity: item.quantity,
            product: _id
        }
        items = [...items, singleOrderItem];
        subtotal += (price - discount) * item.quantity;
    }
    subtotal = subtotal.toFixed(2);
    const total = Number(subtotal) + Number(delivery);

    const order = await Order.create({
        delivery,
        subtotal,
        total,
        user: req.user.userId,
        paymentIntent,
        phoneNumber,
        city,
        address,
        orderDate,
        orderItem: items
    });

    const orderWithUser = await Order.find({_id: order._id}).populate({path: "user", select: "-password"});

    res.status(StatusCodes.CREATED).json({order: orderWithUser});
}
const getAllOrder = async (req, res) => {
    // const {id, sort, status, user} = req.query;
    // let queryObject = {};
    // let result = Order;
    // if(id){
    //     queryObject._id = id;
    // }
    // if(status){
    //     queryObject.status = status;
    // }
    // if(user){
    //     queryObject.user = user;
    // }
    // result = result.find(queryObject);
    // if(sort){
    //     result = result.sort(sort);
    // }
    // const totalOrder = await Order.countDocuments(queryObject);
    // const page = Number(req.query.page) || 1;
    // const limit = Number(req.query.limit) || 10;
    // const skip = (page - 1) * limit;
    // const totalPage = Math.ceil(totalOrder / limit);
    // const order = await result.skip(skip).limit(limit).populate({path: 'user', select: '-password'});
    // res.status(StatusCodes.OK).json({order, count: order.length, currentPage:page, totalPage, totalOrder})

    const {id, sort, status, user, search} = req.query;
    let queryObject = {
        $and: [
            {
                $or: [
                    {status: new RegExp('', 'i')}
                ]
            }
        ]
    };
    let result = Order;
    if(search){
        let regex = new RegExp(search,'i');
        let orQuery = [
            {_id: mongoose.Types.ObjectId.isValid(search)?mongoose.Types.ObjectId(search):null},
            {status: regex },
            {paymentIntent: regex},
            {phoneNumber: regex},
            {city: regex},
            {address: regex}
        ];
        queryObject.$and[0].$or = orQuery;
    }
    if(id){
        if(mongoose.Types.ObjectId.isValid(id)){
            queryObject.$and.push({
                _id: mongoose.Types.ObjectId(id)
            });
        }
    }
    if(status){
        queryObject.$and.push({
            status: {
                $regex: status,
                $options: "i"
            }
        });
    }
    if(user){
        if(mongoose.Types.ObjectId.isValid(user)){
            queryObject.$and.push({
                user: mongoose.Types.ObjectId(user)
            });
        }
    }
    result = result.find(queryObject);
    if(sort){
        result = result.sort(sort);
    }
    const totalOrder = await Order.countDocuments(queryObject);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalPage = Math.ceil(totalOrder / limit);
    const order = await result.skip(skip).limit(limit).populate({path: 'user', select: '-password'});
    res.status(StatusCodes.OK).json({order, count: order.length, currentPage:page, totalPage, totalOrder})
}
const getSingleOrder = async (req, res) => {
    const {id: orderId} = req.params;
    const order = await Order.findOne({_id: orderId});
    if(!order){
        throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
    }
    checkPermissions(req.user, order.user);
    res.status(StatusCodes.OK).json({order});
}
const getCurrentUserOrder = async (req, res) => {
    const {id, status, user} = req.query;
    let queryObject = {
        user: req.user.userId
    };
    let result = Order;
    if(id){
        queryObject._id = id;
    }
    if(status){
        queryObject.status = status;
    }
    if(user){
        queryObject.user = user;
    }
    result = result.find(queryObject).sort('-createdAt');
    const totalOrder = await Order.countDocuments(queryObject);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalPage = Math.ceil(totalOrder / limit);
    const order = await result.skip(skip).limit(limit).populate({path: 'user', select: '-password'});
    res.status(StatusCodes.OK).json({order, count: order.length, currentPage:page, totalPage, totalOrder});
}
const updateOrder = async (req, res) => {
    const {id: orderId} = req.params;
    const {status} = req.body;
    if(!status){
        throw new CustomError.BadRequestError('The status field required!');
    }
    const order = await Order.findOne({_id: orderId}).populate({path: 'user', select: '-password'});
    if(!order){
        throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
    }
    order.status = status;
    await order.save();
    res.status(StatusCodes.OK).json({order});
}

const getTotalOrder = async (req, res) => {
    const {status, user} = req.query;
    let queryObject = {};
    if(status){
        queryObject.status = status;
    }
    if(user){
        queryObject.user = user;
    }
    const totalOrder = await Order.countDocuments(queryObject);
    res.status(StatusCodes.OK).json({totalOrder});
}

const getTotalPrice = async (req, res) => {
    const {status, user} = req.query;
    let queryObject = {};
    if(status){
        queryObject.status = status;
    }
    if(user){
        queryObject.user = user;
    }
    const orderTotalPrice = await Order.aggregate([
        {
          '$match': queryObject
        },
        {
          '$group': {
            '_id': null, 
            'totalPrice': {
              '$sum': '$total'
            }
          }
        }
    ]);
    const totalPrice = orderTotalPrice[0]?orderTotalPrice[0].totalPrice:0;
    res.status(StatusCodes.OK).json({totalPrice});
}


module.exports = {
    createOrder,
    getAllOrder,
    getSingleOrder,
    getCurrentUserOrder,
    updateOrder,
    getTotalOrder,
    getTotalPrice
}