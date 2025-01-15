require('dotenv').config()

const connectDB = require('../db/db.js')
const app = require('./app.js')

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000 , ()=>{
            console.log(`DB connection establish !!! \n server is running on : http://localhost:${process.env.PORT || 8000}`)
        })
    })
    .catch((err) => console.error('Failed to connect:', err.message));
