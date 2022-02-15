const Order = require('../models/Order');
const Product = require('../models/Product');
const CustomError = require('../errors');
const {StatusCodes} = require('http-status-codes');
const checkPermissions = require('../utils/checkPermissions');

const createOrder = async (req, res) => {
    const {delivery, orderItem} = req.body;
    if(!orderItem || orderItem.length < 1){
        throw new CustomError.BadRequestError("No order item provided");
    }
    if(!delivery){
        throw new CustomError.BadRequestError("Please provide tax shipping fee");
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
        orderItem: items
    });
    res.status(StatusCodes.CREATED).json({order});
}
const getAllOrder = async (req, res) => {
    const {_id, sort} = req.query;
    let queryObject = {};
    let result = Order;
    if(_id){
        queryObject._id = _id;
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
    const order = await result.skip(skip).limit(limit);
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
    const order = await Order.find({user: req.user.userId});
    res.status(StatusCodes.OK).json({order});
}
const updateOrder = async (req, res) => {
    const {id: orderId} = req.params;
    const {status} = req.body;
    const order = await Order.findOne({_id: orderId});
    if(!order){
        throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
    }
    // if(req.user.role!=='admin' && req.user.role!=='manager'){
    //     if(req.user.userId !== order.user.toString()){
    //         throw new CustomError.UnauthenticatedError('Not authorized to access this route');
    //     }else{
    //         order.status =
    //     }
    // }
    order.status = status;
    await order.save();
    res.status(StatusCodes.OK).json({order});
}


module.exports = {
    createOrder,
    getAllOrder,
    getSingleOrder,
    getCurrentUserOrder,
    updateOrder
}