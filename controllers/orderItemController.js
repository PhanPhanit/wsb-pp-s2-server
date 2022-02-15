const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const CustomError = require('../errors');
const {StatusCodes} = require('http-status-codes');
const checkPermissions = require('../utils/checkPermissions');

const createOrderItem = async (req, res) => {
    const {product: productId} = req.body;
    const isProductExist = await Product.findOne({_id: productId});
    if(!isProductExist){
        throw new CustomError.NotFoundError(`No prduct with id: ${productId}`);
    }
    const isAlreadyAdd = await OrderItem.findOne({product: productId, user: req.user.userId})
                                        .populate({path: 'product', select: 'name price discount author'});
    if(isAlreadyAdd){
        isAlreadyAdd.quantity += 1;
        await isAlreadyAdd.save();
        return res.status(StatusCodes.OK).json({orderItem: isAlreadyAdd});
    }else{
        req.body.user = req.user.userId;
        const orderItem = await OrderItem.create(req.body)
        const orderItemTemp = await OrderItem.findOne({_id: orderItem._id}).populate({path: 'product', select: 'name price discount author'});
        return res.status(StatusCodes.CREATED).json({orderItem: orderItemTemp});
    }
}
const getOrderItem = async (req, res) => {
    const {product: productId} = req.query;
    let objectQuery = {user: req.user.userId};
    if(productId){
        objectQuery.product = productId;
    }
    const orderItem = await OrderItem.find(objectQuery).populate({path: 'product', select: 'name price discount author'});
    res.status(StatusCodes.OK).json({orderItem, count: orderItem.length});
}
const getSingleOrderItem = async (req, res) => {
    const {id: orderItemId} = req.params;
    const orderItem = await OrderItem.findOne({_id: orderItemId}).populate({path: 'product', select: 'name price discount author'});
    if(!orderItem){
        throw new CustomError.NotFoundError(`No order item with id: ${orderItemId}`);
    }
    checkPermissions(req.user, orderItem.user);
    res.status(StatusCodes.OK).json({orderItem});
}
const updateOrderItem = async (req, res) => {
    const {id: orderItemId} = req.params;
    const {quantity} = req.body;
    if(!quantity){
        throw new CustomError.BadRequestError("Please provide quantity");
    }
    const orderItem = await OrderItem.findOne({_id: orderItemId}).populate({path: 'product', select: 'name price discount author'});
    if(!orderItem){
        throw new CustomError.NotFoundError(`No order item with id: ${orderItemId}`);
    }
    checkPermissions(req.user, orderItem.user);
    orderItem.quantity = quantity;
    await orderItem.save();
    res.status(StatusCodes.OK).json({orderItem});
}
const deleteOrderItem = async (req, res) => {
    const {id: orderItemId} = req.params;
    const orderItem = await OrderItem.findOne({_id: orderItemId});
    if(!orderItem){
        throw new CustomError.NotFoundError(`No order item with id: ${orderItem}`);
    }
    checkPermissions(req.user, orderItem.user);
    await orderItem.remove();
    res.status(StatusCodes.OK).json({msg: "Order item deleted"});
}
const deleteManyOrderItem = async (req, res) => {
    const orderItem = await OrderItem.deleteMany({user: req.user.userId});
    res.status(StatusCodes.OK).json({msg: "All order item deleted"});
}

module.exports = {
    createOrderItem,
    getOrderItem,
    getSingleOrderItem,
    updateOrderItem,
    deleteOrderItem,
    deleteManyOrderItem
}