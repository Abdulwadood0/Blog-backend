const path = require("path")
const multer = require("multer")

// Photo storage
const photoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // cb(null, path.join(__dirname, "../images"));
        cb(null, "/tmp/"); // Save files temporarily in /tmp/

    },
    filename: function (req, file, cb) {
        if (file) {
            cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname)
        } else {
            cb(null, false)
        }
    }
});


// Photo Upload Middleware
const photoUpload = multer({
    storage: photoStorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image")) {
            cb(null, true)
        } else {
            cb({ message: "Unsupported file format" }, false)
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 1 megabyte
})

module.exports = photoUpload
