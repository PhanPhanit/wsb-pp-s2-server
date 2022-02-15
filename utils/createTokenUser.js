const createTokenUser = (user) => {
    return {name: user.name, email: user.email, userId: user._id, role: user.role, isActive: user.isActive};
}

module.exports = createTokenUser;