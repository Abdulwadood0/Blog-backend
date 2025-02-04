const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken")
const passwordComplexity = require("joi-password-complexity");

//User shcema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 100,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
    },
    profilePhoto: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
            publicId: null
        }
    },
    bio: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true,

    // Add those two lines to make virtuals works:
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// populate posts that belong to this user when he get his profile (user === _id)
UserSchema.virtual("posts", {
    ref: "Post",
    localField: "_id",
    foreignField: "user",
})
// Generate Auth Token
UserSchema.methods.generateAuthToken = function () {
    return jwt.sign({
        _id: this._id,
        isAdmin: this.isAdmin,
    },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d"
        })

}


//User model
const User = mongoose.model("User", UserSchema)

//Validate Register User
function validateRegisterUser(obj) {
    const shcema = Joi.object({
        username: Joi.string().trim().min(3).max(50).required(),
        email: Joi.string().trim().min(10).max(100).required().email(),
        password: passwordComplexity().required(),
        // password: Joi.string().trim().min(6).required(),
    })

    return shcema.validate(obj);
}

//Validate Login User
function validateLoginUser(obj) {
    const shcema = Joi.object({
        email: Joi.string().trim().min(10).max(100).required().email(),
        password: Joi.string().trim().min(6).required(),
    })

    return shcema.validate(obj);
}


//Validate Update User
function validateUpdateUser(obj) {
    const shcema = Joi.object({
        username: Joi.string().trim().min(3).max(50),
        password: passwordComplexity(),
        // password: Joi.string().trim().min(6),
        bio: Joi.string(),
    })

    return shcema.validate(obj);
}


//Validate Email
function validateEmail(obj) {
    const shcema = Joi.object({
        email: Joi.string().trim().min(10).max(100).required().email(),
    })

    return shcema.validate(obj);
}

//Validate New Password
function validateNewPassword(obj) {
    const shcema = Joi.object({
        // password: Joi.string().trim().min(6).required(),
        password: passwordComplexity().required(),

    })

    return shcema.validate(obj);
}
module.exports = {
    User,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser,
    validateEmail,
    validateNewPassword,
}