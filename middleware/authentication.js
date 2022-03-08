const Token = require('../models/Token');
const CustomError = require('../errors');
const {isTokenValid} = require('../utils');
const {attachCookiesToResponse} = require('../utils');

const authenticationUser = async (req, res, next) => {
    const {refreshToken, accessToken} = req.signedCookies;
    try {

        if(accessToken){
            const payload = isTokenValid(accessToken);
            req.user = payload.user;
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
        // attact access token
        attachCookiesToResponse({res, user: payload.user, refreshToken: existingToken.refreshToken});
        req.user = payload.user;
        next();








        // const {userId, name, role, isActive, email, facebookId, googleId} = isTokenValid({token});
        // if(!isActive){
        //     throw new CustomError.UnauthenticatedError('Authentication Invalid');
        // }
        // req.user = {name, userId, role, email, facebookId, googleId};
        // next();
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