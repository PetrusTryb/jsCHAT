import mongoose from 'mongoose'
// Load the server
import db from './server'
import User from './user-model.js'
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  try {
    const data = JSON.parse(event.body),
          username = data.username,
          email = data.email,
          password = data.password,
          registeredAt = new Date().getTime().toString(),
          id = mongoose.Types.ObjectId(),
          user = {
            _id: id,
            username: username,
            email: email,
            password: password,
            registeredAt: registeredAt,
            __v: 0
          },
          response = {
            msg: "Account successfully created",
            data: user
          }
    await User.create(user)
return {
      statusCode: 201,
      body: JSON.stringify(response)
    }
  } catch (err) {
    console.log('user.create', err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
}