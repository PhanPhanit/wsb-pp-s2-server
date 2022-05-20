const User = require('../models/User');
const Token = require('../models/Token');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const checkPermissions = require('../utils/checkPermissions');
const { createTokenUser, attachCookiesToResponse } = require('../utils');
const mongoose = require('mongoose');

const createUser = async (req, res) => {
    const {name, email, password, role='user', isActive=true} = req.body;
    if(!name || !password){
        throw new CustomError.BadRequestError("Please provide all value!");
    }
    // valid email
    const emailRegex = /^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/;
    const isEmailMatch = email.match(emailRegex);
    if(!isEmailMatch){
        throw new CustomError.BadRequestError("Email plovided not valid");
    }
    // check email exist
    const isEmailExist = await User.findOne({email});
    if(isEmailExist){
        throw new CustomError.BadRequestError("Email is already exist");
    }
    // const role = isFirstAccount ? "admin":"user";
    const user = await User.create({name, email, password, role, isActive});
    let tempUser = JSON.parse(JSON.stringify(user));
    delete tempUser.password;
    res.status(StatusCodes.CREATED).json({user: tempUser});
}
const getAllUser = async (req, res) => {
    const {id, name, email, isActive='all', role, sort, search} = req.query;
    let queryObject = {
        $and: [
            {
                $or: [
                    {name: new RegExp('', 'i')}
                ]
            }
        ]
    };
    let result = User;
    if(search){
        let regex = new RegExp(search,'i');
        let orQuery = [
            {_id: mongoose.Types.ObjectId.isValid(search)?mongoose.Types.ObjectId(search):null},
            {name: regex },
            {role: regex},
            {email: regex},
            {facebookId: regex},
            {googleId: regex}
        ];
        queryObject.$and[0].$or = orQuery;
        if(search==='true' || search==='false'){
            const isActive = search==='true'?true:false;
            queryObject.$and[0].$or.push({isActive});
        }
    }
    if(id){
        if(mongoose.Types.ObjectId.isValid(id)){
            queryObject.$and.push({
                _id: mongoose.Types.ObjectId(id)
            });
        }
    }
    if(name){
        queryObject.$and.push({
            name: {
                $regex: name,
                $options: "i"
            }
        });
    }
    if(email){
        queryObject.$and.push({
            email: {
                $regex: email,
                $options: "i"
            }
        });
    }
    if(isActive!=='all' && isActive!==''){
        queryObject.$and.push({
            isActive: isActive==='true'?true:false
        });
    }
    if(role){
        queryObject.$and.push({
            role
        });
    }
    result = result.find(queryObject);
    if(sort){
        result = result.sort(sort);
    }
    const totalUser = await User.countDocuments(queryObject);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalPage = Math.ceil(totalUser / limit);
    const user = await result.skip(skip).limit(limit).select('-password -passwordToken -passwordTokenExpirationDate');
    res.status(StatusCodes.OK).json({user, count: user.length, currentPage: page, totalPage, totalUser});

}
const getSingleUser = async (req, res) => {
    const {id} = req.params;
    const user = await User.findOne({_id: id}).select('-password -passwordToken -passwordTokenExpirationDate');
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
    if(req.user.email !== email){
        const emailAlreadyExist = await User.findOne({email});
        if(emailAlreadyExist){
            throw new CustomError.BadRequestError("Email is already exist");
        }
    }
    const user = await User.findOne({_id: req.user.userId});
    if(user.googleId || user.facebookId){
        throw new CustomError.BadRequestError("Can't update!");
    }
    user.name = name;
    user.email = email;
    await user.save();
    const tokenUser = createTokenUser(user);
    const token = await Token.findOne({user: user._id});
    attachCookiesToResponse({res, user:tokenUser, refreshToken: token.refreshToken});
    res.status(StatusCodes.OK).json({user:tokenUser});
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
    const user = await User.findOne({_id:userId}).select('-password -passwordToken -passwordTokenExpirationDate');
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
    return res.status(StatusCodes.OK).json({user});
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
const countAllUser = async (req, res) => {
    const {role, isActive='all'} = req.query;
    let queryObject = {};
    if(role){
        queryObject.role = role;
    }
    if(isActive!=='all' && isActive!==''){
        queryObject.isActive = isActive==='true'?true:false;
    }
    const totalUser = await User.countDocuments(queryObject);
    return res.status(StatusCodes.OK).json({totalUser});
}
const deleteUser = async (req, res) => {
    const {id: userId} = req.params;
    const user = await User.findOne({_id: userId});
    if(!user){
        throw new CustomError.NotFoundError(`No user with id : ${userId}`);
    }
    await user.remove();
    res.status(StatusCodes.OK).json({msg: "User has been deleted"});
}

module.exports = {
    getAllUser,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUser,
    updateUserPassword,
    adminUpdateUser,
    countAllUser,
    createUser,
    deleteUser
}