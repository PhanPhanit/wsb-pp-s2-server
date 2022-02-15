const express = require('express');
const router = express.Router();
const {
    createOrderItem,
    getOrderItem,
    getSingleOrderItem,
    updateOrderItem,
    deleteOrderItem,
    deleteManyOrderItem
} = require('../controllers/orderItemController');
const {authenticationUser} = require('../middleware/authentication');


router.route('/')
    .post(authenticationUser, createOrderItem)
    .get(authenticationUser, getOrderItem)
    .delete(authenticationUser, deleteManyOrderItem)

router.route('/:id')
    .get(authenticationUser, getSingleOrderItem)
    .patch(authenticationUser, updateOrderItem)
    .delete(authenticationUser, deleteOrderItem)


module.exports = router;