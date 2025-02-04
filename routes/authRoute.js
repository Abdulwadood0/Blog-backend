const router = require("express").Router();
const {
    registerUserController,
    loginUserController,
    verifyUserAccountController,

} = require("../controllers/authController")


// api/auth/register
router.post("/register", registerUserController)

// api/auth/login
router.post("/login", loginUserController)

// api/auth/:userid/verify/:token
router.get("/:userId/verify/:token", verifyUserAccountController)

module.exports = router