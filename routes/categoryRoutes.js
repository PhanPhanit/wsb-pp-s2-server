const express = require('express');
const router = express.Router();
const {
    createCategory,
    getAllCategory,
    updateCategory,
    deleteCategory,
    adminGetAllCategory
} = require('../controllers/categoryController');
const {
    authenticationUser,
    authorizePermissions
} = require('../middleware/authentication');


router.route('/')
    .post(authenticationUser, authorizePermissions('admin', 'manager'), createCategory)
    .get(getAllCategory);

router.route('/all').get(authenticationUser, authorizePermissions('admin', 'manager'), adminGetAllCategory);

router.route('/:id')
    .patch(authenticationUser, authorizePermissions('admin', 'manager'), updateCategory)
    .delete(authenticationUser, authorizePermissions('admin', 'manager'), deleteCategory);


module.exports = router;