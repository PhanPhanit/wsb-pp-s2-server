const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    adminGetAllProducts,
    getSingleProduct,
    updateProduct,
    increaseViewProduct,
    deleteProduct,
    adminGetSingleProduct
} = require('../controllers/productController')
const {authenticationUser, authorizePermissions} = require('../middleware/authentication');


router.route('/')
    .get(getAllProducts)
    .post(authenticationUser, authorizePermissions('manager', 'admin'), createProduct);
router.route('/increase-view/:id').get(increaseViewProduct);
router.route('/all').get(authenticationUser, authorizePermissions('manager', 'admin'), adminGetAllProducts);
router.route('/:id/admin').get(authenticationUser, authorizePermissions('manager', 'admin'), adminGetSingleProduct);

router.route('/:id')
    .get(getSingleProduct)
    .patch(authenticationUser, authorizePermissions('manager', 'admin'), updateProduct)
    .delete(authenticationUser, authorizePermissions('manager', 'admin'), deleteProduct)



module.exports = router;