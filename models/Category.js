const mongoose = require('mongoose');
const Joi = require('joi');

const categorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

// Validate create category
function validateCreateCategory(obj) {
    const schema = Joi.object({
        title: Joi.string().required(),
    });

    return schema.validate(obj);
}

module.exports = { validateCreateCategory, Category };