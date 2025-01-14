require('dotenv').config()

const connectDB = require('../db/db.js')

connectDB()
    .then(() => console.log('Database connection established'))
    .catch((err) => console.error('Failed to connect:', err.message));
