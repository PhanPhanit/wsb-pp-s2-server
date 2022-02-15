const CustomError = require('../errors');

const checkPermissions = (requestUser, resourceId) => {
    if(requestUser.role==='admin') return;
    if(requestUser.role==='manager') return;
    if(requestUser.userId===resourceId.toString()) return;
    throw new CustomError.UnauthenticatedError('Not authorized to access this route');
}

module.exports = checkPermissions;