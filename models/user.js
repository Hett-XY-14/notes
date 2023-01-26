const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            minLenght: 3,
            required:true,
            validate: {
                validator: (entry) => {
                    return /\w{3,20}$/y.test(entry)
                },
                message: 'must be alphanumeric characters only and 3 to 20 characters long'
            },
        },
        name: {
            type: String,
            minLength: 3,
            required:true,
            validate: {
                validator: (entry) => {
                    const result = /\w{3,10}\s{0,1}\w{1,10}$/y.test(entry)
                    return result
                },
                message: 'must be alphanumeric, from 3 to 20 characters long'
            },
        },
        passwordHash: String,
        notes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Note'
            }
        ],
    }
)

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})

const userModel = mongoose.model('User', userSchema)

module.exports = userModel

