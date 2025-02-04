const express = require("express")
const connectDB = require("./config/connectDB");
const { erroeHandler, notFound } = require("./middlewares/error");
const cors = require('cors');
const xss = require("xss-clean")
const helmet = require("helmet");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");


require("dotenv").config();

// Connect to MongoDM
connectDB()


// Init App
const app = express();


// MiddleWares 
app.use(express.json())


// Helmet to secure Express.js apps by setting various HTTP headers
app.use(helmet());


// Prevent HTTP parameter pollution
app.use(hpp());


// Prevent (xss)
app.use(xss());

// Rate Limit
app.use(rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."  // error message to send
}))


// Cors Policy
app.use(cors({
    origin: 'http://localhost:3000'
}))

//Routes
app.use("/api/auth", require("./routes/authRoute"))

app.use("/api/users", require("./routes/usersRoute"))

app.use("/api/posts", require("./routes/postRoute"))

app.use("/api/comments", require("./routes/commentsRoute"))

app.use("/api/categories", require("./routes/categoryRoute"))

app.use("/api/password", require("./routes/passwordRoute"))

//Error Handler
app.use(notFound);
app.use(erroeHandler);


//Running the Server
const Port = process.env.PORT;
app.listen(Port, () => {
    console.log("Server is running on port ", Port)
})