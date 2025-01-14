const mongoose = require('mongoose');
const {DB_Name} = require('../src/constants.js')

const connectDB = async () => {
    try {
        const mongoURI = `${process.env.MONGO_URI}/${DB_Name}`; 
        
        console.log('Connecting to:', mongoURI); 
        
        const connectionInstance = await mongoose.connect(mongoURI);

        console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
