import mongoose from '/node_modules/mongoose'
const dotenv = require('dotenv').config()
// Initialize connection to database
const dbUrl = process.env.DB_URL,
      dbOptions = {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
      }
// Set DB from mongoose connection
mongoose.connect(dbUrl, dbOptions)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
export default db