const router = require("express").Router();

const { getAllUsersCtrl, getUserProfileCtrl, updateUserProfileCtrl, getUsersCountCtrl, profilePhotoUploadCtrl, deleteUserCountCtrl } = require("../controllers/usersController");
const photoUpload = require("../middlewares/photoUpload");
const validateObjectId = require("../middlewares/validateObjectId");
const { verifiyTokenAndUser, verifiyTokenAndAdmin, verifiyToken, verifiyTokenAndUserOrAdmin } = require("../middlewares/verifiyToken");




// api/users/profil
router.route("/profile",).get(verifiyTokenAndAdmin, getAllUsersCtrl)

// api/users/profile/:id
router.route("/profile/:id",).get(validateObjectId, getUserProfileCtrl)

// api/users/profile/:id
router.route("/profile/:id",).put(validateObjectId, verifiyTokenAndUser, updateUserProfileCtrl)

// api/users/count
router.route("/count",).get(verifiyTokenAndAdmin, getUsersCountCtrl)

// api/users/profile/profile-photo-upload
router.route("/profile/profile-photo-upload",).post(verifiyToken, photoUpload.single("image"), profilePhotoUploadCtrl)

// api/users/profile/:id
router.route("/profile/:id",).delete(validateObjectId, verifiyTokenAndUserOrAdmin, deleteUserCountCtrl)


module.exports = router