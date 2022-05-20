const express = require('express');
const router = express.Router();
const {authenticationUser, authorizePermissions} = require('../middleware/authentication');
const {
    createUser,
    getAllUser,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword,
    adminUpdateUser,
    countAllUser,
    deleteUser
} = require('../controllers/userController');


router.route('/')
    .post(authenticationUser, authorizePermissions('admin'), createUser)
    .get(authenticationUser, authorizePermissions('admin'), getAllUser);
router.route('/showMe').get(authenticationUser, showCurrentUser);
router.route('/count-all-user').get(authenticationUser, authorizePermissions('admin', 'manager'), countAllUser);
router.route('/updateUser').patch(authenticationUser, updateUser);
router.route('/updateUserPassword').patch(authenticationUser, updateUserPassword);
router.route('/:id')
    .get(authenticationUser, getSingleUser)
    .patch(authenticationUser, authorizePermissions('admin'), adminUpdateUser)
    .delete(authenticationUser, authorizePermissions('admin'), deleteUser);


module.exports = router;