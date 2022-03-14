const jwt = require('jsonwebtoken');

const createJWT = ({payload}) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return token;
}

const createJWTWithExp = ({payload}) => {
    console.log(payload);
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: 1000 * 60 * 30});
    return token;
}

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({res, user, refreshToken}) => {
    const accessTokenJWT = createJWT({payload: {user}});
    const refreshTokenJWT = createJWT({payload: {user, refreshToken}});
    const oneDay = 1000 * 60 * 60 * 24;
    // const oneDay = 1000 * 5;
    const longExp = 1000 * 60 * 60 * 24 * 30;
    res.cookie('accessToken', accessTokenJWT, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production',
        signed: true
    })
    res.cookie('refreshToken', refreshTokenJWT, {
        httpOnly: true,
        expires: new Date(Date.now() + longExp),
        secure: process.env.NODE_ENV === 'production',
        signed: true
    })
}


const cookiesResponse = ({res, token}) => {
    const oneDay = 1000 * 60 * 60 * 24;
    res.cookie('wsbToken', token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production',
        signed: true
    })
}

module.exports = {
    createJWT,
    createJWTWithExp,
    isTokenValid,
    attachCookiesToResponse,
    cookiesResponse,
}