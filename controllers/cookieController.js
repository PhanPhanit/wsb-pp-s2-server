const Token = require('../models/Token');
const CustomError = require('../errors');
const {isTokenValid, attachCookiesToResponse, createTokenUser} = require('../utils');
const {StatusCodes} = require('http-status-codes');
const crypto = require('crypto');



const createCookie = async (req, res) => {

    const {token} = req.body;
    console.log(token);
    if(!token){
        throw new CustomError.BadRequestError("Please provide token");
    }
    try {
        const user = isTokenValid(token);
        const tokenUser = createTokenUser(user);
        const existingToken = await Token.findOne({user: user._id});
        if(existingToken){
            if(!existingToken.isValid){
                throw new CustomError.BadRequestError("Invalid Credentials");
            }
            attachCookiesToResponse({res, user: tokenUser, refreshToken: existingToken.refreshToken});
            return res.status(StatusCodes.OK).json({user: tokenUser});
        }

        const refreshToken = crypto.randomBytes(40).toString('hex');
        const userAgent = req.headers['user-agent'];
        const ip = req.ip;
        const userToken = {refreshToken, ip, userAgent, user: user._id};
        await Token.create(userToken);

        attachCookiesToResponse({res, user: tokenUser, refreshToken});

        return res.status(StatusCodes.OK).json({user: tokenUser});
    } catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({msg: "Authentication Invalid"})
    }
}
module.exports = {
    createCookie
}