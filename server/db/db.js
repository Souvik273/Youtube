const mongoose = require('mongoose')
const {DB_Name} = require('../src/constants')

const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/`)
        console.log(`MongoDB Connected: ${connectionInstance.connection.host}`)
    }
    catch(error){
        console.log(`MongoDB connection Error: ${error.message}`)
        process.exit(1)
    }
}

module.exports = connectDB