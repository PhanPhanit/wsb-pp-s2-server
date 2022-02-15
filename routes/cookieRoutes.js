const express = require('express');
const {createCookie} = require('../controllers/cookieController');
const router = express.Router();

router.post('/', createCookie);

module.exports = router;