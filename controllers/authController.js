const asyncHandler = require("express-async-handler");
const bcrybt = require("bcryptjs")
const { User, validateRegisterUser, validateLoginUser } = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { log } = require("console");

/**------------------------------------------
 * @desc     Register New User
 * @route    /api/auth/register
 * @method   POST
 * @access   public
 ------------------------------------------*/

module.exports.registerUserController = asyncHandler(async (req, res) => {
    //validiation
    const { error } = validateRegisterUser(req.body);
    if (error) {

        return res.status(400).json({ message: error.details[0].message })
    }


    //check if user already exist in DB
    let user = await User.findOne({ email: req.body.email })
    if (user) {
        return res.status(400).json({ message: "user already exist" })
    }


    //hash the password
    const salt = await bcrybt.genSalt(10);
    const hashedPassword = await bcrybt.hash(req.body.password, salt)


    //create new user and save it to DB
    user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
    })
    await user.save()


    //create new verification token and save it to DB
    const verificationToken = new VerificationToken({
        userId: user._id,
        token: crypto.randomBytes(32).toString('hex'),
    })
    await verificationToken.save()



    //create Like
    const link = `https://blog-frontend-sandy-beta.vercel.app/users/${user._id}/verify/${verificationToken.token}`



    //putting the link into an html template
    const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
            <p style="color: #555; font-size: 16px;">Hello,</p>
            <p style="color: #555; font-size: 16px;">
                Thank you for registering! Please verify your email address by clicking the button below.
            </p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${link}" 
                   style="background-color: #28a745; color: #ffffff; padding: 12px 20px; 
                   text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">
                   Verify Email
                </a>
            </div>
            <p style="color: #555; font-size: 14px;">
                If you did not sign up for this account, please ignore this email.
            </p>
            <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} BLOG APP. All rights reserved.
            </p>
        </div>
    </div>
    `


    //sending email to the user
    await sendEmail(user.email, "Verify your email", htmlTemplate)



    //send a response to client
    res.status(201).json({ message: "an email has been sent to your email address, please verify your eamil" })


})


/**------------------------------------------
 * @desc     Login User
 * @route    /api/auth/register
 * @method   POST
 * @access   public
 ------------------------------------------*/

module.exports.loginUserController = asyncHandler(async (req, res) => {
    //validiation
    const { error } = validateLoginUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }


    //check if user already exist in DB
    let user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(404).json({ message: "invalid email or password" })
    }


    //check the password
    const isPasswordMatch = await bcrybt.compare(req.body.password, user.password)
    if (!isPasswordMatch) {
        return res.status(404).json({ message: "invalid email or password" })
    }




    //sendin email (verify account if not verified)
    if (!user.isAccountVerified) {
        let verificationToken = await VerificationToken.findOne({ userId: user._id });
        if (!verificationToken) {
            const verificationToken = new VerificationToken({
                userId: user._id,
                token: crypto.randomBytes(32).toString('hex'),
            })
            await verificationToken.save()
        }

        //create Like
        const link = `https://blog-frontend-sandy-beta.vercel.app/users/${user._id}/verify/${verificationToken.token}`



        //putting the link into an html template
        const htmlTemplate = `
       <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
            <p style="color: #555; font-size: 16px;">Hello,</p>
            <p style="color: #555; font-size: 16px;">
                Thank you for registering! Please verify your email address by clicking the button below.
            </p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${link}" 
                   style="background-color: #28a745; color: #ffffff; padding: 12px 20px; 
                   text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">
                   Verify Email
                </a>
            </div>
            <p style="color: #555; font-size: 14px;">
                If you did not sign up for this account, please ignore this email.
            </p>
            <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} BLOG APP. All rights reserved.
            </p>
        </div>
    </div>
        `


        //sending email to the user
        await sendEmail(user.email, "Verify your email", htmlTemplate)



        return res.status(400).json({ message: "an email has been sent to your email address, please verify your eamil" })

    }


    //generate token (jwt)
    const token = user.generateAuthToken();



    //send a response to client
    res.status(200).json({
        _id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        profilePhoto: user.profilePhoto,
        token: token,
    })


})



/**------------------------------------------
 * @desc     Veify User Account
 * @route    /api/auth/:userid/verify/:token
 * @method   GETT
 * @access   public
 ------------------------------------------*/

module.exports.verifyUserAccountController = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.userId);

    if (!user) {
        return res.status(400).json({ message: "Invalid Link" })
    }


    const verificationToken = await VerificationToken.findOne({
        userId: user._id,
        token: req.params.token
    });

    if (!verificationToken) {

        return res.status(400).json({ message: "Invalid Link" })
    }

    //change user account verification status
    user.isAccountVerified = true;
    await user.save();

    //delete verification token
    await verificationToken.deleteOne();

    //send a response to client
    res.status(200).json({ message: "Your account has been verified. You can now login." })

})