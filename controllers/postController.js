const fs = require("fs")
const path = require("path")
const asyncHandler = require("express-async-handler")
const { Post, validateCreatePost, validateUpdatePost } = require("../models/Post")
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require("../utils/cloudinary")
const { Comment } = require("../models/comment")

/**------------------------------------------
 * @desc     Create new Post
 * @route    /api/posts
 * @method   Post
 * @access   private (only logged in user)
 ------------------------------------------*/

module.exports.createPostCtrl = asyncHandler(async (req, res) => {

    //Validation for image
    if (!req.file) {
        res.status(400).json({ message: "No image provided" })
    }


    //Validations for data
    const { error } = validateCreatePost(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }


    // Upload photo
    // const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    const imagePath = path.join("/tmp/", req.file.filename);
    const result = await cloudinaryUploadImage(imagePath)



    // Create new post and save it to DB
    const post = await Post.create({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        user: req.user._id,
        image: {
            url: result.secure_url,
            publicId: result.public_id
        }
    })


    //Send response to the client
    res.status(201).json({ post })


    //Remove image from the server
    fs.unlinkSync(imagePath)


})


/**------------------------------------------
 * @desc     Get All Posts
 * @route    /api/posts
 * @method   Post
 * @access   public 
 ------------------------------------------*/
module.exports.getAllPostsCtrl = asyncHandler(async (req, res) => {
    const Post_Per_Page = 3;
    const { pageNumber, category } = req.query;
    let posts;

    if (pageNumber) {
        posts = await Post.find()
            .skip((pageNumber - 1) * Post_Per_Page)
            .limit(Post_Per_Page)
            .sort({ createdAt: -1 })
            .populate("user", ["-password"])

    } else if (category) {
        posts = await Post.find({ category }).sort({ createdAt: -1 })
            .populate("user", ["-password"])


    } else {
        posts = await Post.find().sort({ createdAt: -1 })
            .populate("user", ["-password"])
    }
    res.status(200).json(posts)
})


/**------------------------------------------
 * @desc     Get Post
 * @route    /api/posts
 * @method   Post
 * @access   public 
 ------------------------------------------*/
module.exports.getSinglePostCtrl = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
        .populate("user", ["-password"])
        .populate("comments")


    if (!post) {
        return res.status(404).json({ message: "Post not found" })
    }
    res.status(200).json(post)
})


/**------------------------------------------
 * @desc     Get Posts Count
 * @route    /api/posts/count
 * @method   Post
 * @access   public 
 ------------------------------------------*/
module.exports.getPostsCountCtrl = asyncHandler(async (req, res) => {

    const count = await Post.countDocuments()
    res.status(200).json(count)
})


/**------------------------------------------
 * @desc     Delete Post
 * @route    /api/posts/:id
 * @method   Delete
 * @access   private (only user or admin) 
 ------------------------------------------*/
module.exports.deletePostCtrl = asyncHandler(async (req, res) => {
    let post = await Post.findById(req.params.id)

    if (!post) {
        res.status(404).json({ message: "Post not found" })
    }

    if (req.user.isAdmin || req.user._id === post.user.toString()) {
        await Post.findByIdAndDelete(req.params.id)
        await cloudinaryRemoveImage(post.image.publicId)

        //Delete all comments that belongs to the post
        await Comment.deleteMany({ postId: post._id })


        return res.status(200).json({ message: "Post deleted successfully" })
    } else {
        res.status(403).json({ message: "access denied, forbidden" })
    }


})



/**------------------------------------------
 * @desc     Update Post
 * @route    /api/posts/:id
 * @method   PUT
 * @access   private (only user) 
 ------------------------------------------*/
module.exports.UpdatPostCtrl = asyncHandler(async (req, res) => {
    let post = await Post.findById(req.params.id)
        .populate("user", ["-password"])
        .populate("comments");



    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    if (req.user._id !== post.user._id.toString()) {
        return res.status(403).json({ message: "Access denied, forbidden" });
    }

    // Validate update data
    const { error } = validateUpdatePost(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Update post fields
    post.title = req.body.title || post.title;
    post.description = req.body.description || post.description;
    post.category = req.body.category || post.category;

    // Check if a new image is provided
    if (req.file) {
        // Remove old image from cloudinary
        await cloudinaryRemoveImage(post.image.publicId);

        // Upload new image
        const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
        const result = await cloudinaryUploadImage(imagePath);

        // Update post image
        post.image = {
            url: result.secure_url,
            publicId: result.public_id
        };

        // Remove new image from server
        fs.unlinkSync(imagePath);
    }

    // Save updated post to DB
    await post.save();
    console.log(post)
    res.status(200).json(post);
})

/**------------------------------------------
 * @desc     Toggle Like
 * @route    /api/posts/like/:id
 * @method   PUT
 * @access   private (only logged in user) 
 ------------------------------------------*/

module.exports.toggleLikeCtrl = asyncHandler(async (req, res) => {
    let post = await Post.findById(req.params.id);

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user already liked the post
    const isLiked = post.likes.includes(req.user._id);



    // Toggle like
    // if (isLiked) {
    //     post = await Post.findByIdAndUpdate(req.params.id, {
    //         $pull: { likes: req.user._id }
    //     }, { new: true })
    // } else {
    //     post = await Post.findByIdAndUpdate(req.params.id, {
    //         $push: { likes: req.user._id }
    //     }, { new: true })
    // }

    //OR:
    //This approche is better than the above one 
    if (isLiked) {
        post.likes = post.likes.filter(like => like.toString() !== req.user._id);
    } else {
        post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({ post });
});

/**------------------------------------------
 * @desc     Likes Count
 * @route    /api/posts/likes/count
 * @method   GET
 * @access   public () 
 ------------------------------------------*/
module.exports.likesCountCtrl = asyncHandler(async (req, res) => {
    const posts = await Post.findById(req.params.id);
    if (!posts) {
        return res.status(404).json({ message: "Post not found" });
    }

    const likesCount = posts.likes.length;

    res.status(200).json(likesCount);
});
