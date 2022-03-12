const User = require('../models/User');
const Token = require('../models/Token');
const {StatusCodes} = require('http-status-codes');
const {createTokenUser, attachCookiesToResponse, createJWT} = require('../utils');
const CustomError = require('../errors');
const crypto = require('crypto');


const register = async (req, res) => {
    // delet all user
    // const user = await User.deleteMany({});
    // res.status(StatusCodes.OK).json({user});
    
    const {name, email, password} = req.body;
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
    // first registerd user is an admin
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? "admin":"user";
    const user = await User.create({name, email, password, role});


    const refreshToken = crypto.randomBytes(40).toString('hex');
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;
    const userToken = {refreshToken, ip, userAgent, user: user._id};
    await Token.create(userToken);

    const tokenUser = createTokenUser(user);


    attachCookiesToResponse({res, user:tokenUser, refreshToken});
    res.status(StatusCodes.OK).json({tokenUser});
}
const login = async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        throw new CustomError.BadRequestError('Please provide email and password');
    }
    const user = await User.findOne({email});
    if(!user){
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    if(!user.isActive){
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    if(user.googleId || user.facebookId){
        throw new CustomError.BadRequestError("Invalid Credentials");
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    const tokenUser = createTokenUser(user);
    const existingToken = await Token.findOne({user: user._id});
    if(existingToken){
        if(!existingToken.isValid){
            throw new CustomError.BadRequestError("Invalid Credentials");
        }
        attachCookiesToResponse({res, user:tokenUser, refreshToken: existingToken.refreshToken});
        return res.status(StatusCodes.OK).json({user:tokenUser});
    }

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;
    const token = {refreshToken, ip, userAgent, user: user._id};

    await Token.create(token);

    attachCookiesToResponse({res, user:tokenUser, refreshToken});

    res.status(StatusCodes.OK).json({user:tokenUser});

}
const googleLogin = (req, res) => {
    const protocol = req.headers['x-forwarded-proto'];
    const host = req.headers['x-forwarded-host'];
    const origin = `${protocol}://${host}`;
    if(req.user==="error"){
        res.cookie('wsbToken', 'logout', {
            httpOnly: true,
            expires: new Date(Date.now())
        });
        res.redirect(`${origin}/signin`);
    }else{
        const tokenUser = createTokenUser(req.user);
        const token = createJWT({payload: tokenUser});
        res.redirect(`${origin}/send-token?token=${token}`);
    }
}
const facebookLogin = (req, res) => {
    const protocol = req.headers['x-forwarded-proto'];
    const host = req.headers['x-forwarded-host'];
    const origin = `${protocol}://${host}`;
    if(req.user==="error"){
        res.cookie('wsbToken', 'logout', {
            httpOnly: true,
            expires: new Date(Date.now())
        });
        res.redirect(`${origin}/signin`);
    }else{
        const tokenUser = createTokenUser(req.user);
        const token = createJWT({payload: tokenUser});
        res.redirect(`${origin}/send-token?token=${token}`);
    }
}
const logout = async (req, res) => {
    await Token.findOneAndDelete({user: req.user.userId});

    res.cookie('accessToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    });
    res.cookie('refreshToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    });
    res.status(StatusCodes.OK).json({msg: 'User logged out!'});
}

module.exports = {
    register,
    login,
    logout,
    googleLogin,
    facebookLogin
}