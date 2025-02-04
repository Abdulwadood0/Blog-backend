const express = require("express");
const router = express.Router();
const { createCommentCtrl, getAllCommentCtrl, deleteCommentCtrl, updateCommentCtrl } = require("../controllers/commentsController");
const { verifiyToken, verifiyTokenAndAdmin, verifiyTokenAndUserOrAdmin } = require("../middlewares/verifiyToken");
const validateObjectId = require("../middlewares/validateObjectId");

// api/comments
router.route("/").post(verifiyToken, createCommentCtrl);

// api/comments
router.route("/").get(verifiyTokenAndAdmin, getAllCommentCtrl);

// api/comments/:id
router.route("/:id").delete(validateObjectId, verifiyToken, deleteCommentCtrl);

// api/comments/:id
router.route("/:id").put(validateObjectId, verifiyToken, updateCommentCtrl);


module.exports = router;