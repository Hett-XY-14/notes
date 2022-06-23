const mongoose = require('mongoose')
require('dotenv').config()
const url = process.env.MONGODB_URI

console.log("connecting to" , url)

mongoose
.connect(url)
.then((result) => {
    console.log("connected to MongoDB")
})
.catch((error) => {
    console.log("error connecting to MongoDB: " , error.message)
})

const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minLength: 5
    },
    date: {
        type: Date,
        required: true
    },
    important: Boolean,
})

noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        console.log(returnedObject._id)
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Note', noteSchema)
