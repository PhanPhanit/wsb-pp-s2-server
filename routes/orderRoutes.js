const express = require('express');
const router = express.Router();

const {
    createOrder,
    getAllOrder,
    getSingleOrder,
    getCurrentUserOrder,
    updateOrder
} = require('../controllers/orderController');

const {
    authenticationUser,
    authorizePermissions
} = require('../middleware/authentication');


router.route('/')
    .get(authenticationUser, authorizePermissions('admin', 'manager'), getAllOrder)
    .post(authenticationUser, createOrder);

router.route('/show-all-my-order').get(authenticationUser, getCurrentUserOrder);

router.route('/:id')
    .get(authenticationUser, getSingleOrder)
    .patch(authenticationUser, authorizePermissions('admin', 'manager'), updateOrder)


module.exports = router;