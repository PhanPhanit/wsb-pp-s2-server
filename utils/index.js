const createTokenUser = require('./createTokenUser');
const sendResetPasswordEmail = require('./sendResetPasswordEmail');
const createHash = require('./createHash');
const {
    isTokenValid,
    createJWT,
    createJWTWithExp,
    attachCookiesToResponse,
    cookiesResponse
} = require('./jwt');

module.exports = {
    createTokenUser,
    isTokenValid,
    createJWT,
    createJWTWithExp,
    attachCookiesToResponse,
    cookiesResponse,
    sendResetPasswordEmail,
    createHash
}