const { func } = require("joi");
const jwt = require("jsonwebtoken")

//Verifiy token
function verifiyToken(req, res, next) {
    const authToken = req.headers.authorization;
    if (authToken) {

        const token = authToken.split(" ")[1];

        try {

            const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decodedPayload;
            next()
        } catch (error) {
            return res.status(401).json({ message: "invalid token, access denied" })

        }

    } else {
        return res.status(401).json({ message: "no token provided, access denied" })
    }
}

//Verifiy token And Admin
function verifiyTokenAndAdmin(req, res, next) {
    verifiyToken(req, res, () => {

        if (req.user.isAdmin) {
            next()
        } else {
            return res.status(403).json({ message: "not allowed, only Admin" })

        }
    })
}


//Verifiy token And User
function verifiyTokenAndUser(req, res, next) {

    verifiyToken(req, res, () => {
        if (req.user._id === req.params.id) {
            next()
        } else {
            return res.status(403).json({ message: "not allowed, only User himself" })

        }
    })



}



//Verifiy token And User or Admin
function verifiyTokenAndUserOrAdmin(req, res, next) {

    verifiyToken(req, res, () => {
        if (req.user._id === req.params.id || req.user.isAdmin) {
            next()
        } else {
            return res.status(403).json({ message: "not allowed, only User or Admin" })

        }
    })



}
module.exports = {
    verifiyToken,
    verifiyTokenAndAdmin,
    verifiyTokenAndUser,
    verifiyTokenAndUserOrAdmin,
}