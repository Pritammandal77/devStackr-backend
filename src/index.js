import mongoose from "mongoose"
import connectDB from "./db/index.js"
import dotenv from "dotenv"
import { app } from "./app.js"

//As early as possible in your application, import and configure dotenv
dotenv.config({
    path: './.env'
})

connectDB()
.then(
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
)
.catch((error)=>{
    console.log("Mongo DB connection failed", error)
})