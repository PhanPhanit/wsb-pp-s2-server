const express = require('express');
const router = express.Router();

const {
    uploadImageLocal,
    uploadImageCloud
} = require('../controllers/uploadFileController')

router.post('/upload-local', uploadImageLocal);
router.post('/upload-cloud', uploadImageCloud);



module.exports = router;