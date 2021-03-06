const User = require('../models/User');
const Token = require('../models/Token');
const {StatusCodes} = require('http-status-codes');
const {createTokenUser, attachCookiesToResponse, createHash, createJWTWithExp, sendResetPasswordEmail} = require('../utils');
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
    res.status(StatusCodes.OK).json({user: tokenUser});
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

    const origin = process.env.DOMAIN_FRONT_END;
    if(req.user==="error"){
        res.redirect(`${origin}/signin`);
    }else{
        const token = createJWTWithExp({payload: req.user.toJSON()});
        res.redirect(`${origin}/send-token?token=${token}`);
    }
}
const facebookLogin = (req, res) => {
    const origin = process.env.DOMAIN_FRONT_END;
    if(req.user==="error"){
        res.redirect(`${origin}/signin`);
    }else{
        const token = createJWTWithExp({payload: req.user.toJSON()});
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

const forgotPassword = async (req, res) => {
    const {email} = req.body;
    if(!email){
      throw new CustomError.BadRequestError('Please provide valid email');
    }
    const user = await User.findOne({email});
    if(user.googleId || user.facebookId){
        return res.status(StatusCodes.OK).json({msg: "Please check your email for reset password link"});
    }
    if(user){
      const passwordToken = crypto.randomBytes(70).toString('hex');
      // send email
      const origin = process.env.DOMAIN_FRONT_END;
      await sendResetPasswordEmail({name: user.name, email: user.email, token:passwordToken,origin});
      const tenMinutes = 1000 * 60 * 10;
      const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
      user.passwordToken = createHash(passwordToken);
      user.passwordTokenExpirationDate = passwordTokenExpirationDate;
      await user.save();
    }
    res.status(StatusCodes.OK).json({msg: "Please check your email for reset password link"});
  }
  const resetPassword = async (req, res) => {
    const {token, email, password} = req.body;
    if(!token || !email || !password){
      throw new CustomError.BadRequestError('Please provide all values');
    }
    const user = await User.findOne({email});
    if(user.googleId || user.facebookId){
        return res.status(StatusCodes.OK).json({msg: "Reset password"});
    }
    if(user){
      const currentDate = new Date();
      if(user.passwordToken === createHash(token) && user.passwordTokenExpirationDate > currentDate){
        user.password = password;
        user.passwordToken = null;
        user.passwordTokenExpirationDate = null;
        await user.save();
      }
    }
    res.status(StatusCodes.OK).json({msg: "Reset password"});
  }

module.exports = {
    register,
    login,
    logout,
    googleLogin,
    facebookLogin,
    forgotPassword,
    resetPassword
}