const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/User");
const bcrybt = require("bcryptjs")
const path = require("path");
const { cloudinaryUploadImage, cloudinaryRemoveImage, cloudinaryRemoveMultipleImage } = require("../utils/cloudinary");
const fs = require("fs")
const { Post } = require("../models/Post");
const { Comment } = require("../models/comment");

/**------------------------------------------
 * @desc     Get All Users Profile
 * @route    /api/users/profile
 * @method   GET
 * @access   private (only admin)
 ------------------------------------------*/

module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {

    const users = await User.find().select("-password").populate("posts");;

    res.status(200).json(users);
})

/**------------------------------------------
 * @desc     Get User Profile
 * @route    /api/users/profile/:id
 * @method   GET
 * @access   public
 ------------------------------------------*/

module.exports.getUserProfileCtrl = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id).select("-password")
        .populate("posts");


    if (!user) {
        res.status(404).json({ message: "user not found" })
    }
    res.status(200).json(user);
})


/**------------------------------------------
 * @desc     Update User Profile
 * @route    /api/users/profile/:id
 * @method   PUT
 * @access   private (only user)
 ------------------------------------------*/

module.exports.updateUserProfileCtrl = asyncHandler(async (req, res) => {
    // validate 
    const { error } = validateUpdateUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }

    // check if password updated if so, update it
    if (req.body.password) {
        const salt = await bcrybt.genSalt(10);
        req.body.password = await bcrybt.hash(req.body.password, salt)
        //or
        const hashedPassword = await bcrybt.hash(req.body.password, salt)
    }

    //Update user in DB
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set: {
            username: req.body.username,
            password: req.body.password,
            bio: req.body.bio,
        }
    }, { new: true }).select("-password").populate("posts");

    res.status(200).json(updatedUser);

})


/**------------------------------------------
 * @desc     Get  Users Count
 * @route    /api/users/count
 * @method   GET
 * @access   private (only admin)
 ------------------------------------------*/

module.exports.getUsersCountCtrl = asyncHandler(async (req, res) => {

    const count = await User.countDocuments();

    res.status(200).json(count);
})



/**------------------------------------------
 * @desc     Profile photo upload
 * @route    /api/users/profile/profile-photo-upload
 * @method   Post
 * @access   private (only logged in user)
 ------------------------------------------*/

module.exports.profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
    //Validition
    if (!req.file) {
        res.status(400).json({ message: "No image provided" })
    }

    //Get the path of the image
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)


    //upload to cloudinary
    const result = await cloudinaryUploadImage(imagePath)

    //Get user from DB
    const user = await User.findById(req.user._id)

    //Delete the old profile photo if exist
    if (user.profilePhoto.publicId !== null) {
        await cloudinaryRemoveImage(user.profilePhoto.publicId)
    }

    //change the profilePhoto field in the DB
    user.profilePhoto = {
        url: result.secure_url,
        publicId: result.public_id
    }
    await user.save()

    //Send response to client
    res.status(200).json({
        message: "your profile photo uploaded successfully",
        profilePhoto: { url: result.secure_url, publicId: result.public_id }
    });


    //Delete image from the server
    fs.unlinkSync(imagePath);
})



/**------------------------------------------
 * @desc     Delete User Profil (Account)
 * @route    /api/users/profile/:id
 * @method   Delete
 * @access   private (only admin or user himself)
 ------------------------------------------*/

module.exports.deleteUserCountCtrl = asyncHandler(async (req, res) => {

    //Get user from DB
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404).json({ message: "user not found" })
    }


    //Get all posts from DB
    const posts = await Post.find({ user: user._id });


    //Get the public ids from the posts
    const publicIds = posts?.map(post => post.image.publicId);

    //delete all posts image from cloudinary for the user
    if (publicIds?.length > 0) {
        await cloudinaryRemoveMultipleImage(publicIds)
    }

    //delete the profile picture from cloudinary
    if (user.profilePhoto.publicId !== null) {
        await cloudinaryRemoveImage(user.profilePhoto.publicId)
    }


    //delete user posts & comments
    await Post.deleteMany({ user: user._id })
    await Comment.deleteMany({ user: user._id })

    //delete the user from DB
    await User.findByIdAndDelete(req.params.id)


    //Send a response to the client
    res.status(200).json({ message: "User deleted successfully" });
})