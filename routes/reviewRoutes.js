const express = require('express');
const router = express.Router();
const {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    starPercent
} = require('../controllers/reviewController');
const {authenticationUser} = require('../middleware/authentication')



router.route('/')
    .get(getAllReviews)
    .post(authenticationUser, createReview);

router.route('/star-percent/:id').get(starPercent);

router.route('/:id')
    .get(getSingleReview)
    .patch(authenticationUser ,updateReview)
    .delete(authenticationUser, deleteReview);



module.exports = router;