import mongoose from 'mongoose'
const schema = new mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        username: {
          type: String,
          required: [true, 'Please enter Your username.'],
          max: 100,
          unique: true
        },
        email: {
          type: String,
          required: [true, 'Please enter Your email address.'],
          unique: true
        },
        password: {
          type: String,
          required: [true, 'Please enter Your password.']
        },
        registeredAt: {
          type: String,
          required: [true, 'Invalid date.']
        },
        avatar: {
          type: String
        }

      }),
      User = mongoose.model('user', schema)
export default User