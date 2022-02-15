const CustomError = require('../errors');
const {cookiesResponse, isTokenValid} = require('../utils');
const {StatusCodes} = require('http-status-codes');
const createCookie = (req, res) => {
    const {token} = req.body;
    if(!token){
        throw new CustomError.BadRequestError("Please provide token");
    }
    try {
        const tokenValid = isTokenValid({token});
        const {userId, name, role, isActive, email} = tokenValid;
        cookiesResponse({res, token});
        return res.status(StatusCodes.OK).json({tokenUser: {userId, name, role, isActive, email}});
    } catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({msg: "Authentication Invalid"})
    }
}
module.exports = {
    createCookie
}