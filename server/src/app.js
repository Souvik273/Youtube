const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const app = express()

// middlewares 
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(express.json({ limit: "20kb" }))
app.use(express.urlencoded({ extended: true, limit: "20kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// routes import 
const userRouter = require('../routes/user.route.js')

// routes declaration 
app.use('/api/v1/users', userRouter)

module.exports = app