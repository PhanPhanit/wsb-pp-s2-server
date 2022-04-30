const Token = require('../models/Token');
const User = require('../models/User');
const CustomError = require('../errors');
const {isTokenValid} = require('../utils');
const {attachCookiesToResponse, createTokenUser} = require('../utils');

const authenticationUser = async (req, res, next) => {
    const {refreshToken, accessToken} = req.signedCookies;
    try {
        if(accessToken){
            const payload = isTokenValid(accessToken);
            const existingToken = await Token.findOne({user: payload.user.userId});
            if(!existingToken || !existingToken?.isValid){
                throw new CustomError.UnauthenticatedError('Authentication Invalid');
            }
            const {userId} = payload.user;
            const user = await User.findOne({_id: userId}).lean();
            if(!user.isActive){
                throw new CustomError.UnauthenticatedError('Authentication Invalid');
            }
            let tokenUser = createTokenUser(user);
            tokenUser =  JSON.parse(JSON.stringify(tokenUser));
            req.user = tokenUser;
            return next();
        }
        const payload = isTokenValid(refreshToken);
        const existingToken = await Token.findOne({
            user: payload.user.userId,
            refreshToken: payload.refreshToken
        });
        if(!existingToken || !existingToken?.isValid){
            throw new CustomError.UnauthenticatedError('Authentication Invalid');
        }
        const {userId} = payload.user;
        const user = await User.findOne({_id: userId}).lean();
        if(!user.isActive){
            throw new CustomError.UnauthenticatedError('Authentication Invalid');
        }
        let tokenUser = createTokenUser(user);
        tokenUser =  JSON.parse(JSON.stringify(tokenUser));
        // attact access token
        attachCookiesToResponse({res, user: tokenUser, refreshToken: existingToken.refreshToken});
        req.user = tokenUser;
        next();
    } catch (error) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }
}


const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            throw new CustomError.UnauthenticatedError('Unauthorized to access this route');
        }
        next();
    }
}

module.exports = {
    authenticationUser,
    authorizePermissions
}