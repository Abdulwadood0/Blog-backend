const router = require("express").Router();
const { createPostCtrl, getAllPostsCtrl, getSinglePostCtrl, getPostsCountCtrl, deletePostCtrl, UpdatPostCtrl, toggleLikeCtrl, likesCountCtrl } = require("../controllers/postController");
const photoUpload = require("../middlewares/photoUpload")
const { verifiyToken } = require("../middlewares/verifiyToken")
const validateObjectId = require("../middlewares/validateObjectId")

// api/posts
router.route("/").post(verifiyToken, photoUpload.single("image"), createPostCtrl)

// api/posts
router.route("/").get(getAllPostsCtrl)

// api/posts/count
router.route("/count").get(getPostsCountCtrl)

// api/posts/:id
router.route("/:id").get(validateObjectId, getSinglePostCtrl)

// api/posts/:id
router.route("/:id").delete(validateObjectId, verifiyToken, deletePostCtrl)

// api/posts/:id
router.route("/:id").put(validateObjectId, verifiyToken, photoUpload.single("image"), UpdatPostCtrl)

// api/posts/like/:id
router.route("/like/:id").put(validateObjectId, verifiyToken, toggleLikeCtrl)

// api/posts/likes/count/:d
router.route("/likes/count/:id").get(likesCountCtrl)

module.exports = router