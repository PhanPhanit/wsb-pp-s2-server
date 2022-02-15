const User = require('../models/User');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const checkPermissions = require('../utils/checkPermissions');
const { createTokenUser } = require('../utils');



const getAllUser = async (req, res) => {
    const user = await User.find(req.query).select('-password');
    res.status(StatusCodes.OK).json({user, count: user.length});
}
const getSingleUser = async (req, res) => {
    const {id} = req.params;
    const user = await User.findOne({_id: id}).select('-password');
    if(!user){
        throw new CustomError.NotFoundError(`No user width id : ${id}`);
    }
    checkPermissions(req.user, user._id);
    res.status(StatusCodes.OK).json({user});
}
const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({user: req.user});
}
const updateUser = async (req, res) => {
    const {email, name} = req.body;
    if(!email || !name){
        throw new CustomError.BadRequestError("Please provide name and email.");
    }
    const emailAlreadyExist = await User.findOne({email});
    if(emailAlreadyExist){
        throw new CustomError.BadRequestError("Email is already exist");
    }
    const user = await User.findOne({_id: req.user.userId});
    if(user.googleId || user.facebookId){
        throw new CustomError.BadRequestError("Can't update!");
    }
    user.name = name;
    user.email = email;
    await user.save();
    res.status(StatusCodes.OK).json({user});
}
const adminUpdateUser = async (req, res) => {
    const {id: userId} = req.params;
    const {name, email, role, isActive=false} = req.body;
    if(!name || !email || !role){
        throw new CustomError.BadRequestError("Please provide all fields");
    }
    // check email exist

    const isEmailExist = await User.findOne({email});
    if(isEmailExist){
        const currenUser = await User.findOne({_id: userId});
        if(email!==currenUser.email){
            throw new CustomError.BadRequestError("Email is already exist");
        }
    }

    const user = await User.findOne({_id:userId});
    if(!user){
        throw new CustomError.NotFoundError(`No user width id : ${userId}`);
    }
    if(user.googleId || user.facebookId){
        user.isActive = isActive;
    }else{
        user.name = name;
        user.email = email;
        user.role = role;
        user.isActive = isActive;
    }
    await user.save();
    const tokenUser = createTokenUser(user);
    return res.status(StatusCodes.OK).json({user: tokenUser});
}
const updateUserPassword = async (req, res) => {
    const {oldPassword, newPassword} = req.body;
    if(!oldPassword || !newPassword){
        throw new CustomError.BadRequestError("Please provide all value");
    }
    const user = await User.findOne({_id: req.user.userId});
    if(user.googleId || user.facebookId){
        throw new CustomError.BadRequestError("Can't update password!");
    }
    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }
    user.password = newPassword;
    await user.save();
    res.status(StatusCodes.OK).json({msg: "Success! Password Updated."});
}


module.exports = {
    getAllUser,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUser,
    updateUserPassword,
    adminUpdateUser
}