const asyncHandler = require("express-async-handler");
const { Comment, validateCreateComment, validateUpdateComment } = require("../models/comment");
const { User } = require("../models/User")

/**------------------------------------------
 * @desc     Create new Comment
 * @route    /api/comments
 * @method   Post
 * @access   private (only logged in user)
 * ------------------------------------------*/
module.exports.createCommentCtrl = asyncHandler(async (req, res) => {


    const { error } = validateCreateComment(req.body);
    if (error) {

        return res.status(400).json({ message: error.details[0].message })
    }
    const profil = await User.findById(req.user._id);

    const comment = await Comment.create({
        postId: req.body.postId,
        user: req.user._id,
        text: req.body.text,
        username: profil.username
    })

    res.status(201).json(comment)
});



/**------------------------------------------
 * @desc     Get All Comment
 * @route    /api/comments
 * @method   GET
 * @access   private (only admin)
 * ------------------------------------------*/
module.exports.getAllCommentCtrl = asyncHandler(async (req, res) => {

    const comments = await Comment.find().populate("user", "-password");

    if (!comments) {
        res.status(404).json({ message: "No comments found" })
    }
    res.status(200).json(comments)
});



/**------------------------------------------
 * @desc     Delete Comment
 * @route    /api/comments/:id
 * @method   Delete
 * @access   private (only user or admin)
 * ------------------------------------------*/
module.exports.deleteCommentCtrl = asyncHandler(async (req, res) => {

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
        res.status(404).json({ message: "comment not found" })
    }

    if (req.user._id === comment.user.toString() || req.user.isAdmin) {

        await Comment.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "comment deleted successfully" })
    } else {
        return res.status(403).json({ message: "not allowed, only User or Admin" })

    }


});




/**------------------------------------------
 * @desc     Update Comment
 * @route    /api/comments/:id
 * @method   Put
 * @access   private (only user)
 * ------------------------------------------*/
module.exports.updateCommentCtrl = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
        res.status(404).json({ message: "comment not found" })
    }

    if (req.user._id === comment.user.toString()) {

        const { error } = validateUpdateComment(req.body);
        if (error) {

            return res.status(400).json({ message: error.details[0].message })
        }
        const updatedComment = await Comment.findByIdAndUpdate(req.params.id, {
            $set: {
                text: req.body.text
            }
        }, { new: true })
        res.status(200).json(updatedComment)
    } else {
        return res.status(403).json({ message: "not allowed, only User himself" })
    }
})