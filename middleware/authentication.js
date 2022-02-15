const CustomError = require('../errors');
const {isTokenValid} = require('../utils');

const authenticationUser = async (req, res, next) => {
    const token = req.signedCookies.wsbToken;
    if(!token){
        throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }
    try {
        const {userId, name, role, isActive, email} = isTokenValid({token});
        if(!isActive){
            throw new CustomError.UnauthenticatedError('Authentication Invalid');
        }
        req.user = {name, userId, role, email};
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