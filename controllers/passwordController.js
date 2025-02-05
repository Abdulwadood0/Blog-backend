const asyncHandler = require("express-async-handler");
const bcrybt = require("bcryptjs")
const { User, validateEmail, validateNewPassword } = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { log } = require("console");


/**------------------------------------------
 * @desc     Send Reset Password Link
 * @route    /api/password/reset-password-link
 * @method   POST
 * @access   public
 ------------------------------------------*/

module.exports.sendResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
    //Validation
    const { error } = validateEmail(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }


    //get user from db by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }


    //create a verification token
    let verificationToken = await VerificationToken.findOne({ user: user._id });
    if (!verificationToken) {
        verificationToken = new VerificationToken({
            userId: user._id,
            token: crypto.randomBytes(16).toString('hex')
        });
    }
    await verificationToken.save();



    //create link
    const link = `https://blog-frontend-sandy-beta.vercel.app/reset-password/${user._id}/${verificationToken.token}`;


    // create html template 
    const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
            <p style="color: #555; font-size: 16px;">Hello,</p>
            <p style="color: #555; font-size: 16px;">
                We received a request to reset your password. Click the button below to proceed.
            </p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${link}" 
                   style="background-color: #007bff; color: #ffffff; padding: 12px 20px; 
                   text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">
                   Reset Password
                </a>
            </div>
            <p style="color: #555; font-size: 14px;">
                If you did not request a password reset, please ignore this email.
            </p>
            <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} BLOG APP. All rights reserved.
            </p>
        </div>
    </div>
    `;


    //send email 
    await sendEmail(user.email, 'Reset Password', html);


    // response to client
    res.status(200).json({ message: 'Reset Password Link sent successfully' });



})


/**------------------------------------------
 * @desc     Get Reset Password Link
 * @route    /api/password/reset-password/:userId/:token
 * @method   GET
 * @access   public
 ------------------------------------------*/
module.exports.getResetPasswordLinkCtrl = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    //find token in db
    const verificationToken = await VerificationToken.findOne({
        userId: user._id,
        token: req.params.token
    });

    if (!verificationToken) {
        return res.status(400).json({ message: 'Invalid Link' });
    }

    // response to client
    res.status(200).json({ message: 'Reset Password Link Valid' });
})



/**------------------------------------------
 * @desc     Reset Password 
 * @route    /api/password/reset-password/:userId/:token
 * @method   POST
 * @access   public
 ------------------------------------------*/
module.exports.resetPasswordCtrl = asyncHandler(async (req, res) => {
    //Validation
    const { error } = validateNewPassword(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }


    //get user from db by email
    const user = await User.findById(req.params.userId);
    if (!user) {
        return res.status(400).json({ message: 'Invalid Link' });
    }


    //find token in db
    const verificationToken = await VerificationToken.findOne({
        userId: user._id,
        token: req.params.token
    });
    if (!verificationToken) {
        return res.status(400).json({ message: 'Invalid Link' });
    }


    if (!user.isAccountVerified) {
        user.isAccountVerified = true;
    }


    //hash the password
    const salt = await bcrybt.genSalt(10);
    user.password = await bcrybt.hash(req.body.password, salt);

    //update user in db
    await user.save();


    //delete token from db
    await VerificationToken.findByIdAndDelete(verificationToken._id);


    // response to client
    res.status(200).json({ message: 'Password Reset Successful' });

})