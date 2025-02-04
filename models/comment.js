const mongoose = require('mongoose');
const Joi = require('joi');

// comment schema
const CommentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
}, { timestamps: true });

//Comment model
const Comment = mongoose.model("Comment", CommentSchema);

// Validate create comment
function validateCreateComment(obj) {
    const schema = Joi.object({
        postId: Joi.string().required().label("Post ID"),
        text: Joi.string().required(),
    });

    return schema.validate(obj);
}

// Validate update comment
function validateUpdateComment(obj) {
    const schema = Joi.object({
        text: Joi.string().required(),
    });

    return schema.validate(obj);
}

module.exports = { validateCreateComment, validateUpdateComment, Comment };