const express = require('express');
const passport = require('passport');
const router = express.Router();
const {
    register,
    login,
    logout,
    googleLogin,
    facebookLogin
} = require('../controllers/authController');


router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

router.get('/google', passport.authenticate('google', {scope: ['profile', 'email'], session: false}));
router.get('/google/callback', passport.authenticate('google', {session: false, failureRedirect: `${process.env.DOMAIN_FRONT_END}/login`}), googleLogin);

router.get('/facebook', passport.authenticate('facebook', {scope: ['public_profile'], session: false}));
router.get('/facebook/callback', passport.authenticate('facebook', {session: false, failureRedirect: `${process.env.DOMAIN_FRONT_END}/login`}), facebookLogin);



module.exports = router;