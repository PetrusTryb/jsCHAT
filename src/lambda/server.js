import mongoose from 'mongoose'
const dotenv = require('dotenv').config()
const dbUrl = process.env.DB_URL,
      dbOptions = {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
      }
function connectToDB(){
	mongoose.connect(dbUrl, dbOptions)
	const db = mongoose.connection
	db.on('error', console.error.bind(console, 'MongoDB connection error:'))
	return db
}
export { connectToDB }