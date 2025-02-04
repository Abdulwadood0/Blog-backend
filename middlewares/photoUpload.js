// const path = require("path")
// const multer = require("multer")

// // Photo storage
// const photoStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, "../images"));
//     },
//     filename: function (req, file, cb) {
//         if (file) {
//             cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname)
//         } else {
//             cb(null, false)
//         }
//     }
// });


// // Photo Upload Middleware
// const photoUpload = multer({
//     storage: photoStorage,
//     fileFilter: function (req, file, cb) {
//         if (file.mimetype.startsWith("image")) {
//             cb(null, true)
//         } else {
//             cb({ message: "Unsupported file format" }, false)
//         }
//     },
//     limits: { fileSize: 1024 * 1024 } // 1 megabyte
// })

// module.exports = photoUpload


const multer = require("multer");

// Memory storage for file uploads
const storage = multer.memoryStorage();

const photoUpload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image")) {
            cb(null, true);
        } else {
            cb({ message: "Unsupported file format" }, false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // Allow up to 5MB
});

module.exports = photoUpload;
