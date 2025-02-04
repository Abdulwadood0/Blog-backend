const mongoose = require("mongoose");

module.exports = async () => {
    try {
        mongoose.connect(process.env.MONGO_CLOUD_URI)
        console.log("Connected successfuly to MongoDB ^_^")
    } catch (error) {
        console.log("failed to connect to MongoDB ", error)
    }
}