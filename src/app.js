import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors"

const app = express()

//CORS (Cross-Origin Resource Sharing)
//CORS is a security feature in web browsers that controls whether a web page from one domain is allowed 
// to request resources from another domain.
//In backend development, we use CORS to allow or block which frontend websites can access our server or API.
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


//It makes our Express app accept JSON requests up to 16 KB in size — for safety and performance.
app.use(express.json({
    limit: "16kb"
}))


//It is middleware in Express.js that parses incoming URL-encoded form data (like from HTML forms),
// allows nested objects in that data, and limits the size of the request body to 16 kilobytes to 
// prevent excessively large requests.
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

//It is middleware in Express.js that serves static files (like images, CSS, JavaScript files) 
// from the "public" folder so they can be accessed directly by browsers.
//So if we put a file public/image.png, it can be accessed at http://yourserver.com/image.png.
app.use(express.static("public"))

//It is middleware that helps our Express app read cookies sent by users,
// so you can use those cookie values easily in your code.
app.use(cookieParser())


//import routes
import userRouter from './routes/user.routes.js'
import postRouter from './routes/post.routes.js'
import followRouter from "./routes/follow.routes.js"
import commentRouter from "./routes/comment.routes.js"
import chatRouter from "./routes/chat.routes.js"
import messageRouter from "./routes/message.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter)

app.use("/api/v1/posts", postRouter)

app.use("/api/v1/follows", followRouter)

app.use("/api/v1/comments", commentRouter)

app.use("/api/v1/chat", chatRouter)

app.use("/api/v1/message", messageRouter)


export { app }