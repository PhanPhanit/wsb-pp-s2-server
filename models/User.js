const mongoose = require('mongoose');
const validator  = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        default: ""
    },
    password: {
        type: String,
        default: ""
    },
    googleId: {
        type: String,
        default: ""
    },
    facebookId: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'user'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    passwordToken: {
        type: String,
    },
    passwordTokenExpirationDate: {
        type: Date,
    }
}, {timestamps: true});


UserSchema.pre('save', async function(){
    // console.log(this.modifiedPaths());
    // console.log(this.isModified('name'));
    if(!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

UserSchema.methods.comparePassword = async function(candidatePassword){
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
}


module.exports = mongoose.model('User', UserSchema);