const express = require('express');
const router = express.Router();

const {
    createSlide,
    getAllSlide,
    adminGetAllSlide,
    getSingleSlide,
    updateSlide,
    deleteSlide
} = require('../controllers/slideController');

const {
    authenticationUser,
    authorizePermissions
} = require('../middleware/authentication');


router.route('/')
    .post(authenticationUser, authorizePermissions('admin', 'manager'), createSlide)
    .get(getAllSlide)

router.route('/admin').get(authenticationUser, authorizePermissions('admin', 'manager'), adminGetAllSlide);

router.route('/:id')
    .get(authenticationUser, authorizePermissions('admin', 'manager'), getSingleSlide)
    .patch(authenticationUser, authorizePermissions('admin', 'manager'), updateSlide)
    .delete(authenticationUser, authorizePermissions('admin', 'manager'), deleteSlide);



module.exports = router;