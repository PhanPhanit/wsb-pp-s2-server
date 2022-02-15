const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const uploadImageLocal = async (req, res) => {
    if(!req.files || Object.keys(req.files).length === 0){
        throw new CustomError.BadRequestError('No File Uploaded');
    }
    const images = req.files.images;
    let allImagePath = [];
    if(images instanceof Array){
        images.forEach(image=>{
            if(!image.mimetype.startsWith('image')){
                throw new CustomError.BadRequestError('Please upload image');
            }
        })
        for(const image of images){
            const imageName = Date.now() + Math.ceil(Math.random()*100000) + "-" + image.name;
            const imagePath = path.join(__dirname, '../public/uploads/' + `${imageName}`);
            await image.mv(imagePath);
            allImagePath = [...allImagePath, imageName];
        }
    }else{
        if(!images.mimetype.startsWith('image')){
            throw new CustomError.BadRequestError('Please upload image');
        }
        const imageName = Date.now() + Math.ceil(Math.random()*100000) + "-" + images.name;
        const imagePath = path.join(__dirname, '../public/uploads/' + `${imageName}`);
        await images.mv(imagePath);
        allImagePath = [...allImagePath, imageName];
    }
    res.status(StatusCodes.OK).json({img: allImagePath});
}

const uploadImageCloud = async (req, res) => {
    if(!req.files || Object.keys(req.files).length === 0){
        throw new CustomError.BadRequestError('No File Uploaded');
    }
    const images = req.files.images;
    let allImagePath = [];
    if(images instanceof Array){
        for(let i=0;i<images.length;i++){
            const result = await cloudinary.uploader.upload(req.files.images[i].tempFilePath, {
                use_filename: true,
                folder: 'wsb-photo'
            });
            fs.unlinkSync(req.files.images[i].tempFilePath);
            allImagePath = [...allImagePath, result.secure_url]
        }
    }else{
        const result = await cloudinary.uploader.upload(req.files.images.tempFilePath, {
            use_filename: true,
            folder: 'wsb-photo'
        });
        fs.unlinkSync(req.files.images.tempFilePath);
        allImagePath = [...allImagePath, result.secure_url]
    }
    res.status(StatusCodes.OK).json({images: allImagePath});
}

module.exports = {
    uploadImageLocal,
    uploadImageCloud
}